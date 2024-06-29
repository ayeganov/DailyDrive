from typing import Iterable

from fastapi import Depends
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_async_session
from models import Chore, ChoreHistory
from repository import BaseRepository


class ChoreRepository(BaseRepository[Chore]):
    @property
    def model(self) -> type[Chore]:
        return Chore

    async def get_by_user_id(self, user_id: UUID) -> Iterable[Chore]:
        result = await self.session.execute(select(self.model).filter(self.model.user_id == user_id))
        entities = result.scalars().all()
        return entities


class ChoreHistoryRepository(BaseRepository[ChoreHistory]):
    @property
    def model(self) -> type[ChoreHistory]:
        return ChoreHistory

    async def get_by_user_id(self, user_id: UUID) -> Iterable[ChoreHistory]:
        result = await self.session.execute(select(self.model).filter(self.model.user_id == user_id))
        entities = result.scalars().all()
        return entities


async def get_chore_db(session: AsyncSession = Depends(get_async_session)):
    yield ChoreRepository(session)


async def get_chore_history_db(session: AsyncSession = Depends(get_async_session)):
    yield ChoreHistoryRepository(session)
