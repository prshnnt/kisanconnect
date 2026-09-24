"""CEDA (Centre for Economic Data and Analysis) Agmarknet API Async Client."""

import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class CEDAClient:
    """Async HTTP Client for interacting with CEDA Agmarknet endpoints."""

    def __init__(self, base_url: str | None = None, api_key: str | None = None, timeout: float = 30.0):
        settings = get_settings()
        self.base_url = (base_url or settings.ceda_api_base_url).rstrip("/")
        self.api_key = api_key or settings.ceda_api_key
        self.timeout = timeout

    def _get_headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "KisanConnect/1.0",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["x-api-key"] = self.api_key
        return headers

    async def _request(
        self, method: str, endpoint: str, payload: dict[str, Any] | None = None, retries: int = 1
    ) -> list[dict[str, Any]]:
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()

        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.request(method, url, json=payload, headers=headers)
                    if response.status_code == 429:
                        logger.warning("CEDA API rate limit reached [HTTP 429 %s %s]. Request skipped until quota resets.", method, endpoint)
                        return []
                    response.raise_for_status()
                    res_data = response.json()

                    # Handle response wrappers: {"output": {"data": [...]}} or {"data": [...]}
                    if isinstance(res_data, dict):
                        output = res_data.get("output", res_data)
                        if isinstance(output, dict):
                            return output.get("data", [])
                        elif isinstance(output, list):
                            return output
                    elif isinstance(res_data, list):
                        return res_data
                    return []
            except Exception as exc:
                if attempt < retries:
                    import asyncio
                    await asyncio.sleep(0.5)
                    continue
                logger.error("CEDA API request error [%s %s]: %s", method, endpoint, exc)
                return []
        return []

    async def fetch_commodities(self) -> list[dict[str, Any]]:
        """GET /agmarknet/commodities - Obtain all available commodities."""
        return await self._request("GET", "/agmarknet/commodities")

    async def fetch_geographies(self) -> list[dict[str, Any]]:
        """GET /agmarknet/geographies - Obtain all available states and districts."""
        return await self._request("GET", "/agmarknet/geographies")

    async def fetch_markets(
        self, commodity_id: int, state_id: int, district_id: int, indicator: str = "price"
    ) -> list[dict[str, Any]]:
        """POST /agmarknet/markets - Obtain list of markets for commodity, state, district."""
        payload = {
            "commodity_id": commodity_id,
            "state_id": state_id,
            "district_id": district_id,
            "indicator": indicator,
        }
        return await self._request("POST", "/agmarknet/markets", payload)

    async def fetch_prices(
        self,
        commodity_id: int,
        state_id: int,
        district_ids: list[int] | None = None,
        market_ids: list[int] | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> list[dict[str, Any]]:
        """POST /agmarknet/prices - Obtain prices for commodity."""
        payload: dict[str, Any] = {
            "commodity_id": commodity_id,
            "state_id": state_id,
            "from_date": from_date,
            "to_date": to_date,
        }
        if district_ids:
            payload["district_id"] = district_ids
        if market_ids:
            payload["market_id"] = market_ids

        return await self._request("POST", "/agmarknet/prices", payload)

    async def fetch_quantities(
        self,
        commodity_id: int,
        state_id: int,
        district_ids: list[int] | None = None,
        market_ids: list[int] | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> list[dict[str, Any]]:
        """POST /agmarknet/quantities - Obtain quantities for commodity."""
        payload: dict[str, Any] = {
            "commodity_id": commodity_id,
            "state_id": state_id,
            "from_date": from_date,
            "to_date": to_date,
        }
        if district_ids:
            payload["district_id"] = district_ids
        if market_ids:
            payload["market_id"] = market_ids

        return await self._request("POST", "/agmarknet/quantities", payload)
