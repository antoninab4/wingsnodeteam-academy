const API_URL = 'https://api.openai.com/v1/chat/completions'

exports.handler = async (event) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'missing_api_key' }) }
    }

    const body = JSON.parse(event.body || '{}')
    const history = Array.isArray(body.history) ? body.history : []
    const userMessage = body.userMessage || ''

    const system = 'Ты — Senior Blockchain Engineer и главный ментор академии WingsNodeTeam (WNT). Стиль: профессиональный и четкий. Формат: Markdown. Используй списки, выделяй **термины**, код в ```.'
    const messages = [{ role: 'system', content: system }]
    for (const m of history.slice(-12)) {
      messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })
    }
    messages.push({ role: 'user', content: userMessage })

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages })
    })

    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: 'upstream_error' }) }
    }
    const data = await resp.json()
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ''
    return { statusCode: 200, body: JSON.stringify({ text }) }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'function_error' }) }
  }
}