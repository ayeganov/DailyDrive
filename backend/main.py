import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional

from storage import StorageInterface
from postgres_storage import PostgresStorage


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


load_dotenv()
app = FastAPI()


database_url: Optional[str] = os.getenv("DATABASE_URL")
public_url: Optional[str] = os.getenv("BACKEND_PUBLIC_URL")

assert public_url is not None, "PUBLIC_URL environment variable is not set"
assert database_url is not None, "DATABASE_URL environment variable is not set"


app.mount(public_url,
          StaticFiles(directory=os.path.join(os.path.dirname(__file__),
          "../public")),
          name="static")


storage: StorageInterface = PostgresStorage(database_url)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Chore(BaseModel):
    id: int
    name: str
    statuses: Dict[str, bool]


@app.get("/api/chores", response_model=List[Chore])
def get_chores():
    return storage.get_chores()


@app.post("/api/chores", response_model=Chore)
def add_chore(chore: Chore):
    return storage.add_chore(chore.model_dump())


@app.put("/api/chores/{chore_id}", response_model=Chore)
def update_chore(chore_id: int, updated_chore: Chore):
    return storage.update_chore(chore_id, updated_chore.model_dump())


@app.delete("/api/chores/{chore_id}", response_model=Chore)
def delete_chore(chore_id: int):
    return storage.delete_chore(chore_id)


def main():
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
