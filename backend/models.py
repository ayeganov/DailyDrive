import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Annotated, List, Optional, Tuple

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Table
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
    __abstract__ = True


    @classmethod
    def eager_load_relations(cls):
        return []


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


user_family_association = Table(
    'user_family_association',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('user.id')),
    Column('family_id', UUID(as_uuid=True), ForeignKey('user_family.id'))
)


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"
    name = Column(String, nullable=True)
    chores = relationship("Chore", back_populates="user")
    rewards = relationship("Reward", back_populates="user")
    families = relationship("UserFamily", secondary=user_family_association, back_populates="members")


class UserFamily(Base):
    __tablename__ = "user_family"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    created_by = relationship("User", foreign_keys=[created_by_id])
    members = relationship("User", secondary=user_family_association, back_populates="families")

    @classmethod
    def eager_load_relations(cls):
        return [cls.members]


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


class CurrentReward(BaseModel):
    star_points: int = Field(default_factory=int)
    tv_time_points: int = Field(default_factory=int)
    game_time_points: int = Field(default_factory=int)


class WeekScores(BaseModel):
    horizontal_X_triplets: List[List[Tuple[int, int]]] = Field(default_factory=list)
    horizontal_O_triplets: List[List[Tuple[int, int]]] = Field(default_factory=list)
    vertical_X_triplets: List[List[Tuple[int, int]]] = Field(default_factory=list)
    full_X_columns: List[int] = Field(default_factory=list)
    total_points: int = 0
    total_minutes: int = 0
    money_equivalent: float = 0.0


class UserRewardScores(BaseModel):
    scores: WeekScores
    reward: CurrentReward


class UiChore(BaseModel):
    id: uuid.UUID
    name: str
    statuses: dict[str, str]
    user_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={UUID: str}
    )


class UiUser(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    is_verified: Optional[bool] = None

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={UUID: str}
    )


class UiFamily(BaseModel):
    id: uuid.UUID
    name: str
    created_by_id: uuid.UUID
    members: List[UiUser]

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={UUID: str}
    )
