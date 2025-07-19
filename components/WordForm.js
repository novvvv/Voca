"use client";
import React, { useState } from 'react';

import { addWord } from '@/lib/words';

export default function WordForm() {
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [meaning, setMeaning] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    addWord({
      id: Date.now(),
      word,
      pronunciation,
      meaning,
      createdAt: new Date().toISOString(),
    });

    setWord('');
    setPronunciation('');
    setMeaning('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        placeholder="단어"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        required
      />
      <input
        placeholder="발음 (선택)"
        value={pronunciation}
        onChange={(e) => setPronunciation(e.target.value)}
      />
      <input
        placeholder="뜻"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        required
      />
      <button type="submit">추가</button>
    </form>
  );
}