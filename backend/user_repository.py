from typing import Optional, Union
import uuid

from fastapi import Depends, Request
from fastapi_users import FastAPIUsers, BaseUserManager, InvalidPasswordException, UUIDIDMixin, schemas
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
#from fastapi_users.authentication.strategy.db import AccessTokenDatabase, DatabaseStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
#from fastapi_users_db_sqlalchemy.access_token import (
#    SQLAlchemyAccessTokenDatabase,
#    SQLAlchemyBaseAccessTokenTableUUID,
#)
from sqlalchemy.ext.asyncio import AsyncSession
from password_validator import PasswordValidator

from database import get_async_session
from models import User


validator = PasswordValidator()
validator.min(8).max(20).uppercase().lowercase().digits()


class UserRead(schemas.BaseUser[uuid.UUID]):
    name: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    name: Optional[str] = None


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
        if not validator.validate(password):
            raise InvalidPasswordException(reason="Password is invalid")
        return await super().validate_password(password, user)


#class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
#    pass


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


#async def get_access_token_db(session: AsyncSession = Depends(get_async_session),):
#    yield SQLAlchemyAccessTokenDatabase(session, AccessToken)
#
#
#def get_token_database_strategy(
#    access_token_db: AccessTokenDatabase[AccessToken] = Depends(get_access_token_db),
#) -> DatabaseStrategy:
#    return DatabaseStrategy(access_token_db, lifetime_seconds=3600)


def get_jwt_strategy():
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600 * 24 * 10)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


auth_backend = AuthenticationBackend(name="jwt",
                                     transport=bearer_transport,
                                     get_strategy=get_jwt_strategy,)


fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
