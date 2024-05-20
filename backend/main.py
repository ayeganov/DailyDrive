import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from chore_repository import ChoreRepository


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


def get_db():
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


@app.get("/api/v1/chores", response_model=List[Chore])
def get_chores(db: Session = Depends(get_db)):
    chore_repo = ChoreRepository(db)
    logger.info("Getting all chores")
    return chore_repo.get_all()


@app.post("/api/v1/chores", response_model=Chore)
def add_chore(chore: Chore, db: Session = Depends(get_db)):
    chore_repo = ChoreRepository(db)
    logger.info("Adding a chore")
    return chore_repo.add(chore.model_dump())


@app.put("/api/v1/chores/{chore_id}", response_model=Chore)
def update_chore(chore_id: int, updated_chore: Chore, db: Session = Depends(get_db)):
    chore_repo = ChoreRepository(db)
    logger.info("Updating a chore")
    return chore_repo.update(chore_id, updated_chore.model_dump())


@app.delete("/api/v1/chores/{chore_id}", response_model=Chore)
def delete_chore(chore_id: int, db: Session = Depends(get_db)):
    chore_repo = ChoreRepository(db)
    logger.info(f"Deleting a chore: {chore_id}")
    return chore_repo.delete(chore_id)


def main():
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
