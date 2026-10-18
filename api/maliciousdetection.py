"""
FINAL: ML + Rule + Trusted Domain Hybrid URL Detector
"""

import joblib
import pandas as pd
import re
from urllib.parse import urlparse
from flask import Blueprint, request, jsonify, session
from db import save_malicious_result

malicious_bp = Blueprint("malicious", __name__)

# --------------------------------------------------
# LOAD ML MODEL
# --------------------------------------------------
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# --------------------------------------------------
# LOAD TRUSTED DOMAINS (FIXED COLUMN)
# --------------------------------------------------
trusted_df = pd.read_csv("df_1.csv")

# ✅ Correct column
trusted_domains = set(trusted_df["Domain Name"].str.lower())

# --------------------------------------------------
# CLEAN URL (VERY IMPORTANT)
# --------------------------------------------------
def clean_url(url):
    url = url.lower()

    # remove http/https
    url = re.sub(r"http[s]?://", "", url)

    # remove www
    url = re.sub(r"www\.", "", url)

    # remove query params
    url = url.split("?")[0]

    return url.strip()

# --------------------------------------------------
# EXTRACT DOMAIN
# --------------------------------------------------
def get_domain(url):
    domain = urlparse(url).netloc.lower()

    # remove www
    if domain.startswith("www."):
        domain = domain[4:]

    return domain

# --------------------------------------------------
# TRUSTED DOMAIN CHECK (FIXED)
# --------------------------------------------------
def is_trusted(url):
    domain = get_domain(url)

    # check partial match (important)
    return any(td in domain for td in trusted_domains)

# --------------------------------------------------
# RULE-BASED SCORING (BALANCED)
# --------------------------------------------------
def rule_based_score(url):
    score = 0
    url = url.lower()

    # suspicious characters
    if "@" in url:
        score += 25

    if url.count('.') > 4:
        score += 15

    if url.count('/') > 8:
        score += 10

    # long URL
    if len(url) > 100:
        score += 15

    # suspicious keywords
    suspicious_words = ["login", "verify", "bank", "secure", "account", "update"]
    if any(word in url for word in suspicious_words):
        score += 25

    # http vs https
    if url.startswith("http://"):
        score += 10

    return min(score, 100)

# --------------------------------------------------
# MAIN API
# --------------------------------------------------
@malicious_bp.route("/predict", methods=["POST"])
def predict():
    """
    Input:  { "news": "<url>" }
    Output: { prediction, risk, source }
    """

    url = request.json.get("news")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # --------------------------------------------------
    # CLEAN URL FOR ML
    # --------------------------------------------------
    cleaned_url = clean_url(url)

    # --------------------------------------------------
    # ML PREDICTION
    # --------------------------------------------------
    vector = vectorizer.transform([cleaned_url])
    ml_prob = model.predict_proba(vector)[0][1]  # 0 to 1

    # --------------------------------------------------
    # RULE SCORE
    # --------------------------------------------------
    rule_score = rule_based_score(url) / 100

    # --------------------------------------------------
    # TRUSTED DOMAIN ADJUSTMENT (SAFE VERSION)
    # --------------------------------------------------
    if is_trusted(url):
        ml_prob *= 0.3   # reduce risk instead of ignoring

    # --------------------------------------------------
    # FINAL COMBINATION
    # --------------------------------------------------
    final_score = (0.5 * ml_prob) + (0.5 * rule_score)
    risk = int(final_score * 100)

    # --------------------------------------------------
    # FINAL DECISION
    # --------------------------------------------------
    if final_score > 0.75:
        prediction = 1   # malicious
    elif final_score > 0.4:
        prediction = -1  # suspicious
    else:
        prediction = 0   # safe

    result = {
        "prediction": prediction,
        "risk": risk,
        "source": "Hybrid (ML + Rules + Trusted Domain)"
    }

    # --------------------------------------------------
    # SAVE RESULT
    # --------------------------------------------------
    sid = session.get("session_id")
    if sid:
        save_malicious_result(
            sid,
            url,
            result.get("prediction"),
            result.get("risk"),
        )

    return jsonify(result)