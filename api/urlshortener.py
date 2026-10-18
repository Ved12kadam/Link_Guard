"""
URL‑shortener feature (user‑scoped) + SPA catch‑all.

All routes now require a valid `session_id` in the Flask session so every
short‑link is stored *per user*.

Public routes (per logged‑in user):
    GET  /api/urls            – last 10 short URLs for this user
    POST /api/shorten         – create new short URL tied to this user
    GET  /api/redirect?hash   – lookup this user's hash → original URL (JSON)
    (root) /<hash>/...        – 302 redirect or serve React SPA
"""

import base64
import hashlib
from flask import (
    Blueprint,
    logging,
    request,
    jsonify,
    redirect,
    send_from_directory,
    current_app,
    session,
)

from db import (
    fetch_urls,
    add_short_url_to_db,
    get_original_url,
    increment_visit_count,
)

urlshortener_bp = Blueprint("urlshortener", __name__)

# -------------------------------------------------------------------
#  Helper: ensure user is logged‑in
# -------------------------------------------------------------------


# -------------------------------------------------------------------
#  API: recent URLs (per user)
# -------------------------------------------------------------------
@urlshortener_bp.route("/api/urls")
def get_recent_urls():
    sid = session.get("session_id")
    
    shortened_urls = fetch_urls(sid, 10)
    return jsonify({"urls": list(shortened_urls)})

# -------------------------------------------------------------------
#  API: shorten (per user)
# -------------------------------------------------------------------
@urlshortener_bp.route("/api/shorten", methods=["POST"])
def shorten_url():
    sid = session.get("session_id")
    print(f"shorten Session: {sid}")

    data = request.get_json()
    print("Received JSON:", data)

    url_to_shorten = data.get("url_to_shorten")
    custom_hash    = data.get("custom_hash")

    if not url_to_shorten:
        return jsonify({"error": "Missing URL to shorten"}), 400

    if not custom_hash:
        url_bytes   = url_to_shorten.encode("utf-8")
        custom_hash = base64.urlsafe_b64encode(hashlib.sha256(url_bytes).digest())[:5].decode()

    add_short_url_to_db(sid, url_to_shorten, custom_hash)
    return jsonify({"original_url": url_to_shorten, "hash": custom_hash}), 201

# -------------------------------------------------------------------
#  API: resolve JSON (per user)
# -------------------------------------------------------------------
@urlshortener_bp.route("/api/redirect")
def redirect_to_original():
    print("🔄 /api/redirect route hit")
    sid = session.get("session_id")
    print("🔄 session_id:", sid)  # Debug log
    hash_value = request.args.get("hash")
    original   = get_original_url(sid, hash_value)

    if original:
        # ⇨ count the click here
        increment_visit_count(sid, original)
        return jsonify({"original_url": original})

    return jsonify({"original_url": ""}), 404

# -------------------------------------------------------------------
#  Catch‑all: static → hash redirect → React SPA (per user)
# -------------------------------------------------------------------
@urlshortener_bp.route("/<path:path>")
def serve_hash_or_spa(path):
    # static and API passthrough
    if path.startswith("api") or "." in path:
        return send_from_directory(current_app.static_folder, path)

    sid = session.get("session_id")
    if sid:
        original = get_original_url(sid, path)
        if original:
            # 🚫  no increment here – we already did it in /api/redirect
            return redirect(original, 302)

    return send_from_directory(current_app.static_folder, "index.html")
