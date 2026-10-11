from transformers import pipeline
from tools.translator import translate_to_english

_pipe = None

def analyze_sentiment(text: str) -> dict:
    global _pipe
    if _pipe is None:
        _pipe = pipeline('text-classification', model='ProsusAI/finbert')

    english = translate_to_english(text)
    result = _pipe(english[:512])[0]

    labels = {'positive': 'позитивный 📈', 'negative': 'негативный 📉', 'neutral': 'нейтральный ➡️'}

    return {
        'label':      labels.get(result['label'], result['label']),
        'score':      round(result['score'] * 100, 1),
        'translated': english
    }
