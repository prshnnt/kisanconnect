import httpx

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.commodities import State, District , APMC


CEDA_URL = "https://api.ceda.ashoka.edu.in"


async def ingest_geographies(
    session: AsyncSession,
    api_key: str,
) -> None:

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(
        base_url=CEDA_URL,
        headers=headers,
        timeout=30,
    ) as client:

        response = await client.get("/agmarknet/geographies")
        response.raise_for_status()

        data = response.json()

        for state_data in data["geographies"]:

            state_name = state_data["state_name"].strip()

            # Find state by name
            state = await session.scalar(
                select(State).where(
                    State.name == state_name
                )
            )

            # Create state if it doesn't exist
            if state is None:
                state = State(
                    name=state_name,
                    code=None,
                )

                session.add(state)

                # We need state.id before creating districts
                await session.flush()

            # Districts
            for district_data in state_data["districts"]:

                district_name = district_data["district_name"].strip()

                district = await session.scalar(
                    select(District).where(
                        District.name == district_name,
                        District.state_id == state.id,
                    )
                )

                if district is None:
                    session.add(
                        District(
                            name=district_name,
                            state_id=state.id,
                        )
                    )

        await session.commit()


async def ingest_apmcs(
    session: AsyncSession,
    client: httpx.AsyncClient,
    commodity_id: int,
    state_id: int,
    district_id: int,
):
    response = await client.post(
        "/agmarknet/markets",
        json={
            "commodity_id": commodity_id,
            "state_id": state_id,
            "district_id": district_id,
        },
    )

    response.raise_for_status()

    markets = response.json()

    state = await session.get(State, state_id)
    district = await session.get(District, district_id)

    for market in markets:

        name = market["name"].strip()

        existing = await session.scalar(
            select(APMC).where(
                APMC.name == name,
                APMC.state_id == state_id,
            )
        )

        if existing is None:
            session.add(
                APMC(
                    name=name,
                    state_id=state_id,
                    district_id=district_id,
                    apmc_type="enam",
                )
            )

    await session.commit()