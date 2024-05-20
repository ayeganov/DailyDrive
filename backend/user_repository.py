from typing import Optional
from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session
from pydantic import EmailStr
from repository import BaseRepository


class User(SQLAlchemyBaseUserTable[int]):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Integer, default=True)
    is_superuser = Column(Integer, default=False)
    is_verified = Column(Integer, default=False)


class UserRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        super().__init__(session)

    @property
    def model(self) -> User:
        return User

    def get_by_email(self, email: EmailStr) -> Optional[User]:
        user = self.session.query(User).filter(User.email == email).first()
        return user

    def get_by_id(self, entity_id: int) -> Optional[User]:
        user = self.session.query(User).filter(User.id == entity_id).first()
        return user
