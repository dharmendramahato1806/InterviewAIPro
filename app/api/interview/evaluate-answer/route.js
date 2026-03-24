import { NextResponse } from 'next/server';
import { callAI, parseJSON } from '../../ai-util';

export async function POST(req) {
  try {
    const { question, answer, session } = await req.json();
    const prompt = `You are a strict but fair interviewer evaluating a real interview answer for a ${session.level} ${session.role} role.

Question asked: "${question}"
Candidate's answer: "${answer}"

Evaluate HONESTLY based on:
- Relevance: Did they actually answer the question?
- Depth: Was the answer detailed or vague?
- Examples: Did they give concrete examples?
- Clarity: Was it well-structured?

Score strictly from 1-10:
- 9-10: Exceptional, very detailed with great examples
- 7-8: Good, answered well with some examples
- 5-6: Average, answered but too vague or missing examples
- 3-4: Weak, barely answered or off-topic
- 1-2: Very poor, irrelevant or no real answer

Return ONLY a valid JSON object:
{
  "score": 7,
  "quality": "strong | adequate | weak",
  "note": "One specific sentence about THIS answer — what was good or bad about it"
}`;
    const text = await callAI(prompt, 250, 0.9);
    return NextResponse.json(parseJSON(text));
  } catch (err) {
    console.error('evaluate-answer error:', err.message);
    return NextResponse.json({ score: 6, quality: 'adequate', note: 'Answer recorded.' });
  }
}
