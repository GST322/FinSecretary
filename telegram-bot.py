#Инициализация бота
import telebot
import os

#Инициализация dotenv
from dotenv import load_dotenv

load_dotenv()
#Активация бота
bot = telebot.TeleBot(os.getenv('BOT_TOKEN'))
#Импорт кнопок
from telebot import types

#Команда Start
@bot.message_handler(commands=['start'])
def start(message):
    markup = types.InlineKeyboardMarkup()
    markup.row(
        types.InlineKeyboardButton('⚖️Анализ портфеля', callback_data='analysis'),
        types.InlineKeyboardButton('💬Новости по портфелю', callback_data='news')
    )
    markup.row(
        types.InlineKeyboardButton('💼Портфель', callback_data='portfolio'),
        types.InlineKeyboardButton('⚙️Настройки', callback_data='settings')
    )

    bot.send_message(
        message.chat.id,
        'Добро пожаловать в интерфейс финансового секретаря. C возвращением, сэр!',
         reply_markup=markup
         )

# Ждём ли текст новости
waiting_for_news = {}

@bot.callback_query_handler(func=lambda call: True)
def handle_buttons(call):
    chat_id = call.message.chat.id

    if call.data == 'analysis':
        bot.send_message(chat_id, '⚙️ Анализирую...')
        from tools.ai import ask_ai
        bot.send_message(chat_id, ask_ai('Проанализируй мой портфель. Что стоит отметить?'))

    elif call.data == 'news':
        waiting_for_news[chat_id] = True
        bot.send_message(chat_id, '📰 Введите текст новости:')

    elif call.data == 'portfolio':
        bot.send_message(chat_id, '💼 Портфель в разработке.')

    elif call.data == 'settings':
        bot.send_message(chat_id, '⚙️ Настройки в разработке.')

    bot.answer_callback_query(call.id)

@bot.message_handler(func=lambda m: True)
def handle_text(message):
    chat_id = message.chat.id

    if waiting_for_news.get(chat_id):
        waiting_for_news[chat_id] = False
        bot.send_message(chat_id, '🔄 Анализирую новость...')
        from tools.sentiment import analyze_sentiment
        r = analyze_sentiment(message.text)
        bot.send_message(chat_id,
            f"Сентимент: {r['label']}\n"
            f"Уверенность: {r['score']}%\n"
            f"Текст: {r['translated']}"
        )
    else:
        bot.send_message(chat_id, '💭 Думаю...')
        from tools.ai import ask_ai
        bot.send_message(chat_id, ask_ai(message.text))

if __name__ == '__main__':
    bot.polling(none_stop=True)