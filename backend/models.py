import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Annotated, List, Tuple

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from pydantic import BaseModel, Field
from sqlalchemy import JSON, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.types import Date, Float, Integer


def utcnow():
    return datetime.now(UTC)


def get_current_week_start() -> date:
    today: date = datetime.now(UTC).date()
    start_of_week: date = today - timedelta(days=today.weekday())
    return start_of_week


class Base(DeclarativeBase):
    pass


class Chore(Base):
    __tablename__ = 'chores'
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, index=True)
    statuses = Column(JSON)
    user_id = Column(ForeignKey('user.id'), nullable=False)
    week_start_date = Column(Date, nullable=False, default=get_current_week_start)
    utcnow = lambda: datetime.now(UTC)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    reward_func = Column(String, nullable=True)

    user = relationship('User', back_populates='chores')


class ChoreHistory(Base):
    __tablename__ = 'chore_history'
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    chore_id = Column(ForeignKey('chores.id'), nullable=False)
    user_id = Column(ForeignKey('user.id'), nullable=False)
    week_start_date = Column(Date, nullable=False)
    statuses = Column(JSON, nullable=False)
    expired_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    reward_func = Column(String, nullable=True)


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"
    name = Column(String, nullable=True)
    chores = relationship("Chore", back_populates="user")
    rewards = relationship("Reward", back_populates="user")


class Reward(Base):
    __tablename__ = 'rewards'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    star_points = Column(Integer, nullable=False, default=0)
    tv_time_points = Column(Float, nullable=False, default=0)
    game_time_points = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship('User', back_populates='rewards')


class ChoreTable(BaseModel):
    table: List[Annotated[List[str], Field(min_length=7, max_length=7)]]


class WeekScores(BaseModel):
    horizontal_X_triplets: List[List[Tuple[int, int]]] = Field(default_factory=list)
    horizontal_O_triplets: List[List[Tuple[int, int]]] = Field(default_factory=list)
    vertical_X_triplets: List[List[Tuple[int, int]]] = Field(default_factory=list)
    full_X_columns: List[int] = Field(default_factory=list)
    total_points: int = 0
    total_minutes: int = 0
    money_equivalent: float = 0.0
