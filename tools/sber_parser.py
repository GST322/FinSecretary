from bs4 import BeautifulSoup

def parse_html(html_path):
    """Парсит HTML файл в текст"""
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    return soup.get_text(separator=' ', strip=True)