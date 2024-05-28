from contextlib import asynccontextmanager
from uuid import UUID
import logging
import os

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional

from chore_repository import ChoreRepository, get_chore_db
from database import create_db_and_tables
from settings import DailyDriveSettings
from user_repository import auth_backend, current_active_user, fastapi_users, UserCreate, UserRead, UserUpdate


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    yield


settings = DailyDriveSettings()
app = FastAPI(lifespan=lifespan, title="Daily Drive", version="0.1.0")
app.mount(settings.backend_public_url,
          StaticFiles(directory=os.path.join(os.path.dirname(__file__),
          "../public")),
          name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


class Chore(BaseModel):
    id: UUID
    name: str
    statuses: Dict[str, bool]
    user_id: Optional[UUID] = None


@app.get("/api/v1/chores", response_model=List[Chore], tags=["chores"])
async def get_chores(chore_repo: ChoreRepository = Depends(get_chore_db),
                     user=Depends(current_active_user)):
    logger.info("Getting all chores for user: %s", user.id)
    return await chore_repo.get_by_user_id(user.id)


@app.post("/api/v1/chores", response_model=Chore, tags=["chores"])
async def add_chore(chore: Chore,
                    chore_repo: ChoreRepository = Depends(get_chore_db),
                    user=Depends(current_active_user)):
    logger.info(f"Adding a chore: {chore}")
    chore.user_id = user.id
    return await chore_repo.add(chore.model_dump(exclude_unset=True))


@app.put("/api/v1/chores/{chore_id}", response_model=Chore, tags=["chores"])
async def update_chore(chore_id: UUID,
                       updated_chore: Chore,
                       chore_repo: ChoreRepository = Depends(get_chore_db),
                       user=Depends(current_active_user)):
    logger.info("Updating a chore for user %s", user.id)
    updated_chore.user_id = user.id
    return await chore_repo.update(chore_id, updated_chore.model_dump())


@app.delete("/api/v1/chores/{chore_id}", response_model=Chore, tags=["chores"])
async def delete_chore(chore_id: UUID,
                       chore_repo: ChoreRepository = Depends(get_chore_db),
                       _=Depends(current_active_user)):
    logger.info("Deleting a chore: %s", chore_id)
    return await chore_repo.delete(chore_id)


@app.post("/api/v1/end_week", tags=["chores"])
async def end_week(chore_repo: ChoreRepository = Depends(get_chore_db)):
    print("Ending the week")


@app.get("/api/v1/protected_route", tags=["users"])
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello, {user.email}!"}



def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
