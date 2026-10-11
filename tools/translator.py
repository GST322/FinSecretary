import requests, os

def translate_to_english(text: str) -> str:
    r = requests.post(
        'https://api-free.deepl.com/v2/translate',
        headers={'Authorization': f"DeepL-Auth-Key {os.getenv('DEEPL_KEY')}"},
        data={'text': text, 'target_lang': 'EN'},
        timeout=10
    )
    return r.json()['translations'][0]['text']
