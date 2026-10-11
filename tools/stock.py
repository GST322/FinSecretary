import requests
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import xml.etree.ElementTree as ET

# ========== БЛОК YFINANCE ==========
gld = yf.Ticker("GLD")  # Индекс золота SPDR
iau = yf.Ticker("IAU")  # Индекс золота iShares

# Долг США
tlt = yf.Ticker("TLT")  # Долгосрочные облигации США

# История
gld_hist = gld.history(period="1y")
iau_hist = iau.history(period="1y")
tlt_hist = tlt.history(period="1y")

# Берем актуальный календарь
today = datetime.now()
year_ago = today - timedelta(days=365)

# Инфо по международным
gld_info = gld.info
iau_info = iau.info
tlt_info = tlt.info

# Форматируем дату
date_from = year_ago.strftime("%Y-%m-%d")
date_till = today.strftime("%Y-%m-%d")

print(f"Период: {date_from} -> {date_till}")

# ========== МОСБИРЖА - Приоритет №1 ==========

# TGLD - свечи
url_tgld = "https://iss.moex.com/iss/engines/stock/markets/shares/securities/TGLD/candles.json"
params = {"from": date_from, "till": date_till, "interval": 24}
resp_tgld = requests.get(url_tgld, params=params)
data_tgld = resp_tgld.json()
df_tgld = pd.DataFrame(data_tgld["candles"]["data"], columns=data_tgld["candles"]["columns"])

# GOLD - свечи
url_gold = "https://iss.moex.com/iss/engines/stock/markets/shares/securities/GOLD/candles.json"
resp_gold = requests.get(url_gold, params=params)
data_gold = resp_gold.json()
df_gold = pd.DataFrame(data_gold["candles"]["data"], columns=data_gold["candles"]["columns"])

# Инфо по TGLD
url_info_tgld = "https://iss.moex.com/iss/engines/stock/markets/shares/securities/TGLD.json"
resp_info_tgld = requests.get(url_info_tgld)
info_tgld = resp_info_tgld.json()

# Инфо по GOLD
url_info_gold = "https://iss.moex.com/iss/engines/stock/markets/shares/securities/GOLD.json"
resp_info_gold = requests.get(url_info_gold)
info_gold = resp_info_gold.json()

# ========== ЦБ РФ ==========
# Парсим главную страницу ЦБ
url_cbr = "https://www.cbr.ru/"
resp_cbr = requests.get(url_cbr)

import re

# Ищем ставку в формате "14,00%" или "14.00%"
match = re.search(r'Ключевая ставка.*?(\d+[,.]\d+)\s*%', resp_cbr.text, re.DOTALL)
if match:
    cbr_value = match.group(1).replace(',', '.')
    cbr_date = datetime.now().strftime("%Y-%m-%d")
else:
    # Fallback - ищем просто число с процентом
    match = re.search(r'(\d+[,.]\d+)\s*%', resp_cbr.text)
    if match:
        cbr_value = match.group(1).replace(',', '.')
        cbr_date = datetime.now().strftime("%Y-%m-%d")
    else:
        cbr_value = "N/A"
        cbr_date = "N/A"
    
# ========== ЧТЕНИЕ ==========

print("\n=== TGLD с Мосбиржи ===")
print(df_tgld[["begin", "open", "high", "low", "close", "volume"]].tail())

print("\n=== GOLD с Мосбиржи ===")
print(df_gold[["begin", "open", "high", "low", "close", "volume"]].tail())

print("\n=== GLD с Yahoo Finance ===")
print(gld_hist.tail())

print("\n=== TLT с Yahoo Finance ===")
print(tlt_hist.tail())

print("\n=== Инфо по TGLD (Мосбиржа) ===")
if info_tgld.get("securities", {}).get("data"):
    row = dict(zip(info_tgld["securities"]["columns"], info_tgld["securities"]["data"][0]))
    print(f"Название: {row.get('SECNAME')}")
    print(f"Валюта: {row.get('FACEUNIT')}")
    print(f"Размер лота: {row.get('LOTSIZE')}")

print("\n=== Инфо по GOLD (Мосбиржа) ===")
if info_gold.get("securities", {}).get("data"):
    row = dict(zip(info_gold["securities"]["columns"], info_gold["securities"]["data"][0]))
    print(f"Название: {row.get('SECNAME')}")
    print(f"Валюта: {row.get('FACEUNIT')}")
    print(f"Размер лота: {row.get('LOTSIZE')}")

print("\n=== Инфо по GLD (Yahoo Finance) ===")
print(f"Название: {gld_info.get('longName')}")
print(f"Валюта: {gld_info.get('currency')}")
print(f"Последняя цена: {gld_info.get('regularMarketPrice')}")

print("\n=== Инфо по IAU (Yahoo Finance) ===")
print(f"Название: {iau_info.get('longName')}")
print(f"Валюта: {iau_info.get('currency')}")
print(f"Последняя цена: {iau_info.get('regularMarketPrice')}")

print("\n=== Инфо по TLT (Yahoo Finance) ===")
print(f"Название: {tlt_info.get('longName')}")
print(f"Валюта: {tlt_info.get('currency')}")
print(f"Последняя цена: {tlt_info.get('regularMarketPrice')}")

print("\n=== Ключевая ставка ЦБ РФ ===")
print(f"Дата: {cbr_date}")
print(f"Ставка: {cbr_value}%")

from csv_saver import save_all
save_all(df_tgld, df_gold, gld_hist, iau_hist, tlt_hist, cbr_date, cbr_value)