from datetime import UTC, datetime
from typing import Iterable

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import UUID

from database import get_async_session
from models import Reward
from repository import BaseRepository


def utcnow():
    return datetime.now(UTC)


class RewardRepository(BaseRepository[Reward]):
    @property
    def model(self) -> type[Reward]:
        return Reward

    async def get_by_user_id(self, user_id: UUID) -> Iterable[Reward]:
        result = await self.session.execute(select(self.model).filter(self.model.user_id == user_id))
        entities = result.scalars().all()
        return entities


async def get_reward_db(session=Depends(get_async_session)):
    yield RewardRepository(session)
