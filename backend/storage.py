from abc import ABC, abstractmethod
from typing import List, Dict


class StorageInterface(ABC):

    @abstractmethod
    def get_chores(self) -> List[Dict]:
        pass

    @abstractmethod
    def add_chore(self, chore: Dict) -> Dict:
        pass

    @abstractmethod
    def update_chore(self, chore_id: int, updated_chore: Dict) -> Dict:
        pass

    @abstractmethod
    def delete_chore(self, chore_id: int) -> Dict:
        pass
