from datetime import datetime
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Settings


async def orm_add_setting(session: AsyncSession, add_data: dict) -> Settings:
    new_setting = Settings(
        name=add_data.get("name"),
        value=add_data.get("value"),
    )
    session.add(new_setting)
    await session.commit()
    await session.refresh(new_setting)
    return new_setting



async def orm_update_setting(session: AsyncSession, name: str, update_data: dict) -> Settings:
    query = select(Settings).where(Settings.name == name)
    result = await session.execute(query)
    setting = result.scalar()

    if setting:
        for key, value in update_data.items():
            if hasattr(setting, key):
                setattr(setting, key, value)
        await session.commit()
        await session.refresh(setting)
        return setting
    else:
        raise ValueError(f"Setting with name {name} not found.")


async def orm_delete_setting(session: AsyncSession, name: str):
    query = select(Settings).where(Settings.name == name)
    result = await session.execute(query)
    setting = result.scalar()

    if setting:
        await session.delete(setting)
        await session.commit()
    else:
        raise ValueError(f"Setting with name {name} not found.")


async def orm_get_setting(session: AsyncSession, name: str):
    query = select(Settings).where(Settings.name == name)
    result = await session.execute(query)
    return result.scalar()


async def orm_get_settings(session: AsyncSession):
    query = select(Settings)
    result = await session.execute(query)
    return result.scalars().all()


