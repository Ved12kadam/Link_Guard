# -----------------------------
# IMPORTS
# -----------------------------
import pandas as pd
import re
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# -----------------------------
# 1. LOAD DATASETS
# -----------------------------
# Kaggle
df1 = pd.read_csv("malicious_phish.csv")
df1['label'] = df1['type'].apply(lambda x: 0 if x == 'benign' else 1)
df1 = df1[['url', 'label']]

# OpenPhish (malicious)
df2 = pd.read_csv("openphish.csv")
df2.columns = ['url']
df2['label'] = 1

# Alexa (safe)
df3 = pd.read_csv("top-1m.csv", names=["rank", "domain"])
df3['url'] = "http://" + df3['domain']
df3['label'] = 0
df3 = df3[['url', 'label']]

# Combine datasets
df = pd.concat([df1, df2, df3], ignore_index=True)


# -----------------------------
# 2. CLEAN URL (IMPORTANT)
# -----------------------------
def clean_url(url):
    url = str(url).lower()
    url = re.sub(r"http[s]?://", "", url)
    url = re.sub(r"www\.", "", url)
    return url.strip()

df['url'] = df['url'].apply(clean_url)

# Remove duplicates
df = df.drop_duplicates(subset='url')

# Remove short URLs
df = df[df['url'].str.len() > 5]


# -----------------------------
# 3. BALANCE DATA
# -----------------------------
safe = df[df['label'] == 0]
mal = df[df['label'] == 1]

min_size = min(len(safe), len(mal))

safe = safe.sample(min_size, random_state=42)
mal = mal.sample(min_size, random_state=42)

df = pd.concat([safe, mal])


# -----------------------------
# 4. SPLIT
# -----------------------------
X = df['url']
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# -----------------------------
# 5. TF-IDF (MATCHES FLASK)
# -----------------------------
vectorizer = TfidfVectorizer(
    analyzer='char',
    ngram_range=(3, 5),
    max_features=3000
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)


# -----------------------------
# 6. MODEL (supports predict_proba)
# -----------------------------
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train_vec, y_train)


# -----------------------------
# 7. EVALUATION
# -----------------------------
y_pred = model.predict(X_test_vec)

print("Accuracy:", accuracy_score(y_test, y_pred))


# -----------------------------
# 8. SAVE FILES (VERY IMPORTANT)
# -----------------------------
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("✅ Model ready for Flask!")