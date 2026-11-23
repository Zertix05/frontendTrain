import asyncio
from datetime import datetime, timedelta, timezone
from calendar import monthrange

import hashlib
import hmac
import html
import os
import re
import uuid
from typing import Optional
from urllib.parse import unquote
from zoneinfo import ZoneInfo
from aiogram import Bot, types
from aiogram.enums import MessageEntityType

from fastapi import HTTPException
from init_data_py import InitData
from sqlalchemy.ext.asyncio import AsyncSession
from aiogram.utils.media_group import MediaGroupBuilder
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from init_data_py.errors.errors import SignInvalidError

from settings.logger import logger

import config
from sqlalchemy import select

from database.engine import session_maker
from database.orm.users import orm_get_user
from keybords.inline_kbds import get_custom_callback_btns
from schemes.payment.schemes import PaymentWebhook

bot = Bot(token=os.getenv('API_TOKEN'))

def get_current_datetime() -> str:
    new_datetime = datetime.now() + timedelta(hours=3)
    return new_datetime.strftime('%d.%m.%Y %H:%M мск')

def render_text_template(text: str, **kwargs) -> str:
    return text.format(**kwargs)


def validate_date_string(date_string):

    if not isinstance(date_string, str):
        return False
    
    parts = date_string.split('.')
    if len(parts) != 3:
        return False
    
    if len(parts[0]) != 2 or not parts[0].isdigit():
        return False
    if len(parts[1]) != 2 or not parts[1].isdigit():
        return False  
    if len(parts[2]) != 4 or not parts[2].isdigit():
        return False
    
    day = int(parts[0])
    month = int(parts[1])
    year = int(parts[2])
    
    if year < 1930 or year > 2017:
        return False
    
    try:
        datetime(year, month, day)
        return True
    except ValueError:
        return False
    

def format_questions(objects):
    return '\n'.join(f"{i}. {obj.name}" for i, obj in enumerate(objects, 1))


def message_to_html(message: types.Message) -> str:

    if not message.text or not message.entities:
        return html.escape(message.text or "")
    
    entities = sorted(message.entities, key=lambda x: x.offset)
    
    html_tags = {
        MessageEntityType.BOLD: ('<b>', '</b>'),
        MessageEntityType.ITALIC: ('<i>', '</i>'),
        MessageEntityType.CODE: ('<code>', '</code>'),
        MessageEntityType.PRE: ('<pre>', '</pre>'),
        MessageEntityType.STRIKETHROUGH: ('<s>', '</s>'),
        MessageEntityType.UNDERLINE: ('<u>', '</u>'),
        MessageEntityType.SPOILER: ('<span class="tg-spoiler">', '</span>'),
        MessageEntityType.BLOCKQUOTE: ('<blockquote>', '</blockquote>'),
        MessageEntityType.EXPANDABLE_BLOCKQUOTE: ('<blockquote expandable>', '</blockquote>'),
        MessageEntityType.TEXT_LINK: ('<a href="{}">', '</a>'),
        MessageEntityType.URL: ('<a href="{}">', '</a>'),
        MessageEntityType.MENTION: ('<a href="tg://user?id={}">', '</a>'),
    }
    
    positions = []
    
    for entity in entities:
        start_pos = entity.offset
        end_pos = entity.offset + entity.length
        
        if entity.type in html_tags:
            if entity.type == MessageEntityType.TEXT_LINK:
                open_tag = html_tags[entity.type][0].format(html.escape(entity.url))
                close_tag = html_tags[entity.type][1]

            elif entity.type == MessageEntityType.URL:
                url_text = message.text[start_pos:end_pos]
                open_tag = html_tags[entity.type][0].format(html.escape(url_text))
                close_tag = html_tags[entity.type][1]

            elif entity.type == MessageEntityType.MENTION:
                if hasattr(entity, 'user') and entity.user:
                    open_tag = html_tags[entity.type][0].format(entity.user.id)
                else:
                    open_tag = html_tags[entity.type][0].format("")
                close_tag = html_tags[entity.type][1]
            else:
                open_tag, close_tag = html_tags[entity.type]
            
            positions.append((start_pos, 0, open_tag))
            positions.append((end_pos, 1, close_tag))
    
    positions.sort(key=lambda x: (x[0], x[1]))
    
    result = []
    last_pos = 0
    
    for pos, priority, tag in positions:
        if pos > last_pos:
            text_part = message.text[last_pos:pos]
            result.append(html.escape(text_part))
        
        result.append(tag)
        last_pos = pos
    
    if last_pos < len(message.text):
        remaining_text = message.text[last_pos:]
        result.append(html.escape(remaining_text))
    
    return ''.join(result)

    

def convert_date(date_string: str, timezone: str = "Europe/Moscow") -> datetime:

    parsed_date = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
    
    aware_date = parsed_date.replace(tzinfo=ZoneInfo(timezone))
    
    return aware_date


def format_int(number: int | float) -> str:
    number = int(number)
    return f"{number:,}".replace(",", " ")
