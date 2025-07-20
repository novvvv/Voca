"use client";

// 1. useRef를 import 합니다.
import React, { useState, useRef } from 'react';
import { addWord } from '@/lib/words';
import styles from './WordTable.module.css';

export default function WordForm({ wordbookName }) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');

  // 2. '단어 입력' 필드를 위한 ref를 생성합니다.
  const wordInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      alert('단어와 뜻을 모두 입력하세요.');
      return;
    }

    const newWord = {
      id: Date.now().toString(),
      word: word.trim(),
      meaning: meaning.trim(),
    };

    addWord(newWord, wordbookName);

    setWord('');
    setMeaning('');

    // 4. 단어 추가 후, '단어 입력' 필드에 포커스를 맞춥니다.
    if (wordInputRef.current) {
      wordInputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <input
        // 3. 생성한 ref를 input 요소에 연결합니다.
        ref={wordInputRef}
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="단어 입력"
        className={styles.input}
      />
      <input
        type="text"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        placeholder="뜻 입력"
        className={styles.input}
      />
      <button type="submit" className={styles.button}>단어 추가</button>
    </form>
  );
}