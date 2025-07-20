"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWordbookNames, addWordbook, deleteWordbook } from '@/lib/words';
import styles from './table/table.module.css'; // 기존 스타일 재활용

export default function HomePage() {
  const [wordbookNames, setWordbookNames] = useState([]);
  const [newWordbookName, setNewWordbookName] = useState('');
  const router = useRouter();

  const loadWordbookNames = useCallback(() => {
    const names = getWordbookNames();
    setWordbookNames(names);
  }, []);

  useEffect(() => {
    loadWordbookNames();
    
    const handleStorageUpdate = () => {
      loadWordbookNames();
    };
    window.addEventListener('storage-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage-updated', handleStorageUpdate);
    };
  }, [loadWordbookNames]);

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

      <div className={styles.wordbookList}>
        {wordbookNames.length > 0 ? (
          wordbookNames.map(name => (
            <div key={name} className={styles.wordbookItem}>
              <h2>{name}</h2>
              <div className={styles.buttonGroup}>
                <Link href={`/wordbook/${encodeURIComponent(name)}`}>
                  <button className={styles.button}>단어 관리</button>
                </Link>
                {/* Practice buttons updated */}
                <Link href={`/scarecrow?wordbook=${encodeURIComponent(name)}&mode=all`}>
                  <button className={`${styles.button} ${styles.practiceButton}`}>전체 연습</button>
                </Link>
                <Link href={`/scarecrow?wordbook=${encodeURIComponent(name)}&mode=unmemorized`}>
                  <button className={`${styles.button} ${styles.practiceButton}`}>미암기 연습</button>
                </Link>
                <button 
                  onClick={() => handleDeleteWordbook(name)} 
                  className={`${styles.button} ${styles.deleteButton}`}>
                    삭제
                </button>
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