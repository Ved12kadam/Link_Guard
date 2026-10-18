# signup.py  – user registration via email + password
from flask import Blueprint, request, jsonify, current_app
from db import get_user_by_session_id, create_user
import logging

signup_blueprint = Blueprint("signup_blueprint", __name__)

@signup_blueprint.route("/signup", methods=["POST"])
def signup():
    try:
        # ─── Parse & validate input ─────────────────────────────────────────
        data     = request.json or {}
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # ─── Check if user already exists (email == session_id) ────────────
        if get_user_by_session_id(email):
            return jsonify({"error": "Email already exists"}), 400

        # ─── Hash password & create user via DB helper ─────────────────────
        bcrypt       = current_app.config["bcrypt"]
        hashed_pw    = bcrypt.generate_password_hash(password).decode("utf-8")
        create_user(email=email, hashed_password=hashed_pw)

        logging.info("New user created: %s", email)
        return jsonify({"message": "User created successfully"}), 201

    except Exception as exc:
        logging.error("Signup error: %s", exc, exc_info=True)
        return jsonify({"error": f"Signup failed: {exc}"}), 500