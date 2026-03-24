"use client";

import React from 'react';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import VerdictScreen from './components/VerdictScreen';
import LoadingScreen from './components/LoadingScreen';
import { extractFileText, analyzeResume, getNextQuestion, evaluateAnswer, generateFinalVerdict } from './utils/ai';
import s from './App.module.css';

const STEP = {
  SETUP: 'setup',
  ANALYZING: 'analyzing',
  INTERVIEW: 'interview',
  GENERATING_VERDICT: 'generating_verdict',
  VERDICT: 'verdict',
};

export default function App() {
  const [step, setStep] = React.useState(STEP.SETUP);
  const [loadingMsg, setLoadingMsg] = React.useState('');
  const [session, setSession] = React.useState(null);
  const [resumeProfile, setResumeProfile] = React.useState(null);
  const [conversationHistory, setConversationHistory] = React.useState([]);
  const [currentQuestion, setCurrentQuestion] = React.useState(null);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [verdict, setVerdict] = React.useState(null);
  const [totalQuestions, setTotalQuestions] = React.useState(6);

  const handleStart = React.useCallback(async ({ role, level, type, file }) => {
    setStep(STEP.ANALYZING);
    setConversationHistory([]);
    setQuestionIndex(0);
    setTotalQuestions(6);
    setVerdict(null);

    const sess = { role, level, type };
    setSession(sess);

    // Extract resume text
    let resumeText = '';
    if (file) {
      setLoadingMsg('reading your resume...');
      resumeText = await extractFileText(file);
    }

    setLoadingMsg('analyzing your profile...');
    const profile = await analyzeResume(resumeText, role, level, type);
    setResumeProfile(profile);

    // Set first question from profile analysis
    setCurrentQuestion({
      question: profile.firstQuestion,
      type: type, // Dynamically set the type based on the session
      intent: 'Opening / background'
    });

    setStep(STEP.INTERVIEW);
  }, []);

  const handleSubmitAnswer = React.useCallback(async (answer) => {
    setIsSubmitting(true);

    // Evaluate the current answer
    const evalResult = await evaluateAnswer(
      currentQuestion.question,
      answer,
      session,
      resumeProfile,
      conversationHistory
    );

    // Save to history
    const newHistory = [
      ...conversationHistory,
      {
        question: currentQuestion.question,
        type: currentQuestion.type,
        answer,
        eval: evalResult,
      }
    ];
    setConversationHistory(newHistory);

    // DYNAMIC LENGTH LOGIC
    // If they did great, extend (+1 up to 11)
    // If they did poorly/skipping, shorten (-1 down to 5)
    let newTotal = totalQuestions;
    if (evalResult.score >= 8 && totalQuestions < 11) newTotal += 1;
    if (evalResult.score <= 3 && totalQuestions > 5) newTotal -= 1;
    setTotalQuestions(newTotal);

    const nextIndex = questionIndex + 1;

    if (nextIndex >= newTotal) {
      // All questions done — generate verdict
      setStep(STEP.GENERATING_VERDICT);
      setLoadingMsg('analyzing your complete interview...');
      const v = await generateFinalVerdict(session, resumeProfile, newHistory);
      setVerdict(v);
      setStep(STEP.VERDICT);
    } else {
      // Generate next dynamic question
      setQuestionIndex(nextIndex);
      const nextQ = await getNextQuestion(newHistory, session, resumeProfile, nextIndex, resumeProfile.firstQuestion);
      setCurrentQuestion(nextQ);
      setIsSubmitting(false);
    }
  }, [currentQuestion, conversationHistory, questionIndex, session, resumeProfile, totalQuestions]);

  const handleRestart = React.useCallback(() => {
    setStep(STEP.SETUP);
    setSession(null);
    setResumeProfile(null);
    setConversationHistory([]);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setTotalQuestions(6);
    setVerdict(null);
  }, []);

  return (
    <div className={s.app}>
      {(step === STEP.ANALYZING || step === STEP.GENERATING_VERDICT) && (
        <LoadingScreen message={loadingMsg} />
      )}
      {step === STEP.SETUP && <SetupScreen onStart={handleStart} />}
      {step === STEP.INTERVIEW && currentQuestion && (
        <InterviewScreen
          session={session}
          resumeProfile={resumeProfile}
          currentQuestion={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          conversationHistory={conversationHistory}
          onSubmit={handleSubmitAnswer}
          isSubmitting={isSubmitting}
        />
      )}
      {step === STEP.VERDICT && verdict && (
        <VerdictScreen
          session={session}
          resumeProfile={resumeProfile}
          verdict={verdict}
          conversationHistory={conversationHistory}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
