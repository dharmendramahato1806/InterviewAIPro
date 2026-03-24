"use client";

import React from 'react';
import s from './SetupScreen.module.css';

const TYPES = [
  { id: 'Technical', icon: '💻', label: 'Technical', sub: 'Coding & concepts' },
  { id: 'Behavioral', icon: '🧠', label: 'Behavioral', sub: 'Soft skills & STAR' },
  { id: 'Mixed', icon: '⚡', label: 'Mixed', sub: 'Both combined' },
];

const LEVELS = ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)'];

export default function SetupScreen({ onStart }) {
  const [role, setRole] = React.useState('');
  const [level, setLevel] = React.useState('');
  const [type, setType] = React.useState('Mixed');
  const [file, setFile] = React.useState(null);
  const [dragging, setDragging] = React.useState(false);
  const fileRef = React.useRef();

  function handleFile(f) {
    if (!f) return;
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type) && !f.name.endsWith('.pdf') && !f.name.endsWith('.txt') && !f.name.endsWith('.doc') && !f.name.endsWith('.docx')) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }
    setFile(f);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleStart() {
    if (!role.trim()) { alert('Please enter the job role.'); return; }
    if (!level) { alert('Please select experience level.'); return; }
    if (!file) { alert('Please upload your resume to start the tailored interview.'); return; }
    onStart({ role: role.trim(), level, type, file });
  }

  return (
    <div className={s.wrap}>
      <div className={s.logo}>
        <div className={s.logoIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>
        <div>
          <div className={s.logoName}>InterviewAI Pro</div>
          <div className={s.logoTag}>resume-aware · dynamic · real interviewer</div>
        </div>
      </div>

      <h1 className={s.title}>Your AI interviewer<br />reads your resume.</h1>
      <p className={s.sub}>Upload your CV, pick the role, and get grilled by an AI that asks follow-up questions, challenges your answers, and tells you if you'd get hired.</p>

      <div className={s.grid2}>
        <div className={s.field}>
          <label className={s.label}>Job Role</label>
          <input className={s.input} placeholder="e.g. React Developer" value={role} onChange={e => setRole(e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Experience Level</label>
          <select className={s.select} value={level} onChange={e => setLevel(e.target.value)}>
            <option value="">Select level</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>Interview Type</label>
        <div className={s.typeGrid}>
          {TYPES.map(t => (
            <button key={t.id} className={`${s.typeCard} ${type === t.id ? s.selected : ''}`} onClick={() => setType(t.id)}>
              <span className={s.tIcon}>{t.icon}</span>
              <span className={s.tLabel}>{t.label}</span>
              <span className={s.tSub}>{t.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>Resume / CV</label>
        <div
          className={`${s.dropzone} ${dragging ? s.dragging : ''} ${file ? s.hasFile : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className={s.fileInfo}>
              <span className={s.fileIcon}>📄</span>
              <div>
                <div className={s.fileName}>{file.name}</div>
                <div className={s.fileSize}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
              </div>
              <button className={s.removeFile} onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
            </div>
          ) : (
            <div className={s.dropInner}>
              <span className={s.dropIcon}>📎</span>
              <div className={s.dropText}>Drop your resume here or <span className={s.dropLink}>browse</span></div>
              <div className={s.dropHint}>PDF, DOC, DOCX, TXT supported</div>
            </div>
          )}
        </div>
      </div>

      <div className={s.bullets}>
        {['AI reads your resume and asks tailored questions', 'Dynamic cross-questioning like a real interview', 'Final verdict: Selected, Rejected, or On Hold'].map((b, i) => (
          <div key={i} className={s.bullet}><span className={s.dot} />{b}</div>
        ))}
      </div>

      <button className={s.btnStart} onClick={handleStart}>
        Start Interview <span className={s.arrow}>→</span>
      </button>
    </div>
  );
}
