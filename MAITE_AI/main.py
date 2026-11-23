import asyncio
import os
from aiogram import Bot, Dispatcher, types, F
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from fastapi import FastAPI, Request
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from settings.logger import logger
from database.engine import session_maker

from api.payments.endpoints import router_payment

from settings.telegram_routers import user_router, admin_router
import handlers.admins.handlers_admin

import handlers.AI.handlers_ai
import handlers.users.handlears_main


from dotenv import find_dotenv, load_dotenv
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

from functions.scheduler_manager import init_scheduler, start_scheduler, stop_scheduler, add_periodic_jobs

from middlewares.db import DataBaseSession


load_dotenv(find_dotenv())

ALLOW_UPDATES = ['message', 'edited_message', 'callback_query', 'channel_post']

bot = Bot(token=os.getenv('API_TOKEN'))

WEBHOOK_URL = os.getenv("WEBHOOK_URL")
WEBHOOK_PATH = f"/webhook/{os.getenv('API_TOKEN')}"
WEBHOOK_FULL_URL = f"{WEBHOOK_URL}{WEBHOOK_PATH}"

dp = Dispatcher()

dp.include_router(user_router)
dp.include_router(admin_router)

commands = [
    types.BotCommand(command="start", description="Начало работы с ботом")
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    dp.update.middleware(DataBaseSession(session_pool=session_maker))
    
    await bot.set_webhook(WEBHOOK_FULL_URL, allowed_updates=ALLOW_UPDATES, drop_pending_updates=True)
    await bot.set_my_commands(commands, scope=types.BotCommandScopeAllPrivateChats())

    init_scheduler()
    start_scheduler()

    yield

    stop_scheduler()
    await bot.delete_webhook()
    print("Бот завершил работу")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_payment)

limiter = Limiter(key_func=get_remote_address, default_limits=["29/second"])

app.add_middleware(SlowAPIMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post(WEBHOOK_PATH)
async def handle_webhook(request: Request):
    try:
        data = await request.json()
        update = types.Update(**data)
        asyncio.create_task(dp.feed_update(bot=bot, update=update))
        return {"ok": True}
    except Exception as e:
        logger.error(f"Ошибка обработки вебхука: {e}")
        return {"ok": False}
    
if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("WEBAPP_PORT")))
