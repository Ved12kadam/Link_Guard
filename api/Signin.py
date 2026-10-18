# signin.py  – email/password + Google-OAuth sign-in
from flask import (
    Blueprint, request, jsonify, session,
    redirect, url_for, current_app
)
import requests, logging, os
from oauthlib.oauth2 import WebApplicationClient
from dotenv import load_dotenv

from db import (
    get_user_by_session_id,   # email == session_id
    upsert_user,              # create / update user record
)

signin_blueprint = Blueprint("signin_blueprint", __name__)

# ─────────────────────────── OAuth / env config ────────────────────────────
load_dotenv()
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

client = WebApplicationClient(GOOGLE_CLIENT_ID)

# ───────────────────────────── Email / password ────────────────────────────
@signin_blueprint.route("/signin", methods=["POST"])
def signin():
    try:
        data     = request.json or {}
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Missing credentials"}), 400

        user = get_user_by_session_id(email)        # email is session_id
        if not user:
            return jsonify({"error": "User not found"}), 404

        stored_pw = user.get("password")
        if not stored_pw:                           # guard against empty / None
            return jsonify({
                "error": "Password not set for this account. Use Google Sign-In."
            }), 400

        bcrypt = current_app.config["bcrypt"]
        if not bcrypt.check_password_hash(stored_pw, password):
            return jsonify({"error": "Invalid credentials"}), 401

        session["session_id"] = email

        logging.info("User logged in via email: %s", email)
        return jsonify({"redirect": "/mainpage"}), 200

    except Exception as e:
        logging.error("Signin error: %s", e, exc_info=True)
        return jsonify({"error": "Signin failed"}), 500

# ───────────────────────────── Google OAuth2 ───────────────────────────────
@signin_blueprint.route("/google-login")
def google_login():
    google_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    auth_uri   = google_cfg["authorization_endpoint"]

    redirect_uri = "http://localhost:5000/google-callback"

    req_uri = client.prepare_request_uri(
        auth_uri,
        redirect_uri=redirect_uri,
        scope=["openid", "email", "profile"],
        prompt="consent",
    )
    return redirect(req_uri)


@signin_blueprint.route("/google-callback")
def google_callback_signin():
    try:
        code = request.args.get("code")

        google_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        token_url  = google_cfg["token_endpoint"]

        redirect_uri = "http://localhost:5000/google-callback"

        tok_req_url, headers, body = client.prepare_token_request(
            token_url,
            authorization_response=request.url,
            redirect_url=redirect_uri,
            code=code,
        )
        token_resp = requests.post(
            tok_req_url,
            headers=headers,
            data=body,
            auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
        )
        client.parse_request_body_response(token_resp.text)

        # Fetch userinfo
        uri, headers, body = client.add_token(google_cfg["userinfo_endpoint"])
        userinfo           = requests.get(uri, headers=headers, data=body).json()

        email  = userinfo["email"].lower()
        name   = userinfo.get("name", "")
        avatar = userinfo.get("picture", "")
        
        existing_user = get_user_by_session_id(email)

        # Create or update user
        upsert_user(session_id=email, name=name, email=email, avatar=avatar)

        session["session_id"] = email

        logging.info("User logged in via Google: %s", email)

        return redirect("http://localhost:3000/mainpage")

    except Exception as e:
        logging.error("Google callback error: %s", e, exc_info=True)
        return jsonify({"error": "Google login failed"}), 500