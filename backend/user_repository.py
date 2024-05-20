from typing import Optional, Union
import uuid

from fastapi import Depends, Request
from fastapi_users import FastAPIUsers, BaseUserManager, UUIDIDMixin, schemas
from fastapi_users.authentication import AuthenticationBackend, BearerTransport
from fastapi_users.authentication.strategy.db import AccessTokenDatabase, DatabaseStrategy
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
    SQLAlchemyBaseAccessTokenTableUUID,
)
from pydantic import BaseModel, EmailStr
from repository import BaseRepository
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, get_async_session


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass
#    email = Column(String, unique=True, index=True, nullable=False)
#    hashed_password = Column(String, nullable=False)
#    is_active = Column(Integer, default=True)
#    is_superuser = Column(Integer, default=False)
#    is_verified = Column(Integer, default=False)


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


SECRET = "secret"


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

    async def validate_password(self, password: str, user: Union[UserCreate, User]) -> None:
        return await super().validate_password(password, user)


class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
    pass


# TODO: Do I need user repository? SQLAlchemyUserDatabase is already a repository
class UserRepository(BaseRepository[User]):
    @property
    def model(self) -> User:
        return User

    async def get_by_email(self, email: EmailStr) -> Optional[User]:
        user = await self.session.execute(User).filter(User.email == email)
        entity = user.scalars().first()
        return entity if entity else None

    async def get_by_uuid(self, entity_id: uuid.UUID) -> Optional[User]:
        result = await self.session.execute(User).filter(self.model.id == entity_id)
        entity = result.scalars().first()
        return entity if entity else None


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_access_token_db(session: AsyncSession = Depends(get_async_session),):
    yield SQLAlchemyAccessTokenDatabase(session, AccessToken)


def get_token_database_strategy(
    access_token_db: AccessTokenDatabase[AccessToken] = Depends(get_access_token_db),
) -> DatabaseStrategy:
    return DatabaseStrategy(access_token_db, lifetime_seconds=3600)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


auth_backend = AuthenticationBackend(name = "db", transport = bearer_transport, get_strategy = get_token_database_strategy)


fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
