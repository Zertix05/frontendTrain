from datetime import datetime, timedelta
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
import secrets

from database.models import Users
from enums.enums import ProdamusId, Time
from functions.payment_functions import extend_subscription
from settings.logger import logger


async def orm_add_user(session: AsyncSession, user_data: dict) -> Users:
    new_user = Users(
        telegram_id=user_data.get("telegram_id"),
        username=user_data.get("username"),
        name=user_data.get("name"),
        role=user_data.get("role"),
        requests_number=user_data.get("requests_number"),
        start_subscribe=user_data.get("start_subscribe"),
        end_subscribe=user_data.get("end_subscribe"),
        is_subscribe=user_data.get("is_subscribe"),
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user



async def orm_update_user(session: AsyncSession, telegram_id: int, update_data: dict) -> Users:
    query = select(Users).where(Users.telegram_id == telegram_id)
    result = await session.execute(query)
    user = result.scalar()

    if user:
        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        await session.commit()
        await session.refresh(user)
        return user
    else:
        raise ValueError(f"User with telegram_id {telegram_id} not found.")


async def orm_delete_user(session: AsyncSession, telegram_id: int):
    query = select(Users).where(Users.telegram_id == telegram_id)
    result = await session.execute(query)
    user = result.scalar()

    if user:
        await session.delete(user)
        await session.commit()
    else:
        raise ValueError(f"Users with telegram_id {telegram_id} not found.")


async def orm_get_users(session: AsyncSession):
    query = select(Users)
    result = await session.execute(query)
    return result.scalars().all()


async def orm_get_user(session: AsyncSession, telegram_id: int) -> Users:
    query = select(Users).where(Users.telegram_id == telegram_id)
    result = await session.execute(query)
    return result.scalar()


async def orm_get_user_by_role(session: AsyncSession, role: str):
    query = select(Users).where(Users.role == role)
    result = await session.execute(query)
    return result.scalars().all()

async def orm_get_users_by_subscribe(session: AsyncSession):
    query = select(Users).where(
        Users.end_subscribe.is_not(None),
        (Users.is_subscribe == True)
    )
    result = await session.execute(query)
    all_users = result.scalars().all()
    return all_users

