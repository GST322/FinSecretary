def analyze_sentiment(text: str) -> dict:
    text_lower = text.lower()
    
    # Словари весов псевдонейросети
    positive_words = ['рост', 'прибыль', 'дивиденд', 'плюс', 'высокий', 'успех', 'покупать', 'рекомендуют', 'хорошо', 'оптимизм']
    negative_words = ['падение', 'убыток', 'крах', 'минус', 'низкий', 'риск', 'продавать', 'кризис', 'плохо', 'паника']
    
    pos_score = sum(1 for word in positive_words if word in text_lower)
    neg_score = sum(1 for word in negative_words if word in text_lower)
    
    total = pos_score + neg_score
    
    if total == 0:
        label = 'нейтральный ➡️'
        score = 50.0
    elif pos_score > neg_score:
        label = 'позитивный 📈'
        score = round((pos_score / total) * 100, 1)
    else:
        label = 'негативный 📉'
        score = round((neg_score / total) * 100, 1)
        
    return {
        'label': label,
        'score': score,
        'translated': text # Возвращаем исходный текст, так как внешний переводчик удалён для стабильности
    }