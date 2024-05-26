from abc import abstractmethod
from typing import Iterable, List, Dict, TypeVar, Generic, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


T = TypeVar('T')


class BaseRepository(Generic[T]):
    def __init__(self, session: AsyncSession):
        self.session = session

    @property
    @abstractmethod
    def model(self) -> type[T]:
        """
        This method should be implemented in the child class and return the SQLAlchemy model
        """

    async def get_all(self) -> Iterable[T]:
        result = await self.session.execute(select(self.model))
        entities = result.scalars().all()
        return entities

    async def get_by_id(self, entity_id: int) -> Optional[T]:
        result = await self.session.execute(select(self.model).filter(self.model.id == entity_id))
        entity = result.scalars().first()
        return entity if entity else None

    async def add(self, entity_data: Dict) -> T:
        entity = self.model(**entity_data)
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def update(self, entity_id: int, updated_data: Dict) -> Optional[T]:
        result = await self.session.execute(select(self.model).filter(self.model.id == entity_id))
        entity = result.scalars().first()
        if entity:
            for key, value in updated_data.items():
                setattr(entity, key, value)
            await self.session.commit()
            await self.session.refresh(entity)
            return entity
        return None

    async def delete(self, entity_id: int) -> Optional[T]:
        result = await self.session.execute(select(self.model).filter(self.model.id == entity_id))
        entity = result.scalars().first()
        if entity:
            await self.session.delete(entity)
            await self.session.commit()
            return entity
        return None
