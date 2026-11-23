from datetime import datetime
from sqlalchemy import asc, desc, func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Messages


async def orm_add_message(session: AsyncSession, messages_data: dict) -> Messages:
    new_message = Messages(
        role=messages_data.get("role"),
        message_id=messages_data.get("message_id"),
        chat_id=messages_data.get("chat_id"),
        text=messages_data.get("text"),
    )
    session.add(new_message)
    await session.commit()
    await session.refresh(new_message)
    return new_message


async def orm_delete_message(session: AsyncSession, chat_id: int, message_id: int):
    query = select(Messages).where(
        Messages.chat_id == chat_id,
        Messages.message_id == message_id
        )
    result = await session.execute(query)
    message = result.scalar()

    if message:
        await session.delete(message)
        await session.commit()
    else:
        raise ValueError(f"Message with chat_id {chat_id} not found.")


async def orm_get_messages_by_order_id(session: AsyncSession, chat_id: int, page: int, limit: int, role: str):
    offset = (page - 1) * limit

    count_query = select(func.count()).where(Messages.chat_id == chat_id)
    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    query = (
        select(Messages)
        .where(Messages.chat_id == chat_id, Messages.role == role)
        .order_by(desc(Messages.created))
        .offset(offset)
        .limit(limit)
    )

    result = await session.execute(query)
    messages = result.scalars().all()

    return messages


async def orm_get_last_message(session: AsyncSession, chat_id: int):
    query = (
        select(Messages)
        .where(Messages.chat_id == chat_id)
        .order_by(Messages.created.desc())
        .limit(1)
    )
    result = await session.execute(query)
    return result.scalar_one_or_none()