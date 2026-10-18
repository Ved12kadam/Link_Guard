from flask import Blueprint, jsonify, session
from db import get_user_by_session_id, get_user_link_stats

mainpage_bp = Blueprint("mainpage", __name__)

@mainpage_bp.route("/mainpage-details", methods=["GET"])
def get_mainpage_details():
    try:
        session_id = session.get("session_id")
        if not session_id:
            return jsonify({"error": "Unauthorized"}), 401

        user = get_user_by_session_id(session_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch profile picture and stats
        profile_picture = user.get("avatar") or "/placeholder.svg?height=40&width=40"
        email = user.get("email")
        name = user.get("name")

        stats = get_user_link_stats(user["id"])  # Return dict with counts like: links_created, threats_blocked, etc.

        return jsonify({
            "name": name,
            "email": email,
            "avatar": profile_picture,
            "stats": stats
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
