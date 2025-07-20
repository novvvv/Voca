"use client";

import React from 'react';
import { deleteWord, toggleWordMemorized } from '@/lib/words';
import styles from './WordTable.module.css';

export default function WordTable({ words, wordbookName }) {

  const handleDelete = (wordId) => {
    if (confirm('이 단어를 정말 삭제하시겠습니까?')) {
      deleteWord(wordId, wordbookName);
    }
  };

  const handleToggleMemorized = (wordId) => {
    toggleWordMemorized(wordId, wordbookName);
  };

  if (!words || words.length === 0) {
    return <p>단어장에 단어가 없습니다. 위에서 단어를 추가해보세요.</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.thNumber}>번호</th>
          <th className={styles.thCheck}>암기</th>
          <th>단어</th>
          <th>뜻</th>
          <th className={styles.thDate}>생성일</th>
          <th className={styles.thAction}>삭제</th>
        </tr>
      </thead>
      <tbody>
        {words.map((word, index) => (
          <tr key={word.id} className={word.isMemorized ? styles.memorizedRow : ''}>
            <td className={styles.tdCenter}>{index + 1}</td>
            <td className={styles.tdCenter}>
              <input
                type="checkbox"
                checked={word.isMemorized || false}
                onChange={() => handleToggleMemorized(word.id)}
                className={styles.checkbox}
              />
            </td>
            <td>{word.word}</td>
            <td>{word.meaning}</td>
            <td className={styles.tdCenter}>
              {word.createdAt ? new Date(word.createdAt).toLocaleDateString() : 'N/A'}
            </td>
            <td className={styles.tdCenter}>
              <button 
                onClick={() => handleDelete(word.id)}
                className={styles.deleteButton}
              >
                삭제
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}