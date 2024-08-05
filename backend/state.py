from contextlib import asynccontextmanager
from dataclasses import dataclass
import os
from typing_extensions import AsyncIterator
import uuid

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport
from sqlalchemy.ext.asyncio import AsyncEngine

from backend.user_repository import UserCreate, UserRead, UserUpdate, get_jwt_strategy, get_user_manager

from .database import db_state, DBState
from .models import Base, User
from .settings import DailyDriveSettings


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
auth_backend = AuthenticationBackend(name="jwt",
                                     transport=bearer_transport,
                                     get_strategy=get_jwt_strategy)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)


@dataclass
class DailyDriveState:
    settings: DailyDriveSettings
    db_state: DBState


async def create_db_and_tables(engine: AsyncEngine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[dict[str, DailyDriveState]]:

    settings = DailyDriveSettings()
    app.mount(settings.backend_public_url,
              StaticFiles(directory=os.path.join(os.path.dirname(__file__),
              "../public")),
              name="static")
    db_state.init(settings.database_url)

    app.include_router(
        fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
    )
    app.include_router(
        fastapi_users.get_register_router(UserRead, UserCreate),
        prefix="/auth",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_reset_password_router(),
        prefix="/auth",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_verify_router(UserRead),
        prefix="/auth",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_users_router(UserRead, UserUpdate),
        prefix="/users",
        tags=["users"],
    )

    # Not needed if you setup a migration system like Alembic
    assert db_state.engine is not None
    await create_db_and_tables(db_state.engine)
    yield {"daily_drive_state": DailyDriveState(settings=settings,
                                                db_state=db_state,
          ),}
