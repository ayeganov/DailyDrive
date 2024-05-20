from typing import Optional

from fastapi import Depends, FastAPI
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import JWTAuthentication
from fastapi_users.manager import BaseUserManager
from pydantic import BaseModel, EmailStr

from models import User
from repositories import user_db


SECRET = "SECRET"


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr]
    password: Optional[str]


class UserDB(User, BaseModel):
    id: int
    email: EmailStr
    hashed_password: str
    is_active: bool
    is_superuser: bool
    is_verified: bool


class UserManager(BaseUserManager[UserCreate, UserDB, int]):
    user_db_model = UserDB

    async def get(self, id: int) -> Optional[UserDB]:
        return await user_db.get(id)

    async def get_by_email(self, email: EmailStr) -> Optional[UserDB]:
        return await user_db.get_by_email(email)

    async def create(self, user: UserCreate) -> UserDB:
        user_db = UserDB(**user.dict(), hashed_password=self.password_helper.hash(user.password))
        await user_db.create(user_db)
        return user_db

    async def update(self, user_db: UserDB, update_dict: dict) -> UserDB:
        await user_db.update(user_db, update_dict)
        return user_db


jwt_authentication = JWTAuthentication(secret=SECRET, lifetime_seconds=3600, tokenUrl="auth/jwt/login")


user_manager = UserManager(user_db)

fastapi_users = FastAPIUsers(
    user_manager,
    [jwt_authentication],
    UserCreate,
    UserUpdate,
    UserDB
)
