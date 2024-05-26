from typing import Iterable
from fastapi import Depends
from sqlalchemy import Column, BigInteger, ForeignKey, String, JSON
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship
from sqlalchemy.future import select

from database import Base, get_async_session
from repository import BaseRepository


class Chore(Base):
    __tablename__ = 'chores'
    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, index=True)
    statuses = Column(JSON)
    user_id = Column(ForeignKey('user.id'), nullable=False)
    user = relationship('User', back_populates='chores')


class ChoreRepository(BaseRepository[Chore]):
    @property
    def model(self) -> type[Chore]:
        return Chore

    async def get_by_user_id(self, user_id: str) -> Iterable[Chore]:
        result = await self.session.execute(select(self.model).filter(self.model.user_id == user_id))
        entities = result.scalars().all()
        return entities



async def get_chore_db(session: AsyncSession = Depends(get_async_session)):
    yield ChoreRepository(session)
