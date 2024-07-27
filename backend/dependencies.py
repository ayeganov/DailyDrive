from fastapi import Depends, HTTPException, status
from .models import User
from .user_repository import current_active_user


def superuser_required(user: User = Depends(current_active_user)):
    print("superuser_required")
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You do not have sufficient privileges"
        )
    return user

