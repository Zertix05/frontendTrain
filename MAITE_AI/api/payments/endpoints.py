from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import traceback
from typing import List, Optional, Union
import os
from uuid import UUID
import logging

from aiogram import Bot
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ContentType

from database.orm.settings import orm_get_setting
from database.orm.tariffs import orm_get_tariff, orm_get_tariff_by_id
from enums.enums import PaymentStatus, SettingsModel
from functions.functions import convert_date, extract_tariff_id_from_order, extract_telegram_id_from_order, get_days_remaining, render_text_template
import keybords.keyboard_btns as btns
from dotenv import find_dotenv, load_dotenv
from fastapi import APIRouter, Body, Depends, HTTPException, Header, Path, Request, Response
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import DateTime
import config
from database.engine import session_maker
from database.orm.orders import orm_add_order, orm_get_order, orm_get_order_by_profile_id, orm_update_order
from database.orm.payments import orm_add_payment, orm_get_payment, orm_get_payment_by_order_num, orm_update_payment
from database.orm.users import orm_get_user, orm_update_user
from keybords.inline_kbds import get_custom_callback_btns
from schemes.payment.schemes import PaymentWebhook
from settings.logger import logger


bot = Bot(token=os.getenv('API_TOKEN'))

router_payment = APIRouter(prefix="", tags=["Payments"], )

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


API_TOKEN = os.getenv("API_TOKEN")  
PRODAMUS_SECRET_KEY = os.getenv("PRODAMUS_SECRET_KEY")

