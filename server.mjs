import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import express from 'express'
import OpenAI from 'openai'

const app = express()
app.use(express.json())

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.post('/api/chat', async (req, res) => {
  try {
    const { history, userMessage } = req.body || {}
    const system = 'Ты — Senior Blockchain Engineer и главный ментор академии WingsNodeTeam (WNT). Стиль: профессиональный и четкий. Формат: Markdown. Используй списки, выделяй **термины**, код в ```.'
    const messages = [{ role: 'system', content: system }]
    if (Array.isArray(history)) {
      for (const m of history.slice(-12)) {
        messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })
      }
    }
    messages.push({ role: 'user', content: userMessage })
    const client = getClient()
    const resp = await client.chat.completions.create({ model: 'gpt-4o-mini', messages })
    const text = resp.choices?.[0]?.message?.content || ''
    res.json({ text })
  } catch (e) {
    res.status(500).json({ error: 'ai_error' })
  }
})

app.post('/api/questions', async (req, res) => {
  try {
    const { lessonContext } = req.body || {}
    const prompt = `На основе материала ниже создай ровно 3 сложных ситуативных вопроса уровня Senior/Expert.
Требования:
1) Формат "Ситуация -> Решение".
2) 4 варианта ответов, один верный.
3) Подробное техническое объяснение.
Верни JSON: {"questions":[{"id":"string","question":"string","options":["string","string","string","string"],"correctAnswerIndex":0,"explanation":"string"}...]}
Материал:
${lessonContext}`
    const client = getClient()
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Ты генерируешь только корректный JSON без лишнего текста.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
    const content = resp.choices?.[0]?.message?.content || '{}'
    let parsed
    try { parsed = JSON.parse(content) } catch { parsed = { questions: [] } }
    const questions = Array.isArray(parsed.questions) ? parsed.questions : []
    res.json({ questions })
  } catch (e) {
    res.json({ questions: [] })
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => {})