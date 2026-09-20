from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, PlainSerializer

T = TypeVar("T")
# Money/quantity travel as strings in JSON so clients never lose precision.
Dec = Annotated[Decimal, PlainSerializer(lambda v: f"{v:.2f}", return_type=str, when_used="json")]


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Page(BaseModel, Generic[T]):
    items: list[T]
    page: int
    page_size: int
    total: int


class Msg(BaseModel):
    message: str = "ok"


__all__ = ["Dec", "ORM", "Page", "Msg", "date", "datetime"]
