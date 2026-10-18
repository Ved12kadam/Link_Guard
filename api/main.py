from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv

from maliciousdetection import malicious_bp
from urlshortener import urlshortener_bp
from Signin import signin_blueprint
from signout import signout_bp
from signup import signup_blueprint
from mainpage import mainpage_bp    

from flask_sqlalchemy import SQLAlchemy

load_dotenv()

# Initialize DB
db = SQLAlchemy()

# -------------------------------------------------------------------
#  App setup
# -------------------------------------------------------------------
app = Flask(__name__, static_folder="../client/build", static_url_path="/")

CORS(app, supports_credentials=True)

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersecretkey")

# MySQL Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/linkguard'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init DB
db.init_app(app)

# Bcrypt
bcrypt = Bcrypt(app)
app.config["bcrypt"] = bcrypt

# Logging setup (kept as requested)
logging.basicConfig(level=logging.INFO)

# Register blueprints
app.register_blueprint(malicious_bp)
app.register_blueprint(urlshortener_bp)
app.register_blueprint(signin_blueprint)
app.register_blueprint(signout_bp)  
app.register_blueprint(signup_blueprint)
app.register_blueprint(mainpage_bp)

# -------------------------------------------------------------------
#  Run app
# -------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)