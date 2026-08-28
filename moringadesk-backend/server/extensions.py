"""Shared extension instances.

These are created here (unbound) and wired to the app inside the
create_app() factory in __init__.py. Keeping them in their own module
avoids circular imports between the app, the models and the routes.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

db = SQLAlchemy()        # the ORM / database layer
migrate = Migrate()      # database migrations (schema versioning)
jwt = JWTManager()       # JSON Web Token auth
bcrypt = Bcrypt()        # password hashing
cors = CORS()            # lets the React frontend call this API
