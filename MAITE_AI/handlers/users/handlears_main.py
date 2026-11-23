
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

import config
from database.orm.messages import orm_add_message, orm_get_messages_by_order_id
from database.orm.settings import orm_get_setting
from database.orm.users import orm_add_user, orm_get_user, orm_get_user_by_role, orm_update_user
from enums.enums import UserRole
from filters.chat_filters import ChatTypeFilter

import keybords.keyboard_btns as btns

from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from functions.functions import render_text_template
from keybords.inline_kbds import get_custom_callback_btns

from settings.logger import logger
from settings.states import StatesNewUser, Statess
from settings.telegram_routers import user_router


user_router.message.filter(ChatTypeFilter(['private']))
bot = Bot(token=os.getenv('API_TOKEN'))


@user_router.message(Command("start"))
async def start_handler(message: types.Message, state: FSMContext, session: AsyncSession) -> None:

    await state.set_state(None)

    args = message.text.split()
    
    if len(args) > 1:
        referral_code = args[1]
        # await handle_referral_start(message, state, session, referral_code)
        return
    
    user = await orm_get_user(session=session, telegram_id=message.from_user.id)

    if not user:
        # await new_user_handler(message, state, session)
        pass
    
    elif not user.is_subscribe and user.requests_number == 0:
        # await less_subscribe_handler(message, state, session
        pass

    elif user.requests_number or user.is_subscribe:
        await message.answer(
            text=render_text_template(text=config.ASK_GRT_MESSAGE, name=user.name),
            parse_mode='HTML',
            reply_markup=get_custom_callback_btns(
                        btns=btns.USER_PANEL_BTNS,
                        layout=btns.USER_PANEL_LAYOUT
                    )
        )
        await state.set_state(Statess.Ask_AI)


@user_router.callback_query(F.data.startswith("return_to_bot_"))
async def personal_panel_handler(callback: types.CallbackQuery, state: FSMContext, session: AsyncSession):
    await state.set_state(None)
    main_message = callback.message.message_id
    await state.update_data(main_message=main_message)
    user = await orm_get_user(session=session, telegram_id=callback.from_user.id)

    pass