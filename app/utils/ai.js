// Next.js internal API URL
const BASE = '/api/interview';

async function post(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

// Upload resume file → returns extracted text from backend
export async function extractFileText(file) {
  if (!file) return '';
  try {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(`${BASE}/parse-resume`, { method: 'POST', body: formData });
    const data = await res.json();
    return data.text || '';
  } catch {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  }
}

// Analyze resume → candidate profile
export async function analyzeResume(resumeText, role, level, interviewType) {
  try {
    return await post('/analyze-resume', { resumeText, role, level, interviewType });
  } catch {
    return {
      name: 'Candidate', summary: `Candidate applying for ${role}.`,
      skills: ['Communication', 'Problem Solving', 'Teamwork'],
      experience: level, strengths: ['Motivated', 'Quick learner'],
      gaps: ['Needs assessment'],
      firstQuestion: `Tell me about yourself and why you're interested in the ${role} role.`,
      interviewFocus: ['Experience', 'Skills', 'Problem Solving'],
    };
  }
}

// Get next dynamic question
export async function getNextQuestion(conversationHistory, session, resumeProfile, questionCount, firstQuestion) {
  try {
    return await post('/next-question', { conversationHistory, session, resumeProfile, questionCount, firstQuestion });
  } catch {
    const fallbacks = [
      { question: "Tell me about a time you had to learn something completely new under pressure.", type: "Behavioral", intent: "Adaptability" },
      { question: "Walk me through a challenging project you worked on — what was your specific role?", type: "Behavioral", intent: "Problem solving" },
      { question: "Describe a situation where you disagreed with a teammate. How did you handle it?", type: "Behavioral", intent: "Conflict resolution" },
      { question: "What's the most complex technical problem you've solved? How did you approach it?", type: "Technical", intent: "Critical thinking" },
      { question: "How do you prioritize tasks when you have multiple deadlines at the same time?", type: "Situational", intent: "Time management" },
    ];
    return fallbacks[questionCount % fallbacks.length];
  }
}

// Evaluate a single answer
export async function evaluateAnswer(question, answer, session) {
  try {
    return await post('/evaluate-answer', { question, answer, session });
  } catch {
    return { score: 6, quality: 'adequate', note: 'Answer recorded.' };
  }
}

// Generate final verdict
export async function generateFinalVerdict(session, resumeProfile, conversationHistory) {
  try {
    return await post('/final-verdict', { session, resumeProfile, conversationHistory });
  } catch {
    return {
      decision: 'On Hold', overallScore: 60, confidence: 'Low',
      headline: 'Could not generate verdict. Please try again.',
      whatWentWell: ['Interview completed'], whatWentPoorly: ['Verdict generation failed'],
      standoutMoment: 'N/A',
      improvements: [{ area: 'Try again', feedback: 'Please restart the interview.' }],
      nextSteps: 'Restart the interview.',
      scoreBreakdown: { technicalKnowledge: 60, communication: 60, problemSolving: 60, cultureFit: 60, experience: 60 },
    };
  }
}
