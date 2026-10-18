# Link Guard

Link Guard is an AI-powered secure and intelligent URL protection system[cite: 4]. The main objective of this platform is to detect malicious links and provide secure URL shortening services[cite: 4]. The system combines Machine Learning, Rule-Based Detection, and Trusted Domain Verification to effectively identify suspicious and phishing URLs[cite: 4].

## 🚀 Key Features

*   **Secure URL Shortening:** Allows users to create shortened URLs securely[cite: 6].
*   **Malicious URL Detection:** Real-time detection of phishing and malicious links[cite: 10].
*   **Risk Analysis:** Generates risk scores and risk percentages for scanned URLs[cite: 8, 10].
*   **Dashboard Analytics:** Provides users with dashboard statistics, link activity tracking, and visit counts[cite: 6].
*   **History Tracking:** Maintains a history of shortened URLs and a scan history of malicious links[cite: 4, 8].
*   **Trusted Domain Checking:** Verifies domains against a whitelist to reduce false detections[cite: 10].

## 💻 Technology Stack

**Frontend**
*   **React JS:** Used for developing a dynamic, responsive user interface including the dashboard, URL scanner, and URL shortener[cite: 11].

**Backend**
*   **Flask:** A lightweight Python web framework used for handling URL scanning requests, shortening operations, and REST APIs[cite: 11].
*   **MySQL:** Used to store user information, shortened URLs, scan history, risk analysis results, and visit statistics[cite: 12].

**Machine Learning**
*   **Scikit-learn:** Utilized for model training, prediction, and feature extraction[cite: 12].
*   **TF-IDF Vectorization:** Converts URLs into numerical feature vectors to identify suspicious patterns[cite: 13].
*   **Random Forest Classifier:** A supervised machine learning algorithm used for high-accuracy URL classification[cite: 13].
*   **Pandas & NumPy:** Used for reading datasets, data cleaning, matrix operations, and manipulation[cite: 13, 14].
*   **Joblib:** Used for saving and loading trained machine learning models and vectorizers to the backend[cite: 14].

## 🧠 Threat Detection Approach

The system uses a hybrid detection approach to improve prediction accuracy and reduce false positives and negatives[cite: 4, 8]. The pipeline includes:
*   **Machine Learning Prediction:** Uses a Random Forest model trained on phishing and safe URL datasets[cite: 4, 10]. 
*   **Rule-Based Analysis:** Analyzes URLs for suspicious patterns such as fake domains, excessive subdomains, insecure HTTP usage, and suspicious keywords[cite: 8].
*   **Trusted Domain Verification:** Cross-checks the URL against a database of known safe domains[cite: 4, 10].

##Sceenshots
<img width="963" height="1300" alt="image" src="https://github.com/user-attachments/assets/185f13c8-9b5c-4c83-a44a-174009db2fe9" />
<img width="949" height="429" alt="image" src="https://github.com/user-attachments/assets/3db847cf-7f92-4136-b603-270e64321588" />
<img width="949" height="429" alt="image" src="https://github.com/user-attachments/assets/0bc92921-56a2-47b3-8974-f62365442a3e" />
<img width="925" height="894" alt="image" src="https://github.com/user-attachments/assets/308d3288-f164-4472-b0b6-e7815358bdc1" />




