"use client";

import React from 'react';
import s from './InterviewScreen.module.css';

const TYPE_COLORS = {
  'Technical': { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  'Behavioral': { bg: 'var(--green-dim)', color: 'var(--green)' },
  'Cross-question': { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  'Situational': { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  'Coding': { bg: 'var(--blue-dim)', color: 'var(--blue)' },
};

export default function InterviewScreen({ session, resumeProfile, currentQuestion, questionIndex, totalQuestions, conversationHistory, onSubmit, isSubmitting }) {
  const [answer, setAnswer] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const textareaRef = React.useRef();
  const bottomRef = React.useRef();
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) setAnswer(prev => prev + (prev.length ? ' ' : '') + transcript);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  React.useEffect(() => { 
    setAnswer(''); 
    setIsRecording(false);
    recognitionRef.current?.stop();
    textareaRef.current?.focus(); 
  }, [questionIndex]);

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversationHistory]);

  const progress = ((questionIndex) / totalQuestions) * 100;
  const qColor = TYPE_COLORS[currentQuestion?.type] || TYPE_COLORS['Technical'];

  function toggleRecording() {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please try Chrome.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  function handleSubmit() {
    const text = answer.trim();
    const isSkip = /skip|don't know|i don't know|next|pass|no idea/i.test(text);
    if (text.length < 15 && !isSkip) { 
      alert('Please give a more detailed answer, or type "pass/skip" if you do not know the answer.'); 
      return; 
    }
    recognitionRef.current?.stop();
    setIsRecording(false);
    onSubmit(text);
    setAnswer('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
  }

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.role}>{session.role}</div>
          <div className={s.meta}>{session.type} · {session.level}</div>
        </div>
        <div className={s.qBadge}>{questionIndex + 1} / {totalQuestions}</div>
      </div>

      <div className={s.progressBar}><div className={s.progressFill} style={{ width: `${progress}%` }} /></div>

      {/* Candidate Profile Card */}
      <div className={s.profileCard}>
        <div className={s.profileHeader}>
          <div className={s.profileAvatar}>{resumeProfile.name.charAt(0).toUpperCase()}</div>
          <div className={s.profileMain}>
            <div className={s.profileName}>{resumeProfile.name}</div>
            <div className={s.profileExp}>{resumeProfile.experience}</div>
          </div>
        </div>
        
        {resumeProfile.summary && (
          <div className={s.profileSummary}>{resumeProfile.summary}</div>
        )}

        <div className={s.profileSkills}>
          {resumeProfile.skills.map((sk, i) => (
            <span key={i} className={s.skill}>{sk}</span>
          ))}
        </div>

        {resumeProfile.strengths && resumeProfile.strengths.length > 0 && (
          <div className={s.profileStrengths}>
            {resumeProfile.strengths.map((st, i) => (
              <span key={i} className={s.strength}>✨ {st}</span>
            ))}
          </div>
        )}
      </div>

      {/* Previous Q&A history (collapsed) */}
      {conversationHistory.length > 0 && (
        <div className={s.history}>
          {conversationHistory.map((h, i) => (
            <div key={i} className={s.historyItem}>
              <div className={s.historyMeta}>
                <span className={s.historyType} style={{ 
                  background: TYPE_COLORS[h.type]?.bg || TYPE_COLORS['Technical'].bg, 
                  color: TYPE_COLORS[h.type]?.color || TYPE_COLORS['Technical'].color 
                }}>{h.type}</span>
                {h.eval && (
                  <span className={s.historyScore} style={{ color: h.eval.score >= 7 ? 'var(--green)' : h.eval.score >= 5 ? 'var(--amber)' : 'var(--red)' }}>
                    {h.eval.score}/10
                  </span>
                )}
              </div>
              <div className={s.historyQ}>Q{i + 1}: {h.question}</div>
              <div className={s.historyA}>{h.answer}</div>
              {h.eval?.note && <div className={s.historyNote}>AI Note: {h.eval.note}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Current question */}
      <div className={s.questionBox}>
        <div className={s.qMeta}>
          <span className={s.qTypeBadge} style={{ background: qColor.bg, color: qColor.color }}>
            {currentQuestion?.type || 'Question'}
          </span>
          {currentQuestion?.intent && <span className={s.qIntent}>assessing: {currentQuestion.intent}</span>}
        </div>
        <div className={s.questionText}>{currentQuestion?.question || 'Loading question...'}</div>
      </div>

      {/* Answer input */}
      <textarea
        ref={textareaRef}
        className={`${s.textarea} ${currentQuestion?.type === 'Coding' ? s.coding : ''}`}
        placeholder={currentQuestion?.type === 'Coding' ? "Write your code here... (use proper brackets and indentation)" : "Type your answer... (Ctrl+Enter to submit)"}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={10}
        disabled={isSubmitting}
      />

      <div className={s.footer}>
        <div className={s.controls}>
          <button 
            className={`${s.btnMic} ${isRecording ? s.recording : ''}`} 
            onClick={toggleRecording}
            title={isRecording ? 'Stop Recording' : 'Voice Answer'}
          >
            {isRecording ? '⏹️ Recording...' : '🎙️ Mic'}
          </button>
          <span className={s.hint}>Ctrl+Enter to submit · {answer.length} chars</span>
        </div>
        <button className={s.btnSubmit} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Evaluating...' : questionIndex + 1 === totalQuestions ? 'Submit Final Answer →' : 'Submit Answer →'}
        </button>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
