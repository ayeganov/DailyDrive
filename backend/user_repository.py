import uuid
from typing import Optional, Union

from fastapi import Depends, Request
from fastapi_users import (BaseUserManager, FastAPIUsers,
                           InvalidPasswordException, UUIDIDMixin, schemas)
from fastapi_users.authentication import (AuthenticationBackend,
                                          BearerTransport, JWTStrategy)
#from fastapi_users.authentication.strategy.db import AccessTokenDatabase, DatabaseStrategy
from fastapi_users.db import BaseUserDatabase, SQLAlchemyUserDatabase
from fastapi_users.exceptions import InvalidID
from password_validator import PasswordValidator
#from fastapi_users_db_sqlalchemy.access_token import (
#    SQLAlchemyAccessTokenDatabase,
#    SQLAlchemyBaseAccessTokenTableUUID,
#)
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_async_session
from models import User, UserFamily
from repository import BaseRepository

validator = PasswordValidator()
validator.min(8).max(20).uppercase().lowercase().digits()


class UserRead(schemas.BaseUser[uuid.UUID]):
    name: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    name: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    pass


SECRET = "secret"


class FamilyRepository(BaseRepository[UserFamily]):

    @property
    def model(self) -> type[UserFamily]:
        return UserFamily


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    def __init__(self, user_db: BaseUserDatabase, family_repo: FamilyRepository):
        super().__init__(user_db)
        self.family_repo = family_repo

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

    async def create(
        self,
        user_create: schemas.BaseUserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        user_create.is_superuser = True
        user_create.is_verified = True
        safe = False
        user = await super().create(user_create, safe, request)
        return user


    async def create_child(
        self,
        user_create: schemas.BaseUserCreate,
        family_id: uuid.UUID,
        safe: bool = True,
        request: Optional[Request] = None,
    ) -> User:
        user = await super().create(user_create, safe, request)
        family = await self.family_repo.get_by_id(family_id)
        if not family:
            raise InvalidID("Family not found")
        family.members.append(user)
        await self.family_repo.update_entity(family)
        return user


#class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
#    pass


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_family_repo(session: AsyncSession = Depends(get_async_session)):
    yield FamilyRepository(session)


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


async def get_user_manager(user_db=Depends(get_user_db), family_repo=Depends(get_family_repo)):
    yield UserManager(user_db, family_repo)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


auth_backend = AuthenticationBackend(name="jwt",
                                     transport=bearer_transport,
                                     get_strategy=get_jwt_strategy,)


fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])


current_active_user = fastapi_users.current_user(active=True)


async def get_current_user(user: User = Depends(current_active_user)):
    return {"id": str(user.id), "email": user.email, "name": user.name}
