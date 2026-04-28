import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Генерирует персональный план тренировки боевой подготовки через GPT-4 на основе параметров пользователя."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    age = body.get('age', '')
    level = body.get('level', '')
    goal = body.get('goal', '')
    profile = body.get('profile', 'спортсмен')

    if not age or not level or not goal:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': {'error': 'Укажите возраст, уровень подготовки и цель'}
        }

    api_key = os.environ.get('OPENAI_API_KEY', '')
    print(f"[DEBUG] api_key present: {bool(api_key)}, length: {len(api_key)}")

    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'OPENAI_API_KEY не настроен'}, ensure_ascii=False)
        }

    prompt = f"""Ты тренер по боевой подготовке. Составь персональный план мини-тренировки.

Параметры:
- Профиль: {profile}
- Возраст: {age} лет
- Уровень подготовки: {level}
- Цель: {goal}

Составь план тренировки на 20-45 минут. Формат ответа — строго JSON:
{{
  "title": "Название тренировки",
  "duration": "XX минут",
  "level": "уровень",
  "warmup": [
    {{"name": "Упражнение", "duration": "X мин", "description": "Описание"}}
  ],
  "main": [
    {{"name": "Упражнение", "sets": "X подходов", "reps": "X повторений", "description": "Описание техники"}}
  ],
  "cooldown": [
    {{"name": "Упражнение", "duration": "X мин", "description": "Описание"}}
  ],
  "tips": ["Совет 1", "Совет 2", "Совет 3"]
}}

Упражнения должны быть связаны с боевой подготовкой: строевые, силовые, скоростные, координационные."""

    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [{'role': 'user', 'content': prompt}],
        'temperature': 0.7,
        'max_tokens': 1500,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'OpenAI error {e.code}: {error_body}'}, ensure_ascii=False)
        }

    content = result['choices'][0]['message']['content'].strip()
    start = content.find('{')
    end = content.rfind('}') + 1
    workout_json = json.loads(content[start:end])

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'workout': workout_json}, ensure_ascii=False)
    }