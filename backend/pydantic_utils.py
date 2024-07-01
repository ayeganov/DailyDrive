from typing import Generic, TypeVar, Union

from pydantic import BaseModel


T = TypeVar("T")
E = TypeVar("E")


class Ok(BaseModel, Generic[T]):
    ok: T


class Err(BaseModel, Generic[E]):
    error: E


class GenericResult(BaseModel, Generic[T, E]):
    """
    Generic result model for returning a result or an error
    """

    result: Union[Ok[T], Err[E]]

    class Config:  # pylint: disable=too-few-public-methods
        json_encoders = {
            Ok: lambda v: v.model_dump(),
            Err: lambda v: v.model_dump(),
        }
