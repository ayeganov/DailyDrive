from abc import abstractmethod
from typing import List, Dict, TypeVar, Generic, Optional
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import as_declarative, declared_attr


T = TypeVar('T')


class BaseRepository(Generic[T]):
    def __init__(self, session: Session):
        self.session = session

    @property
    @abstractmethod
    def model(self) -> T:
        """
        This method should be implemented in the child class and return the SQLAlchemy model
        """

    def get_all(self) -> List[Dict]:
        return [entity.__dict__ for entity in self.session.query(self.model).all()]

    def get_by_id(self, entity_id: int) -> Optional[T]:
        entity = self.session.query(self.model).filter(self.model.id == entity_id).first()
        return entity.__dict__ if entity else None

    def add(self, entity_data: Dict) -> Dict:
        entity = self.model(**entity_data)
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity.__dict__

    def update(self, entity_id: int, updated_data: Dict) -> Dict:
        entity = self.session.query(self.model).filter(self.model.id == entity_id).first()
        for key, value in updated_data.items():
            setattr(entity, key, value)
        self.session.commit()
        self.session.refresh(entity)
        return entity.__dict__

    def delete(self, entity_id: int) -> Dict:
        entity = self.session.query(self.model).filter(self.model.id == entity_id).first()
        self.session.delete(entity)
        self.session.commit()
        return entity.__dict__
