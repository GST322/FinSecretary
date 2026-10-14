import os
from bs4 import BeautifulSoup

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'FinSecretary', 'uploads'
)

def latest_report():
    """Последний HTML-отчёт из FinSecretary/uploads"""
    files = [
        os.path.join(UPLOAD_DIR, f)
        for f in os.listdir(UPLOAD_DIR)
        if f.lower().endswith(('.html', '.htm'))
    ] if os.path.isdir(UPLOAD_DIR) else []
    if not files:
        return None
    return max(files, key=os.path.getmtime)

def to_float(s):
    try:
        return float(s.replace('\xa0', '').replace(' ', '').replace('+', ''))
    except (ValueError, AttributeError):
        return None

def parse_report(path):
    """Парсит отчёт брокера: итоги оценки активов и позиции портфеля"""
    with open(path, encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f, 'html.parser')

    result = {'file': os.path.basename(path), 'total': None, 'change': None, 'positions': []}
    tables = soup.find_all('table')

    # Итоги оценки активов (строка «Итого» первой таблицы)
    if tables:
        for row in tables[0].find_all('tr'):
            cells = [c.get_text(' ', strip=True) for c in row.find_all(['td', 'th'])]
            if cells and cells[0] == 'Итого' and len(cells) >= 4:
                result['total'] = to_float(cells[2])
                result['change'] = to_float(cells[3])

    # Портфель ценных бумаг (строки с ISIN)
    for table in tables:
        for row in table.find_all('tr'):
            cells = [c.get_text(' ', strip=True) for c in row.find_all(['td', 'th'])]
            if len(cells) >= 15 and cells[1].startswith('RU'):
                result['positions'].append({
                    'name': cells[0],
                    'qty': cells[8],
                    'value': to_float(cells[11]),
                })
    return result

def get_portfolio_text():
    """Текст сообщения для кнопки «Портфель»"""
    path = latest_report()
    if not path:
        return '💼 Портфель в разработке.'
    report = parse_report(path)
    lines = [f"💼 Портфель ({report['file']})"]
    if report['total'] is not None:
        lines.append(f"Всего: {report['total']:.2f} ₽")
    if report['change'] is not None:
        lines.append(f"Изменение за период: {report['change']:+.2f} ₽")
    for p in report['positions']:
        value = f"{p['value']:.2f}" if p['value'] is not None else '?'
        lines.append(f"— {p['name']}: {p['qty']} шт, {value} ₽")
    return '\n'.join(lines)
