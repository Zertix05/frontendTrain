import logging
import sys

class NoWebhookFilter(logging.Filter):
    def filter(self, record):
        return 'webhook' not in record.getMessage().lower()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)


uvicorn_access = logging.getLogger("uvicorn.access")
uvicorn_access.addFilter(NoWebhookFilter())
logging.getLogger("uvicorn").setLevel(logging.WARNING)

logging.getLogger("aiogram.event").setLevel(logging.WARNING)
logging.getLogger("apscheduler.scheduler").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("httpcore.connection").setLevel(logging.WARNING)
logging.getLogger("httpcore.http11").setLevel(logging.WARNING)
logging.getLogger("python_multipart.multipart").setLevel(logging.WARNING)
logging.getLogger("fastapi").setLevel(logging.WARNING)
logging.getLogger("asyncio").setLevel(logging.WARNING)
logging.getLogger("tzlocal").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
