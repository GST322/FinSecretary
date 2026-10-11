import subprocess
import json
from sber_parser import parse_html

def prepare_for_ai(html_path, user_question=""):
    """Собирает всё в JSON для нейронки."""
    
    # 1. Запускаем stock.py (если упадёт — забьём)
    try:
        result = subprocess.run(
            ["python", "tools/stock.py"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=30
        )
        stock_output = result.stdout
    except:
        stock_output = "stock data unavailable"
    
    # 2. Парсим HTML отчёт
    report_text = parse_html(html_path)
    
    # 3. Собираем JSON
    data = {
        "stock_data": stock_output,
        "broker_report": report_text,
        "user_question": user_question
    }
    
    # 4. Сохраняем
    with open("data/ai_input.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return data

# ========== РУЧНОЙ ТЕСТ ==========
if __name__ == "__main__":
    html_path = input("Путь к HTML файлу: ").strip()
    question = input("Ваш вопрос: ").strip()
    
    data = prepare_for_ai(html_path, question)
    
    print("\n=== Готово ===")
    print(json.dumps(data, ensure_ascii=False, indent=2))