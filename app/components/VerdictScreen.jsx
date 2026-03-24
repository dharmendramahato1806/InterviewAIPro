"use client";

import React from 'react';
import s from './VerdictScreen.module.css';

const DECISION_CONFIG = {
  'Selected': { color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(74,222,128,0.3)', emoji: '✅', label: 'SELECTED' },
  'Rejected': { color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(248,113,113,0.3)', emoji: '❌', label: 'REJECTED' },
  'On Hold': { color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'rgba(251,191,36,0.3)', emoji: '⏸️', label: 'ON HOLD' },
};

const TYPE_COLORS = {
  'Technical': { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  'Behavioral': { bg: 'var(--green-dim)', color: 'var(--green)' },
  'Cross-question': { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  'Situational': { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  'Coding': { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  'Deep-dive': { bg: 'var(--purple-dim)', color: '#a855f7' },
};

function RadarBar({ label, value }) {
  const color = value >= 75 ? 'var(--green)' : value >= 55 ? 'var(--amber)' : 'var(--red)';
  return (
    <div className={s.radarRow}>
      <div className={s.radarLabel}>{label}</div>
      <div className={s.radarTrack}>
        <div className={s.radarFill} style={{ width: `${value}%`, background: color }} />
      </div>
      <div className={s.radarVal} style={{ color }}>{value}</div>
    </div>
  );
}

export default function VerdictScreen({ session, resumeProfile, verdict, conversationHistory, onRestart }) {
  const [tab, setTab] = React.useState('verdict');
  const dc = DECISION_CONFIG[verdict.decision] || DECISION_CONFIG['On Hold'];

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.logo}>
        <div className={s.logoIcon}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></div>
        <div>
          <div className={s.logoName}>Interview Report</div>
          <div className={s.logoTag}>{session.role} · {session.type} · {session.level}</div>
        </div>
      </div>

      {/* Decision card */}
      <div className={s.decisionCard} style={{ borderColor: dc.border, background: dc.bg }}>
        <div className={s.decisionTop}>
          <span className={s.decisionEmoji}>{dc.emoji}</span>
          <div>
            <div className={s.decisionLabel} style={{ color: dc.color }}>{dc.label}</div>
            <div className={s.decisionHeadline}>{verdict.headline}</div>
          </div>
          <div className={s.overallScore} style={{ color: dc.color }}>
            {verdict.overallScore}<span className={s.scoreUnit}>%</span>
          </div>
        </div>
        <div className={s.confidenceBadge}>Confidence: <strong>{verdict.confidence}</strong></div>
      </div>

      {/* Tabs */}
      <div className={s.tabs}>
        {['verdict', 'scores', 'transcript'].map(t => (
          <button key={t} className={`${s.tab} ${tab === t ? s.tabActive : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Verdict */}
      {tab === 'verdict' && (
        <div className={s.tabContent}>
          <div className={s.section}>
            <div className={s.sectionTitle}>🌟 Standout moment</div>
            <div className={s.standout}>{verdict.standoutMoment}</div>
          </div>

          <div className={s.twoCol}>
            <div className={s.card}>
              <div className={s.cardTitle} style={{ color: 'var(--green)' }}>✅ What went well</div>
              {verdict.whatWentWell?.map((w, i) => (
                <div key={i} className={s.listItem}><span className={s.listDot} style={{ background: 'var(--green)' }} />{w}</div>
              ))}
            </div>
            <div className={s.card}>
              <div className={s.cardTitle} style={{ color: 'var(--red)' }}>⚠️ What went poorly</div>
              {verdict.whatWentPoorly?.map((w, i) => (
                <div key={i} className={s.listItem}><span className={s.listDot} style={{ background: 'var(--red)' }} />{w}</div>
              ))}
            </div>
          </div>

          <div className={s.section}>
            <div className={s.sectionTitle}>📈 Areas to improve</div>
            {verdict.improvements?.map((imp, i) => (
              <div key={i} className={s.impCard}>
                <div className={s.impArea}>{imp.area}</div>
                <div className={s.impFeedback}>{imp.feedback}</div>
              </div>
            ))}
          </div>

          <div className={s.nextStepsBox}>
            <div className={s.nsLabel}>Next Steps</div>
            <div className={s.nsText}>{verdict.nextSteps}</div>
          </div>
        </div>
      )}

      {/* Tab: Scores */}
      {tab === 'scores' && (
        <div className={s.tabContent}>
          <div className={s.statsGrid}>
            <div className={s.statCard}>
              <div className={s.statNum} style={{ color: dc.color }}>{verdict.overallScore}%</div>
              <div className={s.statLabel}>Overall Score</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statNum}>{conversationHistory.length}</div>
              <div className={s.statLabel}>Questions Answered</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statNum} style={{ color: 'var(--green)' }}>
                {conversationHistory.filter(h => h.eval?.score >= 7).length}
              </div>
              <div className={s.statLabel}>Strong Answers</div>
            </div>
          </div>

          <div className={s.card} style={{ marginBottom: '1rem' }}>
            <div className={s.cardTitle}>Score Breakdown</div>
            {verdict.scoreBreakdown && Object.entries(verdict.scoreBreakdown).map(([key, val]) => (
              <RadarBar key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={val} />
            ))}
          </div>

          <div className={s.card}>
            <div className={s.cardTitle}>Per-Question Scores</div>
            {conversationHistory.map((h, i) => (
              <div key={i} className={s.qScore}>
                <div className={s.qScoreQ}>Q{i + 1}: {h.question.length > 60 ? h.question.substring(0, 60) + '...' : h.question}</div>
                <div className={s.qScoreBottom}>
                  <span className={s.qScoreNote}>{h.eval?.note}</span>
                  <span className={s.qScoreVal} style={{ color: h.eval?.score >= 7 ? 'var(--green)' : h.eval?.score >= 5 ? 'var(--amber)' : 'var(--red)' }}>
                    {h.eval?.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Transcript */}
      {tab === 'transcript' && (
        <div className={s.tabContent}>
          {conversationHistory.map((h, i) => (
            <div key={i} className={s.transcriptItem}>
              <div className={s.tQuestion}>
                <span className={s.tQBadge} style={{
                  background: TYPE_COLORS[h.type]?.bg || 'var(--bg-card2)',
                  color: TYPE_COLORS[h.type]?.color || 'var(--text-muted)',
                  borderColor: TYPE_COLORS[h.type]?.color ? 'transparent' : 'var(--border)'
                }}>
                  {h.type || 'Question'}
                </span>
                <div className={s.tQText}>Q{i + 1}: {h.question}</div>
              </div>
              <div className={s.tAnswer}>{h.answer}</div>
              {h.eval && <div className={s.tEval}>AI Note: {h.eval.note}</div>}
            </div>
          ))}
        </div>
      )}

      <button className={s.btnRestart} onClick={onRestart}>Start New Interview →</button>
    </div>
  );
}
