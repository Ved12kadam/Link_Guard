import datetime
from flask import current_app
from sqlalchemy import text

# ---------------------------------------------------------------------------
#  GET DB ENGINE
# ---------------------------------------------------------------------------
def get_connection():
    return current_app.extensions['sqlalchemy'].engine


# ---------------------------------------------------------------------------
#  USER HELPERS
# ---------------------------------------------------------------------------
def upsert_user(session_id: str, name: str, email: str, avatar: str = "") -> None:
    engine = get_connection()
    now = datetime.datetime.utcnow()

    with engine.begin() as conn:
        conn.execute(
            text("""
            INSERT INTO users (session_id, name, email, avatar, updated)
            VALUES (:session_id, :name, :email, :avatar, :updated)
            ON DUPLICATE KEY UPDATE
                name=:name, email=:email, avatar=:avatar, updated=:updated
            """),
            {
                "session_id": session_id,
                "name": name,
                "email": email,
                "avatar": avatar or "/placeholder.svg?height=40&width=40",
                "updated": now
            }
        )


def get_user_by_session_id(session_id: str):
    engine = get_connection()

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM users WHERE session_id=:session_id"),
            {"session_id": session_id}
        ).fetchone()

    if not result:
        return None

    row = result._mapping

    return {
        "id": session_id,
        "name": row["name"],
        "email": row["email"],
        "avatar": row["avatar"] or "/placeholder.svg?height=40&width=40",
        "password": row.get("password"),
    }


# ---------------------------------------------------------------------------
#  URL HELPERS (per-user)
# ---------------------------------------------------------------------------
def add_short_url_to_db(session_id: str, original_url: str, hash_value: str) -> None:
    engine = get_connection()

    with engine.begin() as conn:
        conn.execute(
            text("DELETE FROM urls WHERE user_session=:session_id AND hash=:hash"),
            {"session_id": session_id, "hash": hash_value}
        )

        conn.execute(
            text("""
            INSERT INTO urls (id, user_session, original_url, hash, timestamp, visits, is_malicious)
            VALUES (:id, :user_session, :original_url, :hash, :timestamp, :visits, :is_malicious)
            """),
            {
                "id": f"{session_id}#{hash_value}",
                "user_session": session_id,
                "original_url": original_url,
                "hash": hash_value,
                "timestamp": datetime.datetime.utcnow(),
                "visits": 0,
                "is_malicious": False
            }
        )


def fetch_urls(session_id: str, limit: int = 50):
    engine = get_connection()

    with engine.connect() as conn:
        results = conn.execute(
            text("""
            SELECT * FROM urls 
            WHERE user_session=:session_id 
            ORDER BY timestamp DESC 
            LIMIT :limit
            """),
            {"session_id": session_id, "limit": limit}
        ).fetchall()

    return [
        {
            "original_url": row._mapping["original_url"],
            "hash": row._mapping["hash"],
            "timestamp": row._mapping["timestamp"],
            "visits": row._mapping["visits"] or 0,
            "is_malicious": row._mapping["is_malicious"] or False,
        }
        for row in results
    ]


def get_original_url(session_id: str, hash_value: str):
    engine = get_connection()

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT original_url FROM urls 
            WHERE user_session=:session_id AND hash=:hash 
            LIMIT 1
            """),
            {"session_id": session_id, "hash": hash_value}
        ).fetchone()

    return result._mapping["original_url"] if result else None


def increment_visit_count(session_id: str, original_url: str) -> None:
    engine = get_connection()

    with engine.begin() as conn:
        result = conn.execute(
            text("""
            SELECT * FROM urls 
            WHERE user_session=:session_id AND original_url=:original_url 
            LIMIT 1
            """),
            {"session_id": session_id, "original_url": original_url}
        ).fetchone()

        if not result:
            return

        row = result._mapping
        now = datetime.datetime.utcnow()
        last_seen = row.get("last_visit")

        if not last_seen or (now - last_seen).total_seconds() > 2:
            conn.execute(
                text("""
                UPDATE urls
                SET visits = visits + 1,
                    last_visit = :now
                WHERE id = :id
                """),
                {"now": now, "id": row["id"]}
            )


# ---------------------------------------------------------------------------
#  DASHBOARD STATS
# ---------------------------------------------------------------------------
def get_user_link_stats(session_id: str):
    engine = get_connection()

    with engine.connect() as conn:
        results = conn.execute(
            text("SELECT * FROM urls WHERE user_session=:session_id"),
            {"session_id": session_id}
        ).fetchall()

    links_created = threats_blocked = total_clicks = 0

    for item in results:
        row = item._mapping
        links_created += 1
        threats_blocked += 1 if row["is_malicious"] else 0
        total_clicks += row["visits"] or 0

    return {
        "links_created": links_created,
        "threats_blocked": threats_blocked,
        "total_clicks": total_clicks,
    }


# ---------------------------------------------------------------------------
#  EXTRA helpers required by signup.py
# ---------------------------------------------------------------------------
def get_user_by_email(email: str):
    return get_user_by_session_id(email)


def create_user(email: str, hashed_password: str, name: str = "", avatar: str = "") -> None:
    engine = get_connection()
    now = datetime.datetime.utcnow()

    with engine.begin() as conn:
        conn.execute(
            text("""
            INSERT INTO users (session_id, name, email, avatar, password, created, updated)
            VALUES (:session_id, :name, :email, :avatar, :password, :created, :updated)
            """),
            {
                "session_id": email,
                "name": name or email.split("@")[0],
                "email": email,
                "avatar": avatar or "/placeholder.svg?height=40&width=40",
                "password": hashed_password,
                "created": now,
                "updated": now
            }
        )


# ---------------------------------------------------------------------------
#  MALICIOUS RESULTS
# ---------------------------------------------------------------------------
def save_malicious_result(session_id: str, url: str, prediction: int, risk: int) -> None:
    engine = get_connection()
    now = datetime.datetime.utcnow()

    with engine.begin() as conn:
        conn.execute(
            text("""
            INSERT INTO malicious (id, user_session, url, prediction, risk, timestamp)
            VALUES (:id, :user_session, :url, :prediction, :risk, :timestamp)
            """),
            {
                "id": f"{session_id}#{now.isoformat()}",
                "user_session": session_id,
                "url": url,
                "prediction": int(prediction),
                "risk": int(risk),
                "timestamp": now
            }
        )

        conn.execute(
            text("""
            DELETE FROM malicious
            WHERE user_session=:session_id
            AND id NOT IN (
                SELECT id FROM (
                    SELECT id FROM malicious
                    WHERE user_session=:session_id
                    ORDER BY timestamp DESC
                    LIMIT 10
                ) temp
            )
            """),
            {"session_id": session_id}
        )