from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


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

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, e: RequestValidationError):
        fields = [{"field": ".".join(map(str, x["loc"][1:])), "msg": x["msg"]} for x in e.errors()]
        return JSONResponse(_body("VALIDATION_ERROR", "Invalid input", {"fields": fields}), status_code=422)
