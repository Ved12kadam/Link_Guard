from flask import Blueprint, session, jsonify

signout_bp = Blueprint("signout_bp", __name__)

@signout_bp.route("/signout", methods=["POST"])
def signout():
    session.clear()                            # removes session_id and all data
    return jsonify({"message": "Signed out successfully",
                    "redirect": "/signin"}), 200
