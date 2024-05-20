from typing import List, Dict
from sqlalchemy import create_engine, Column, BigInteger, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from repository import BaseRepository


Base = declarative_base()


class Chore(Base):
    __tablename__ = 'chores'
    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, index=True)
    statuses = Column(JSON)


class ChoreRepository(BaseRepository[Chore]):
    def __init__(self, session: Session):
        super().__init__(session)

    @property
    def model(self) -> Chore:
        return Chore
