import asyncio
from datetime import datetime, timedelta, timezone
import logging
import os
import re
import uuid
from aiogram import Bot, Dispatcher, types, F, Router
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram.filters import Command, StateFilter, BaseFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

import config
from database.orm.messages import orm_add_message, orm_get_messages_by_order_id
from database.orm.users import orm_add_user, orm_get_user, orm_get_user_by_role, orm_update_user
from enums.enums import UserRole
from filters.chat_filters import ChatTypeFilter
from settings.telegram_routers import admin_router

from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from functions.functions import render_text_template
from keybords.inline_kbds import get_custom_callback_btns




bot = Bot(token=os.getenv('API_TOKEN'))
admin_router.message.filter(ChatTypeFilter(['private']))

@admin_router.message(StateFilter('*'), Command("admin"))
async def admin_handler(message: types.Message, state: FSMContext, session: AsyncSession) -> None:
    await state.set_state(None)
    await message.delete()
    user = await orm_get_user(session, telegram_id=message.from_user.id)

    if not user.role == UserRole.ADMIN.value:
        return
    
    await message.answer(
        text=render_text_template(text=config.ADMIN_PANEL_MESSAGE, name=user.name),
    )


@admin_router.callback_query(F.data.startswith("return_admin_panel_"))
async def admin_handler(callback: types.CallbackQuery, state: FSMContext, session: AsyncSession) -> None:
    await state.set_state(None)
    main_message = callback.message.message_id
    user = await orm_get_user(session, telegram_id=callback.from_user.id)

    await bot.edit_message_text(
        chat_id=callback.message.chat.id,
        message_id=main_message,
        text=render_text_template(text=config.ADMIN_PANEL_MESSAGE, name=user.name),
    )
