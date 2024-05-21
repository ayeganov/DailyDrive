from contextlib import asynccontextmanager
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from chore_repository import ChoreRepository, get_chore_db
from database import create_db_and_tables
from user_repository import auth_backend, current_active_user, fastapi_users, UserCreate, UserRead, UserUpdate


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


load_dotenv()
public_url: Optional[str] = os.getenv("BACKEND_PUBLIC_URL")
assert public_url is not None, "PUBLIC_URL environment variable is not set"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan, title="Daily Drive", version="0.1.0")
app.mount(public_url,
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
    id: int
    name: str
    statuses: Dict[str, bool]


@app.get("/api/v1/chores", response_model=List[Chore])
async def get_chores(chore_repo: ChoreRepository = Depends(get_chore_db)):
    logger.info("Getting all chores")
    return await chore_repo.get_all()


@app.post("/api/v1/chores", response_model=Chore)
async def add_chore(chore: Chore, chore_repo: ChoreRepository = Depends(get_chore_db)):
    logger.info("Adding a chore")
    return await chore_repo.add(chore.model_dump())


@app.put("/api/v1/chores/{chore_id}", response_model=Chore)
async def update_chore(chore_id: int, updated_chore: Chore, chore_repo: ChoreRepository = Depends(get_chore_db)):
    logger.info("Updating a chore")
    return await chore_repo.update(chore_id, updated_chore.model_dump())


@app.delete("/api/v1/chores/{chore_id}", response_model=Chore)
async def delete_chore(chore_id: int, chore_repo: ChoreRepository = Depends(get_chore_db)):
    logger.info(f"Deleting a chore: {chore_id}")
    return await chore_repo.delete(chore_id)


@app.get("/protected-route", tags=["users"])
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello, {user.email}!"}



def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
