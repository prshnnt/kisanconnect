from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class DomainError(Exception):
    """Business-rule failure. Routers never build error JSON themselves."""

    def __init__(self, code: str, message: str = "", status: int = 400, **details):
        self.code, self.message, self.status, self.details = code, message or code, status, details


def NotFound(what: str = "resource") -> DomainError:
    return DomainError("NOT_FOUND", f"{what} not found", 404)


def Forbidden(msg: str = "Not allowed") -> DomainError:
    return DomainError("FORBIDDEN", msg, 403)


def Conflict(code: str, msg: str = "") -> DomainError:
    return DomainError(code, msg, 409)


def _body(code: str, message: str, details=None):
    return {"error": {"code": code, "message": message, "details": details or {}}}


def install_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _domain(_: Request, e: DomainError):
        return JSONResponse(_body(e.code, e.message, e.details), status_code=e.status)

    @app.exception_handler(IntegrityError)
    async def _integrity(_: Request, e: IntegrityError):
        """Postgres SQLSTATE 23503 = foreign key violation (a referenced id does not exist); 23505 = unique violation.
        The client sent something inconsistent, so answer 4xx with a stable code instead of leaking a 500."""
        code = getattr(e.orig, "sqlstate", None) or getattr(getattr(e.orig, "__cause__", None), "sqlstate", None)
        if code == "23503":
            return JSONResponse(_body("INVALID_REFERENCE", "A referenced id does not exist"), status_code=422)
        if code == "23505":
            return JSONResponse(_body("ALREADY_EXISTS", "This record already exists"), status_code=409)
        raise e

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, e: RequestValidationError):
        if any(x.get("type") == "json_invalid" for x in e.errors()):
            pos = next((x["loc"][-1] for x in e.errors() if x.get("type") == "json_invalid"), None)
            return JSONResponse(_body("INVALID_JSON", "Request body is not valid JSON", {"position": pos}), status_code=400)
        fields = [{"field": ".".join(map(str, x["loc"][1:])), "msg": x["msg"]} for x in e.errors()]
        return JSONResponse(_body("VALIDATION_ERROR", "Invalid input", {"fields": fields}), status_code=422)
