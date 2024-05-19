from typing import List, Dict
from sqlalchemy import create_engine, Column, BigInteger, String, JSON, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from storage import StorageInterface


Base = declarative_base()


class Chore(Base):
    __tablename__ = 'chores'
    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, index=True)
    statuses = Column(JSON)


class PostgresStorage(StorageInterface):
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.session = SessionLocal()
        Base.metadata.create_all(bind=self.engine)

    def get_chores(self) -> List[Dict]:
        return [chore.__dict__ for chore in self.session.query(Chore).all()]

    def add_chore(self, chore: Dict) -> Dict:
        db_chore = Chore(**chore)
        self.session.add(db_chore)
        self.session.commit()
        self.session.refresh(db_chore)
        return db_chore.__dict__

    def update_chore(self, chore_id: int, updated_chore: Dict) -> Dict:
        db_chore = self.session.query(Chore).filter(Chore.id == chore_id).first()
        for key, value in updated_chore.items():
            setattr(db_chore, key, value)
        self.session.commit()
        self.session.refresh(db_chore)
        return db_chore.__dict__

    def delete_chore(self, chore_id: int) -> Dict:
        db_chore = self.session.query(Chore).filter(Chore.id == chore_id).first()
        self.session.delete(db_chore)
        self.session.commit()
        return db_chore.__dict__
