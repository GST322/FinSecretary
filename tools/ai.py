import os, json
from groq import Groq

client = Groq(api_key=os.getenv('GROQ_KEY'))

def ask_ai(question: str) -> str:
    try:
        with open('data/ai_input.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        context = (data.get('broker_report') or '')[:3000]
    except:
        context = 'нет данных'

    r = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[
            {'role': 'system', 'content': 'Ты финансовый секретарь. Отвечай кратко, по делу, на русском. Не придумывай цифры — только из данных клиента.'},
            {'role': 'user',   'content': f'ПОРТФЕЛЬ:\n{context}\n\nВОПРОС: {question}'}
        ],
        max_tokens=500,
        temperature=0.3
    )
    return r.choices[0].message.content
