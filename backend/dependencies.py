from typing import Annotated, cast
from fastapi import Depends, HTTPException, Request, status
from fastapi.datastructures import State

from .state import DailyDriveState, current_active_user
from .models import User


def get_state(request: Request) -> State:
    """Returns the global FastAPI application state"""
    return request.state


def get_daily_drive_state(state: Annotated[State, Depends(get_state)]) -> DailyDriveState:
    """Returns the DailyDriveState object"""
    return cast(DailyDriveState, state.daily_drive_state)


def superuser_required(user: User = Depends(current_active_user)) -> User:
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You do not have sufficient privileges"
        )
    return user
