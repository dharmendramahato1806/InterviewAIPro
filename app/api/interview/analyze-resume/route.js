import { NextResponse } from 'next/server';
import { callAI, parseJSON } from '../../ai-util';

export async function POST(req) {
  try {
    const { resumeText, role, level, interviewType } = await req.json();
    
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Resume text is required and must be substantial.' }, { status: 400 });
    }

    const prompt = `You are a high-stakes interviewer at a top tech company. Analyze this resume for a ${level} ${role} position (${interviewType} interview).

RESUME CONTENT:
${resumeText.substring(0, 8000)}

Return ONLY a valid JSON object:
{
  "name": "full name found in resume",
  "summary": "precise 2-3 sentence technical profile",
  "skills": ["tech1", "tech2", "specific-lib1", "specific-lib2"],
  "projects": [
      {"name": "Project Name", "tech": ["stack used"], "description": "Short summary of what they did"}
  ],
  "experience": "Detailed total duration",
  "strengths": ["concrete strength 1", "concrete strength 2"],
  "gaps": ["specific technical or experience gap noticed in resume"],
  "firstQuestion": "A high-impact opening question directly referencing a specific project or achievement from the resume.",
  "interviewFocus": ["Deep-dive into X project", "Architecture of Y"],
  "questionPlan": ["Topic 1 from resume", "Specific tech challenge mentioned", "Behavioral aspect related to company X they worked at"]
}`;
    const text = await callAI(prompt);
    return NextResponse.json(parseJSON(text));
  } catch (err) {
    console.error('analyze-resume error:', err.message);
    const body = await (async () => { try { return await req.json(); } catch { return {}; } })();
    return NextResponse.json({
      error: 'Failed to analyze resume',
      name: 'Candidate', 
      summary: `Candidate applying for ${body.role || 'Role'}.`,
      skills: ['Communication', 'Problem Solving'],
      projects: [],
      experience: body.level || 'Level',
      strengths: ['Motivated'],
      gaps: ['Assessment required'],
      firstQuestion: `Can you walk me through your most significant achievement in your career so far?`,
      interviewFocus: ['Experience', 'Skills'],
      questionPlan: ['Introduction', 'Technical Skills', 'Behavioral']
    });
  }
}
