"""Authentication and credentials service layer."""

from sqlalchemy.orm import Session

from backend.app.core.security import get_password_hash, verify_password
from backend.app.models.user import User
from backend.app.schemas.auth import UserCreate


class AuthService:
    """Service providing user creation and credential verification foundations."""

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, data: UserCreate) -> User:
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            phone=data.phone,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, email: str, password: str) -> User | None:
        user = self.get_user_by_email(email)
        if not user or not verify_password(password, str(user.hashed_password)):
            return None
        return user
