"use client";

import React from 'react';
import s from './LoadingScreen.module.css';

export default function LoadingScreen({ message = 'Please wait...' }) {
  return (
    <div className={s.wrap}>
      <div className={s.spinner} />
      <p className={s.msg}>{message}</p>
    </div>
  );
}
