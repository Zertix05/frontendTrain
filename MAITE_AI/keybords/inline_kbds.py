from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

def get_custom_callback_btns(
    *, 
    btns: dict[str, str], 
    layout: list[int]
):
    keyboard = InlineKeyboardBuilder()

    button_queue = []
    for text, data in btns.items():
        if isinstance(data, tuple) and data[0] == 'url':
            button_queue.append(InlineKeyboardButton(text=text, url=data[1]))
        else:
            button_queue.append(InlineKeyboardButton(text=text, callback_data=str(data)))

    index = 0
    for row_size in layout:
        if index >= len(button_queue):
            break
        row_buttons = button_queue[index:index + row_size]
        keyboard.row(*row_buttons)
        index += row_size

    return keyboard.as_markup()