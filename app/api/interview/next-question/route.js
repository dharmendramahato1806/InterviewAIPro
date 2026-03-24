import { NextResponse } from 'next/server';
import { callAI, parseJSON } from '../../ai-util';

const FALLBACK_QUESTIONS = [
  { question: "Tell me about a time you had to learn something completely new under pressure.", type: "Behavioral", intent: "Adaptability" },
  { question: "Walk me through a challenging project you worked on — what was your specific role?", type: "Behavioral", intent: "Problem solving" },
  { question: "Describe a situation where you disagreed with a teammate. How did you handle it?", type: "Behavioral", intent: "Conflict resolution" },
  { question: "What's the most complex technical problem you've solved? How did you approach it?", type: "Technical", intent: "Critical thinking" },
  { question: "How do you prioritize tasks when you have multiple deadlines at the same time?", type: "Situational", intent: "Time management" },
  { question: "Can you describe a project where you had to collaborate across different teams?", type: "Behavioral", intent: "Collaboration" },
  { question: "Tell me about a time when a project didn't go as planned. What did you do?", type: "Behavioral", intent: "Resilience" },
  { question: "What motivates you the most in your day-to-day work?", type: "Behavioral", intent: "Motivation" },
  { question: "Describe a situation where you had to make a decision without complete information.", type: "Situational", intent: "Decision making" },
  { question: "What is one skill you wish you had developed earlier in your career?", type: "Behavioral", intent: "Self-awareness" },
];

export async function POST(req) {
  try {
    const { conversationHistory, session, resumeProfile, questionCount, firstQuestion } = await req.json();

    const historyQuestions = (conversationHistory || []).map((h) => h.question);
    const allAskedQuestions = firstQuestion
      ? [firstQuestion, ...historyQuestions]
      : historyQuestions;

    const alreadyAsked = allAskedQuestions
      .map((q, i) => `${i + 1}. "${q}"`)
      .join('\n');

    const lastEntry = conversationHistory?.slice(-1)[0] || null;
    const lastQuestion = lastEntry?.question || null;
    const lastAnswer   = lastEntry?.answer   || null;

    const prompt = `You are conducting a REAL job interview for a ${session.level} ${session.role} position. Interview type: ${session.type}.

CANDIDATE RESUME PROFILE:
Name: ${resumeProfile.name}
Technical Skills: ${resumeProfile.skills.join(', ')}
Key Projects: ${JSON.stringify(resumeProfile.projects || [])}
Interview Strategy / Focus areas: ${resumeProfile.interviewFocus.join(', ')}
Pre-prepared Question Topics: ${resumeProfile.questionPlan.join(', ')}

QUESTIONS ALREADY ASKED — YOU MUST NOT REPEAT OR PARAPHRASE ANY OF THESE:
${alreadyAsked || 'None yet'}

${lastQuestion ? `LAST QUESTION ASKED:\n"${lastQuestion}"` : ''}
${lastAnswer   ? `CANDIDATE'S LAST ANSWER:\n"${lastAnswer}"` : ''}

YOUR TASK: Generate Question #${(allAskedQuestions.length + 1)} for a ${session.level} ${session.role}.

INTERVIEWER LOGIC:
1. QUESTION TYPES: 
   - ROLE-SPECIFIC: Concepts expected at the ${session.level} level for a ${session.role}.
   - CODING: Provide a small coding challenge. Keep it concise.
   - RESUME-BASED: Deep-dive into their specific projects and tech stack.
2. HANDLING SKIPS: If they skip, pivot to a core foundational concept.
3. PERSONALIZATION: Always name-drop a project or specific tech from the resume if possible.

Return ONLY a valid JSON object:
{
  "question": "Your question or coding task here",
  "type": "Technical | Situational | Deep-dive | Follow-up | Coding",
  "intent": "assessing [specific logic/skill]"
}`;

    const text = await callAI(prompt, 500, 1.0);
    const parsed = parseJSON(text);

    const isDuplicate = allAskedQuestions.some(
      (q) => q.toLowerCase().trim() === parsed.question.toLowerCase().trim()
    );
    if (isDuplicate) {
      console.warn('AI returned duplicate question — using fallback');
      const fallbackIndex = allAskedQuestions.length % FALLBACK_QUESTIONS.length;
      return NextResponse.json(FALLBACK_QUESTIONS[fallbackIndex]);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('next-question error:', err.message);
    const body = await (async () => { try { return await req.json(); } catch { return {}; } })();
    const asked = (body.conversationHistory?.length || 0) + (body.firstQuestion ? 1 : 0);
    const fallbackIndex = asked % FALLBACK_QUESTIONS.length;
    return NextResponse.json(FALLBACK_QUESTIONS[fallbackIndex]);
  }
}
