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
import traceback
from settings.logger import logger


import config
from database.orm.messages import orm_add_message, orm_get_messages_by_order_id
from database.orm.users import orm_add_user, orm_get_user, orm_get_user_by_role, orm_update_user
from enums.enums import UserRole
from filters.chat_filters import ChatTypeFilter

from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from functions.functions import render_text_template
from handlers.users.handlers_less_subscribe import less_subscribe_handler
from keybords.inline_kbds import get_custom_callback_btns
from settings.states import StatesNewUser, Statess
from settings.telegram_routers import ai_router


bot = Bot(token=os.getenv('API_TOKEN'))
ai_router.message.filter(ChatTypeFilter(['private']))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

@ai_router.message(Statess.Ask_AI, F.text)
async def ai_handler(message: types.Message, state: FSMContext, session: AsyncSession) -> None:
    logger.info(f"🔵 AI Handler START: msg_id={message.message_id}, user={message.from_user.id}")

    user = await orm_get_user(session, telegram_id=message.from_user.id)
    if not user.is_subscribe and user.requests_number == 0:
        await less_subscribe_handler(message=message, state=state, session=session)
        return
    
    if user.requests_number > 0:
        new_requests = user.requests_number - 1
        update_data = {
            "requests_number": new_requests
        }
        await orm_update_user(session, telegram_id=message.from_user.id, update_data=update_data)

    messages_data = {
        "role": UserRole.USER.value,
        "message_id": message.message_id,
        "chat_id": message.chat.id,
        "text": message.text,
    }
    await orm_add_message(session, messages_data)

    last_user_messages = await orm_get_messages_by_order_id(session, chat_id=message.from_user.id, page=1, limit=5, role=UserRole.USER.value)
    last_bot_messages = await orm_get_messages_by_order_id(session, chat_id=message.from_user.id, page=1, limit=5, role=UserRole.BOT.value)
    

    information_about_user = render_text_template(
        text=config.INFORMATION_ABOUT_USER_MESSAGE,
        user=user
    )
    
    await message.bot.send_chat_action(chat_id=message.chat.id, action="typing")


    try:
        await message.bot.send_chat_action(chat_id=message.chat.id, action="typing")
        await asyncio.sleep(3)



        # messages_data = {
        #     "role": UserRole.BOT.value,
        #     "message_id": bot_answer.message_id,
        #     "chat_id": bot_answer.chat.id,
        #     "text": resize_answer,
        # }
        # await orm_add_message(session, messages_data)
        

    except Exception as e:
        error_message = config.AI_ERROR_MESSAGE
        bot_answer = await message.answer(error_message)
        
        logger.error(f"AI API Error: {type(e).__name__}: {str(e)}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