@router_payment.post("/webhook/prodamus")
async def prodamus_webhook(request: Request):
    try:
        content_type = request.headers.get('content-type', '')
        body = await request.body()
        print(f"Raw body: {body}")
        print(f"Content-Type: {content_type}")
        
        if 'application/json' in content_type:
            json_data = await request.json()
        elif 'application/x-www-form-urlencoded' in content_type or 'multipart/form-data' in content_type:
            form_data = await request.form()
            json_data = dict(form_data)
        else:
            import json
            try:
                json_data = json.loads(body.decode('utf-8'))
            except json.JSONDecodeError:
                from urllib.parse import parse_qs
                parsed = parse_qs(body.decode('utf-8'))
                json_data = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}
        
        print(f"Запрос на сервер: {json_data}")

        async with session_maker() as session:            
            order_id = json_data.get("order_num")     # '783863558_...' (ID заказа)
            order_num = json_data.get("order_id")     # '36569057' (ID платежа в Prodamus)
            
            customer_phone = json_data.get("customer_phone")
            customer_email = json_data.get("customer_email")
            customer_extra = json_data.get("customer_extra")
            payment_type = json_data.get("payment_type")
            
            is_test_payment = (order_id == "test")
            
            subscription = json_data.get("subscription")
            
            if isinstance(subscription, str):
                import json
                try:
                    subscription = json.loads(subscription)
                except:
                    subscription = None

            if subscription:
                action_code = subscription.get("action_code")
                if action_code == "deactivation" or action_code == "finish":
                    user_order = await orm_get_order(session, order_id=order_id)
                    user = await orm_get_user(session, telegram_id=user_order.telegram_id)
                    days = get_days_remaining(str(user.end_subscribe))

                    await bot.send_message(
                        chat_id=user_order.telegram_id,
                        text=render_text_template(
                            text=config.SUCCESS_DEACTIVATE_SUBSCRIBE_MESSAGE,
                            days=days
                        ),
                        reply_markup=get_custom_callback_btns(
                            btns=btns.RETURN_PERSONAL_ACCOUNT_BTNS,
                            layout=btns.RETURN_PERSONAL_ACCOUNT_LAYOUT
                        )
                    )
                    await orm_update_user(session, telegram_id=user.telegram_id, update_data={"tariff_id": None})
                    return Response(content="OK", status_code=200)
                    
            
            is_subscription_payment = subscription is not None
            
            payment_status = json_data.get("payment_status")
            payment_status_description = json_data.get("payment_status_description")
            
            if not payment_status and subscription:
                action_code = subscription.get("action_code")
                if action_code == "auto_payment":
                    payment_status = "success"
                    payment_status_description = "Автоплатеж по подписке"
                else:
                    payment_status = "pending"
                    payment_status_description = "Ожидание оплаты"
            elif not payment_status:
                payment_status = "pending"
                payment_status_description = "Статус не определен"
            
            if subscription:
                subscription_id = subscription.get("id")
                subscription_cost = subscription.get("cost")
                profile_id = subscription.get("profile_id")
                autopayment = int(subscription.get("autopayment", 0))
                subscription_date_next_payment = subscription.get("date_next_payment")
                next_subscribe_date = convert_date(subscription_date_next_payment) if subscription_date_next_payment else None
            else:
                subscription_id = None
                subscription_cost = None
                profile_id = None
                autopayment = 0
                next_subscribe_date = None
            
            existing_payment = await orm_get_payment_by_order_num(session, order_num=order_num)
            
            if not existing_payment:
                payment_data = {
                    "order_id": order_id,
                    
                    "order_num": order_num,
                    
                    "customer_phone": customer_phone,
                    "customer_email": customer_email,
                    "customer_extra": customer_extra,
                    "payment_type": payment_type,
                    "payment_status": payment_status,
                    "payment_status_description": payment_status_description,
                    "subscription_id": subscription_id,
                    "profile_id": profile_id,
                    "subscription_cost": subscription_cost,
                }
                await orm_add_payment(session, add_data=payment_data)
                print(f"✅ Добавлен платёж: order_num={order_num} (Prodamus ID), order_id={order_id} (наш ID), autopayment={autopayment}")
            else:
                print(f"⚠️ Платёж order_num={order_num} уже обработан ранее")
                return Response(content="already_processed", status_code=200)
            
            if payment_status == PaymentStatus.SUCCESS.value or payment_status == "success":
                
                if is_test_payment:
                    telegram_id = 783863558
                    send_message = f"🧪 ТЕСТОВЫЙ ПЛАТЕЖ\n\n{config.SUCCESS_PAYMENT_MESSAGE}"
                    keyboard = None
                
                # ============================================================
                # РАЗОВЫЙ ПЛАТЁЖ (БЕЗ ПОДПИСКИ) - УСПЕШНЫЙ
                # ============================================================
                elif not is_subscription_payment:
                    telegram_id = extract_telegram_id_from_order(order_id=order_id)
                    tariff_id = extract_tariff_id_from_order(order_id=order_id)
                    
                    if not telegram_id:
                        print(f"❌ Не удалось извлечь telegram_id из order_id: {order_id}")
                        return Response(content="Сторонний платёж", status_code=200)
                    
                    if not tariff_id:
                        print(f"❌ Не удалось извлечь tariff_id из order_id: {order_id}")
                        return Response(content="Сторонний платёж", status_code=200)
                    
                    tariff = await orm_get_tariff_by_id(session, int(tariff_id))

                    update_data = {
                        "requests_number": tariff.requests,
                        "tariff_id": int(tariff_id)
                    }

                    await orm_update_user(session, telegram_id=telegram_id, update_data=update_data)
                    
                    send_message = render_text_template(text=config.SUCCESS_ONE_TIME_REQUESTS_PAYMENT, requests=tariff.requests)  # Измените на своё сообщение
                    keyboard = get_custom_callback_btns(
                        btns=btns.USER_PANEL_BTNS,
                        layout=btns.USER_PANEL_LAYOUT
                    )
                
                elif autopayment == 0:
                    telegram_id = extract_telegram_id_from_order(order_id=order_id)
                    tariff_id = extract_tariff_id_from_order(order_id=order_id)
                    
                    if not telegram_id:
                        print(f"❌ Не удалось извлечь telegram_id из order_id: {order_id}")
                        return Response(content="Сторонний платёж", status_code=200)
                    
                    send_message = config.SUCCESS_PAYMENT_MESSAGE
                    keyboard = get_custom_callback_btns(
                        btns=btns.USER_PANEL_BTNS,
                        layout=btns.USER_PANEL_LAYOUT
                    )

                    add_data = {
                        "order_id": order_id,
                        "telegram_id": telegram_id,
                        "profile_id": profile_id,
                        "tariff_id": tariff_id,
                    }
                    await orm_add_order(session, add_data=add_data)
                    print(f"📦 Создан заказ: order_id={order_id}, telegram_id={telegram_id}, profile_id={profile_id}, tariff_id: {tariff_id}")
                
                else:
                    existing_order = await orm_get_order_by_profile_id(session, profile_id=profile_id)
                    tariff_id = extract_tariff_id_from_order(order_id=order_id)
                    
                    if not existing_order:
                        print(f"❌ Не найден заказ для profile_id: {profile_id}")
                        return Response(content="сторонний платёж", status_code=200)
                    
                    telegram_id = existing_order.telegram_id
                    send_message = config.SUCCESS_AUTOPAYMENT_MESSAGE
                    keyboard = None
                    
                    print(f"🔄 Автоплатёж: order_num={order_num} (новый платёж), order_id={existing_order.order_id} (старый заказ), telegram_id={telegram_id}")

                if not is_test_payment and is_subscription_payment:
                    update_data = {
                        "end_subscribe": next_subscribe_date,
                        "is_subscribe": True,
                        "tariff_id": tariff_id
                    }
                    await orm_update_user(session, telegram_id=telegram_id, update_data=update_data)
                    await orm_update_order(session, order_id, update_data={"tariff_id": tariff_id})
                    print(f"⏰ Подписка продлена: telegram_id={telegram_id}, до {next_subscribe_date}")

                await bot.send_message(
                    chat_id=telegram_id,
                    text=send_message,
                    parse_mode='HTML',
                    reply_markup=keyboard)

                return Response(content="success", status_code=200)
            

            else:
                MANAGER_USERNAME = await orm_get_setting(session, name=SettingsModel.SUPPORT_ADMIN.name)
                if not MANAGER_USERNAME:
                    support_username = SettingsModel.SUPPORT_ADMIN.value
                else:
                    support_username = MANAGER_USERNAME.value

                if is_test_payment:
                    telegram_id = 783863558
                    send_message = f"🧪 ТЕСТОВЫЙ ПЛАТЕЖ (ОШИБКА)\n\n{config.ERROR_PAYMENT_MESSAGE}"
                    keyboard = get_custom_callback_btns(
                        btns={
                            "Написать в техподдержку":("url", f"https://t.me/{support_username}?text={config.TEXT_TO_SUPPORT}"),
                        }, layout=[1]
                    )
                
                # ============================================================
                # РАЗОВЫЙ ПЛАТЁЖ (БЕЗ ПОДПИСКИ) - НЕУДАЧНЫЙ
                # ============================================================
                elif not is_subscription_payment:
                    telegram_id = extract_telegram_id_from_order(order_id=order_id)
                    
                    if not telegram_id:
                        print(f"❌ Не удалось извлечь telegram_id из order_id: {order_id}")
                        return Response(content="Сторонний платёж", status_code=200)
                    
                    send_message = config.ERROR_PAYMENT_MESSAGE
                    keyboard = get_custom_callback_btns(
                        btns={
                            "Написать в техподдержку":("url", f"https://t.me/{support_username}?text={config.TEXT_TO_SUPPORT}"),
                        }, layout=[1]
                    )
                
                elif autopayment == 0:
                    telegram_id = extract_telegram_id_from_order(order_id=order_id)
                    
                    if not telegram_id:
                        print(f"❌ Не удалось извлечь telegram_id из order_id: {order_id}")
                        return Response(content="Сторонний платёж", status_code=200)
                    
                    send_message = config.ERROR_PAYMENT_MESSAGE
                    keyboard = get_custom_callback_btns(
                        btns={
                            "Написать в техподдержку":("url", f"https://t.me/{support_username}?text={config.TEXT_TO_SUPPORT}"),
                        }, layout=[1]
                    )
                
                else:
                    existing_order = await orm_get_order_by_profile_id(session, profile_id=profile_id)
                    
                    if not existing_order:
                        print(f"❌ Не найден заказ для profile_id: {profile_id}")
                        return Response(content="Сторонний платёж", status_code=200)
                    
                    telegram_id = existing_order.telegram_id
                    send_message = config.ERROR_AUTOPAYMENT_MESSAGE
                    keyboard = get_custom_callback_btns(
                        btns={
                            "Написать в техподдержку":("url", f"https://t.me/{support_username}?text={config.TEXT_TO_SUPPORT}"),
                        }, layout=[1]
                    )
                
                await bot.send_message(
                    chat_id=telegram_id,
                    text=send_message,
                    parse_mode='HTML',
                    reply_markup=keyboard
                )

                return Response(content="Ошибка сервера", status_code=200)
                
    except Exception as e:
        print(f"❌ Ошибка обработки webhook: {e}")
        import traceback
        traceback.print_exc()
        return Response(content=f"error: {str(e)}", status_code=200)