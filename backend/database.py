from dataclasses import dataclass
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (AsyncEngine, AsyncSession, async_sessionmaker,
                                    create_async_engine)

from .models import Base, Chore, ChoreHistory, Reward, User


@dataclass
class DBState:
    engine: AsyncEngine | None
    async_session_maker: async_sessionmaker | None

    def init(self, db_url: str):
        print(f"Database URL: {db_url}")
        self.engine = create_async_engine(db_url)
        self.async_session_maker = async_sessionmaker(self.engine, expire_on_commit=False)


db_state = DBState(None, None)


async def create_db_and_tables():
    assert db_state.engine is not None
    async with db_state.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    assert db_state.async_session_maker is not None
    async with db_state.async_session_maker() as session:
        yield session
