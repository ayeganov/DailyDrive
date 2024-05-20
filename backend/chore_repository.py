from fastapi import Depends
from sqlalchemy import Column, BigInteger, String, JSON
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, get_async_session
from repository import BaseRepository


class Chore(Base):
    __tablename__ = 'chores'
    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, index=True)
    statuses = Column(JSON)


class ChoreRepository(BaseRepository[Chore]):
    @property
    def model(self) -> Chore:
        return Chore



async def get_chore_db(session: AsyncSession = Depends(get_async_session)):
    yield ChoreRepository(session)
