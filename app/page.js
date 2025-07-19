"use client";

// app/page.js
import React, { useState, useEffect } from 'react';
import WordForm from '@/components/WordForm';
import Link from 'next/link';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  fontFamily: 'sans-serif'
};

const buttonStyle = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '15px 32px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  margin: '4px 2px',
  cursor: 'pointer',
  borderRadius: '12px',
  width: '200px'
};

const settingsContainerStyle = {
  marginTop: '20px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  width: '300px',
  textAlign: 'center'
};

const selectStyle = {
  width: '100%',
  padding: '8px',
  fontSize: '1rem',
  borderRadius: '4px'
};

export default function Home() {
  const [practiceMode, setPracticeMode] = useState('all');

  useEffect(() => {
    const savedMode = localStorage.getItem('practiceMode') || 'all';
    setPracticeMode(savedMode);
  }, []);

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setPracticeMode(newMode);
    localStorage.setItem('practiceMode', newMode);
  };

  return (
    <div style={containerStyle}>
      <h1>단어장</h1>
      <WordForm />
      
      <div style={{ marginTop: '20px' }}>
        <Link href="/scarecrow">
          <button style={buttonStyle}>연습하기</button>
        </Link>
        <Link href="/table">
          <button style={buttonStyle}>단어 목록 보기</button>
        </Link>
      </div>

      <div style={settingsContainerStyle}>
        <h2>연습 설정</h2>
        <label htmlFor="practice-mode">연습 모드 선택:</label>
        <select id="practice-mode" value={practiceMode} onChange={handleModeChange} style={selectStyle}>
          <option value="all">모든 단어</option>
          <option value="unmemorized">외우지 않은 단어</option>
        </select>
      </div>
    </div>
  );
}