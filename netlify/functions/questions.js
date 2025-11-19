const API_URL = 'https://api.openai.com/v1/chat/completions'

exports.handler = async (event) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ questions: [] }) }
    }

    const body = JSON.parse(event.body || '{}')
    const lessonContext = body.lessonContext || ''
    const prompt = `На основе материала ниже создай ровно 3 сложных ситуативных вопроса уровня Senior/Expert.
Требования:
1) Формат "Ситуация -> Решение".
2) 4 варианта ответов, один верный.
3) Подробное техническое объяснение.
Верни JSON: {"questions":[{"id":"string","question":"string","options":["string","string","string","string"],"correctAnswerIndex":0,"explanation":"string"}...]}
Материал:
${lessonContext}`

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Ты генерируешь только корректный JSON без лишнего текста.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!resp.ok) {
      return { statusCode: 200, body: JSON.stringify({ questions: [] }) }
    }
    const data = await resp.json()
    const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '{}'
    let parsed
    try { parsed = JSON.parse(content) } catch { parsed = { questions: [] } }
    const questions = Array.isArray(parsed.questions) ? parsed.questions : []
    return { statusCode: 200, body: JSON.stringify({ questions }) }
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ questions: [] }) }
  }
}