import { NextResponse } from 'next/server';
import { callAI, parseJSON } from '../../ai-util';

export async function POST(req) {
  try {
    const { session, resumeProfile, conversationHistory } = await req.json();
    const fullConvo = conversationHistory.map((h, i) =>
      `Q${i + 1} [${h.type}]: ${h.question}\nAnswer: ${h.answer}\nEval: ${h.eval?.note || 'N/A'} (Score: ${h.eval?.score ?? 'N/A'}/10)`
    ).join('\n\n');

    const prompt = `You are a senior hiring manager. Make a final hiring decision for this candidate.

Role: ${session.level} ${session.role} (${session.type} interview)
Candidate: ${resumeProfile.name}
Summary: ${resumeProfile.summary}
Technical Profile: ${resumeProfile.skills.join(', ')}

FULL INTERVIEW TRANSCRIPT:
${fullConvo}

Return ONLY a valid JSON object:
{
  "decision": "Selected",
  "overallScore": 75,
  "confidence": "High | Medium | Low",
  "headline": "One punchy verdict sentence",
  "whatWentWell": ["point1","point2","point3"],
  "whatWentPoorly": ["point1","point2"],
  "standoutMoment": "The single best or worst moment",
  "improvements": [
    {"area": "Area", "feedback": "Specific advice"},
    {"area": "Area", "feedback": "Specific advice"},
    {"area": "Area", "feedback": "Specific advice"}
  ],
  "nextSteps": "What should happen next",
  "scoreBreakdown": {
    "technicalKnowledge": 70,
    "communication": 80,
    "problemSolving": 65,
    "cultureFit": 75,
    "experience": 70
  }
}`;
    const text = await callAI(prompt, 1500, 0.7);
    return NextResponse.json(parseJSON(text));
  } catch (err) {
    console.error('final-verdict error:', err.message);
    return NextResponse.json({ error: 'Failed to generate verdict' }, { status: 500 });
  }
}
