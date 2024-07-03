from abc import abstractmethod
from typing import Dict, Generic, Iterable, Optional, TypeVar
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

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

    async def get_by_id(self, entity_id: UUID) -> Optional[T]:
        stmt = select(self.model).filter(self.model.id == entity_id)

        for relation in self.model.eager_load_relations():
            stmt = stmt.options(selectinload(relation))

        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        return entity if entity else None

    async def add(self, entity_data: Dict) -> T:
        entity = self.model(**entity_data)
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def add_entity(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def update(self, entity_id: UUID, updated_data: Dict) -> Optional[T]:
        result = await self.session.execute(select(self.model).filter(self.model.id == entity_id))
        entity = result.scalars().first()
        if entity:
            for key, value in updated_data.items():
                setattr(entity, key, value)
            await self.session.commit()
            await self.session.refresh(entity)
            return entity
        return None

    async def update_entity(self, entity: T) -> T:
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def delete(self, entity_id: UUID) -> Optional[T]:
        result = await self.session.execute(select(self.model).filter(self.model.id == entity_id))
        entity = result.scalars().first()
        if entity:
            await self.session.delete(entity)
            await self.session.commit()
            return entity
        return None
