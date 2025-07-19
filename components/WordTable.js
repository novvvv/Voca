"use client";

// components/WordTable.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWords, deleteWord } from '@/lib/words';
import styles from './WordTable.module.css';

export default function WordTable({filter = 'all'}) {
  
  const [words, setWords] = useState([]);
  const [checkedWords, setCheckedWords] = useState({});

  const loadWords = () => {
    const storedWords = getWords();
    setWords(storedWords);

    const storedChecked = localStorage.getItem('checkedWords');
    if (storedChecked) {
      setCheckedWords(JSON.parse(storedChecked));
    }
  };

  useEffect(() => {
    loadWords();
    window.addEventListener('word-updated', loadWords);
    return () => window.removeEventListener('word-updated', loadWords);
  }, []);

  const handleCheck = (wordId) => {
    const newCheckedWords = { ...checkedWords, [wordId]: !checkedWords[wordId] };
    setCheckedWords(newCheckedWords);
    localStorage.setItem('checkedWords', JSON.stringify(newCheckedWords));
  };

  const handleDelete = (wordId) => {
    deleteWord(wordId);
    const newCheckedWords = { ...checkedWords };
    delete newCheckedWords[wordId];
    setCheckedWords(newCheckedWords);
    localStorage.setItem('checkedWords', JSON.stringify(newCheckedWords));
  };

  // ✨ filteredWords : 모든 단어, 암기한 단어, 외우지 않은 단어 필터링 
  const filteredWords = words.filter(word => {
    if (filter === 'memorized') {
      return checkedWords[word.id];
    }
    if (filter === 'unmemorized') {
      return !checkedWords[word.id];
    }
    return true; 
  });


  if (words.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <Link href="/" className={styles.link}>메인으로 돌아가기</Link>
        <div className={styles.emptyMessage}>등록된 단어가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <Link href="/" className={styles.link}>메인으로 돌아가기</Link>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}></th>
            <th className={styles.th}>번호</th>
            <th className={styles.th}>단어</th>
            <th className={styles.th}>발음</th>
            <th className={styles.th}>뜻</th>
            <th className={styles.th}>추가된 날짜</th>
            <th className={styles.th}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {filteredWords.map((w, index) => (
            <tr key={w.id} className={`${styles.tr} ${checkedWords[w.id] ? styles.checkedTr : ''}`}>

              <td className={styles.td}>
                <input 
                  type="checkbox" 
                  checked={!!checkedWords[w.id]}
                  onChange={() => handleCheck(w.id)}
                />
              </td>

              <td className={styles.td}>{index + 1}</td>
              <td className={styles.td}>{w.word}</td>
              <td className={styles.td}>{w.pronunciation}</td>
              <td className={styles.td}>{w.meaning}</td>
              <td className={styles.td}>{new Date(w.createdAt).toLocaleDateString()}</td>
              <td className={styles.td}>
                <button onClick={() => handleDelete(w.id)} className={styles.deleteButton}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}