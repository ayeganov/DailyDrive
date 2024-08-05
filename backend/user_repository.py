from enum import Enum
import uuid
from typing import Optional, Union

from fastapi import Depends, Request
from fastapi_users import (BaseUserManager,
                           InvalidPasswordException, UUIDIDMixin, schemas)
from fastapi_users.authentication import JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from password_validator import PasswordValidator
from pydantic import Json
from sqlalchemy import inspect, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import NO_VALUE, joinedload, selectinload

from backend.pydantic_utils import Err, GenericResult, Ok

from .database import get_async_session
from .models import UiFamily, User, UserFamily, user_family_association
from .repository import BaseRepository

validator = PasswordValidator()
validator.min(8).max(20).uppercase().lowercase().digits()


class UserRead(schemas.BaseUser[uuid.UUID]):
    name: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    name: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    pass


SECRET = "MahKidzR0ckAndTheyNeedGooDHabits"


class FamilyRepository(BaseRepository[UserFamily]):

    @property
    def model(self) -> type[UserFamily]:
        return UserFamily

    async def get_user_families(self, user_id: uuid.UUID) -> list[UserFamily]:
        stmt = select(UserFamily).join(
            user_family_association
        ).where(
            user_family_association.c.user_id == user_id
        ).options(
            joinedload(UserFamily.members)
        )

        result = await self.session.execute(stmt)
        families = result.unique().scalars().all()
        return list(families)


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
        safe: bool = True,
        request: Optional[Request] = None,
    ) -> User:
        user = await super().create(user_create, safe, request)
        return user


def get_jwt_strategy():
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600 * 24 * 10)


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_family_repo(session: AsyncSession = Depends(get_async_session)):
    yield FamilyRepository(session)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


FamilyResult = GenericResult[UiFamily, Json]


class FamilyErrorCode(Enum):
    FAMILY_NOT_FOUND = 1
    FAMILY_ALREADY_EXISTS = 2
    FAMILY_MEMBER_ALREADY_EXISTS = 3
    FAMILY_MEMBER_NOT_FOUND = 4
    FAMILY_MEMBER_NOT_IN_FAMILY = 5
    USER_NOT_IN_FAMILY = 6


async def make_family_result(family: UserFamily, family_repo: FamilyRepository) -> FamilyResult:

    members_loaded = inspect(family).attrs["members"].loaded_value is not NO_VALUE

    if not members_loaded:
        stmt = select(UserFamily).options(selectinload(UserFamily.members)).filter(UserFamily.id == family.id)
        result = await family_repo.session.execute(stmt)
        loaded_family = result.scalar_one()
    else:
        loaded_family = family

    return FamilyResult.model_construct(result=Ok(ok=UiFamily.model_validate(loaded_family)))


def make_family_error(message: str, code: FamilyErrorCode) -> FamilyResult:
    return FamilyResult.model_construct(result=Err(error={"message": message, "code": code}))
