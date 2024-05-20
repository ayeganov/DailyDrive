from typing import Optional, AsyncGenerator
import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


load_dotenv()


class Base(DeclarativeBase):
    pass


database_url: Optional[str] = os.getenv("DATABASE_URL")
assert database_url is not None, "DATABASE_URL environment variable is not set"


engine = create_async_engine(database_url)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
