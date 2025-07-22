"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getWordbookNames, addWordbook, deleteWordbook, getWordbookStats } from '@/lib/words';
import styles from './table/table.module.css';
import CsvImportForm from '@/components/CsvImportForm';

export default function HomePage() {

  // ✨1.state✨
  const [wordbooks, setWordbooks] = useState([]);
  const [newWordbookName, setNewWordbookName] = useState('');

  // ✨2.Method✨
  const loadWordbooks = useCallback(() => {
    const names = getWordbookNames();
    const wordbookData = names.map(name => ({
      name,
      stats: getWordbookStats(name)
    }));
    setWordbooks(wordbookData);
  }, []);

  // ✨3.Method✨
  useEffect(() => {
    loadWordbooks();
    
    const handleStorageUpdate = () => {
      loadWordbooks();
    };

    window.addEventListener('storage-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage-updated', handleStorageUpdate);
    };
  }, [loadWordbooks]);

  const handleAddWordbook = () => {
    if (newWordbookName.trim() === '') {
      alert('단어장 이름을 입력하세요.');
      return;
    }
    addWordbook(newWordbookName.trim());
    setNewWordbookName('');
  };

  const handleDeleteWordbook = (name) => {
    if (confirm(`'${name}' 단어장을 정말 삭제하시겠습니까? 모든 단어가 사라집니다.`)) {
      deleteWordbook(name);
    }
  };

  return (
    <div className={styles.container}>
      <h1>나의 단어장</h1>
      <p>학습할 단어장을 선택하거나 새로 만드세요.</p>

      <div className={styles.formContainer} style={{ marginBottom: '30px' }}>
        <input
            type="text"
            value={newWordbookName}
            onChange={(e) => setNewWordbookName(e.target.value)}
            placeholder="새 단어장 이름"
            className={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWordbook()}
        />
        <button onClick={handleAddWordbook} className={styles.button}>새 단어장 추가</button>
      </div>

      {/* CSV 파일로 단어장 생성 UI - 분리된 컴포넌트 사용 
        컴포넌트에서 단어장 생성을 성공하면 loadWordbooks 메서드를 실행되도록 props를 전달하여,
        단어장 목록을 실시간으로 업데이트 
      */}
      <CsvImportForm onImportSuccess={loadWordbooks} />

      <div className={styles.wordbookList}>
        {wordbooks.length > 0 ? (
          wordbooks.map(wb => (
            <div key={wb.name} className={styles.wordbookItem}>
              <h2>{wb.name}</h2>
              <div className={styles.buttonGroup}>
                <Link href={`/wordbook/${encodeURIComponent(wb.name)}`}>
                  <button className={styles.button}>단어 관리</button>
                </Link>
                {/* Practice buttons updated */}
                <Link href={`/scarecrow?wordbook=${encodeURIComponent(wb.name)}&mode=all`}>
                  <button className={`${styles.button} ${styles.practiceButton}`}>전체 연습</button>
                </Link>
                <Link href={`/scarecrow?wordbook=${encodeURIComponent(wb.name)}&mode=unmemorized`}>
                  <button className={`${styles.button} ${styles.practiceButton}`}>미암기 연습</button>
                </Link>
                <button 
                  onClick={() => handleDeleteWordbook(wb.name)} 
                  className={`${styles.button} ${styles.deleteButton}`}>
                    삭제
                </button>
              </div>
              <div>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill}
                    style={{ width: `${wb.stats.total > 0 ? (wb.stats.memorized / wb.stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <p>{`${wb.stats.memorized} / ${wb.stats.total} 단어 암기`}</p>
              </div>
            </div>
          ))
        ) : (
          <p>단어장이 없습니다. 새 단어장을 추가해보세요.</p>
        )}
      </div>
    </div>
  );
}