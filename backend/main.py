import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated, List, Optional
from uuid import UUID
import uuid

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_users import InvalidID, InvalidPasswordException
from fastapi_users.exceptions import FastAPIUsersException
from pydantic import BaseModel

from .chore_repository import ChoreRepository, ChoreHistoryRepository, get_chore_db, get_chore_history_db
from .database import create_db_and_tables
from .dependencies import superuser_required
from .models import ChoreTable, CurrentReward, UiChore, UiFamily, UiUser, User, UserFamily, UserRewardScores
from .reward_calculator import ChoresResult, find_regularities_with_locations, archive_and_reset_user_chores
from .reward_repository import RewardRepository, get_reward_db
from .settings import DailyDriveSettings
from .user_repository import (FamilyRepository, FamilyResult, UserCreate, UserManager, UserRead, UserUpdate, auth_backend,
                             current_active_user, fastapi_users,
                             get_family_repo, get_user_manager, make_family_error, make_family_result)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    yield


settings = DailyDriveSettings()
app = FastAPI(lifespan=lifespan, title="Daily Drive", version="0.1.0", redirect_slashes=False)
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


@app.get("/api/v1/chores", response_model=List[UiChore], tags=["chores"])
async def get_chores(chore_repo: ChoreRepository = Depends(get_chore_db),
                     user=Depends(current_active_user)):
    logger.info("Getting all chores for user: %s", user.id)
    return await chore_repo.get_by_user_id(user.id)


@app.post("/api/v1/chores", response_model=UiChore, tags=["chores"])
async def add_chore(chore: UiChore,
                    chore_repo: ChoreRepository = Depends(get_chore_db),
                    user=Depends(current_active_user)):
    logger.info(f"Adding a chore: {chore}")
    chore.user_id = user.id
    return await chore_repo.add(chore.model_dump(exclude_unset=True))


@app.put("/api/v1/chores/{chore_id}", response_model=UiChore, tags=["chores"])
async def update_chore(chore_id: UUID,
                       updated_chore: UiChore,
                       chore_repo: ChoreRepository = Depends(get_chore_db),
                       user = Depends(current_active_user)):
    logger.info("Updating a chore for user %s", user.id)
    updated_chore.user_id = user.id
    return await chore_repo.update(chore_id, updated_chore.model_dump())


@app.delete("/api/v1/chores/{chore_id}", response_model=UiChore, tags=["chores"])
async def delete_chore(chore_id: UUID,
                       chore_repo: ChoreRepository = Depends(get_chore_db),
                       _=Depends(current_active_user)):
    logger.info("Deleting a chore: %s", chore_id)
    return await chore_repo.delete(chore_id)


@app.post("/api/v1/end_week", tags=["chores"])
async def end_week(chore_repo: ChoreRepository = Depends(get_chore_db),
                   chore_history_repo: ChoreHistoryRepository = Depends(get_chore_history_db),
                   reward_repo: RewardRepository = Depends(get_reward_db),
                   user = Depends(current_active_user)) -> ChoresResult:
    print(f"Ending the week for user {user.id}")
    result = await archive_and_reset_user_chores(user.id, chore_repo, chore_history_repo, reward_repo)
    print(f"{result=}")
    return result


@app.post("/api/v1/get_scores", tags=["chores"])
async def get_scores(chore_table: ChoreTable,
                     reward_repo: RewardRepository = Depends(get_reward_db),
                     user = Depends(current_active_user)) -> UserRewardScores:
    print("Getting scores")
    print(chore_table)
    week_scores = find_regularities_with_locations(chore_table)
    current_reward = CurrentReward()
    user_reward_score = UserRewardScores(scores=week_scores, reward=current_reward)

    reward = await reward_repo.get_single_by_user_id(user.id)
    if reward is not None:
        user_reward_score.reward = CurrentReward(
            star_points=reward.star_points,
            tv_time_points=reward.tv_time_points,
            game_time_points=reward.game_time_points
        )

    print(f"{user_reward_score=}")
    return user_reward_score


@app.get("/api/v1/protected_route", tags=["users"])
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello, {user.email}!"}


@app.get("/api/v1/users/me", tags=["users"])
async def get_me(user=Depends(current_active_user)) -> UiUser:
    return user


class FamilyCreate(BaseModel):
    name: str


class FamilyAddMember(BaseModel):
    family_id: UUID
    user_create: UserCreate


class FamilyGet(BaseModel):
    family_id: Optional[UUID] = None
    user_id: Optional[UUID] = None


@app.post("/api/v1/families", dependencies=[Depends(superuser_required)])
async def create_family(
    family_create: FamilyCreate,
    family_repo: Annotated[FamilyRepository, Depends(get_family_repo)],
    current_user: Annotated[User, Depends(current_active_user)],
) -> FamilyResult:
    new_family = UserFamily(name=family_create.name, created_by_id=current_user.id)
    new_family.members.append(current_user)
    new_family = await family_repo.add_entity(new_family)
    try:
        result = await make_family_result(new_family, family_repo)
        print(f"Created family: {result}")
        return result
    except Exception as e:
        return make_family_error(str(e))


@app.post("/api/v1/families/members", dependencies=[Depends(superuser_required)])
async def add_family_member(
    family_add_member: FamilyAddMember,
    family_repo: Annotated[FamilyRepository, Depends(get_family_repo)],
    user_manager: Annotated[UserManager, Depends(get_user_manager)],
) -> UiUser:
    try:
        family = await family_repo.get_by_id(family_add_member.family_id)
        if not family:
            raise InvalidID("Family not found")

        if family_add_member.user_create.is_superuser:
            new_user = await user_manager.create(family_add_member.user_create)
        else:
            new_user = await user_manager.create_child(family_add_member.user_create)

        family.members.append(new_user)
        family = await family_repo.update_entity(family)
        return UiUser.model_validate(new_user)
    except InvalidPasswordException:
        raise HTTPException(status_code=400, detail="Password format is invalid")
    except FastAPIUsersException as e:
        raise HTTPException(status_code=400, detail=e.__class__.__name__)


@app.get("/api/v1/families", dependencies=[Depends(superuser_required)])
async def get_family(
    family_repo: Annotated[FamilyRepository, Depends(get_family_repo)],
    user_id: Optional[UUID] = Query(None, description="ID of the user to retrieve families for"),
    family_id: Optional[UUID] = Query(None, description="ID of the family to retrieve"),
) -> FamilyResult:
    if family_id:
        family = await family_repo.get_by_id(family_id)
        if not family:
            return make_family_error("Family not found")
        return await make_family_result(family, family_repo)
    elif user_id:
        families = await family_repo.get_user_families(user_id)
        assert len(families) <= 1, "User has too many families"
        return await make_family_result(families[0], family_repo)
    else:
        return make_family_error("Please provide a family_id or user_id")


def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
