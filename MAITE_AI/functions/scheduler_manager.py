from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import os
from database.engine import session_maker

from datetime import datetime, timezone
from typing import Optional, Dict

from database.orm.settings import orm_get_setting, orm_update_setting
from enums.enums import SettingsModel
from settings.logger import logger


scheduler = None

CHECK_SUBSCRIBE_TIME = int(os.getenv("CHECK_SUBSCRIBE_TIME"))

def init_scheduler():
    global scheduler
    if scheduler is None:
        scheduler = AsyncIOScheduler()
        logger.info("📅 Планировщик инициализирован")
    return scheduler


def start_scheduler():
    global scheduler
    if scheduler and not scheduler.running:
        scheduler.start()
        logger.info("✅ Планировщик запущен")
    elif scheduler and scheduler.running:
        logger.info("⚠️ Планировщик уже запущен")


def stop_scheduler():
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("🛑 Планировщик остановлен")

def get_scheduler():
    return scheduler

def is_running():
    return scheduler is not None and scheduler.running
