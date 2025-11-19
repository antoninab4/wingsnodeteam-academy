
import { ChatMessage, QuizQuestion } from '../types';

export const sendMessageToGemini = async (history: ChatMessage[], userMessage: string): Promise<string> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, userMessage })
    });
    if (!res.ok) return 'Ошибка протокола связи. Проверьте соединение.';
    const data = await res.json();
    return data.text || 'Соединение с нейросетью нестабильно. Повторите запрос.';
  } catch (error) {
    return 'Ошибка протокола связи. Проверьте соединение.';
  }
};

export const generateChallengeQuestions = async (lessonContext: string): Promise<QuizQuestion[]> => {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonContext })
    });
    if (!res.ok) return [];
    const data = await res.json();
    const q = Array.isArray(data.questions) ? data.questions as QuizQuestion[] : [];
    return q.map((item, i) => ({ ...item, id: `ai-gen-${Date.now()}-${i}` }));
  } catch (error) {
    return [];
  }
};
