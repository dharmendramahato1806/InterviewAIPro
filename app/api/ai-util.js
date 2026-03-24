const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export async function callAI(prompt, maxTokens = 1200, temperature = 0.7) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY missing in .env');

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' }
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Groq API error: ${data.error.message}`);
  return data.choices[0].message.content.trim();
}

export function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error('JSON Parse Error. Data:', text);
    throw err;
  }
}
