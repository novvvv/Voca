"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getWordbookNames, deleteWordbook, getWordbookStats, renameWordbook } from '@/lib/words';
import styles from './wordbooks.module.css';

export default function WordbooksPage() {

  const [wordbooks, setWordbooks] = useState([]);
  const [editingWordbookName, setEditingWordbookName] = useState(null);
  const [updatedWordbookName, setUpdatedWordbookName] = useState('');

  const loadWordbooks = useCallback(() => {
    const names = getWordbookNames();
    const wordbookData = names.map(name => ({
      name,
      stats: getWordbookStats(name)
    }));
    setWordbooks(wordbookData);
  }, []);

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

  const handleDeleteWordbook = (name) => {
    if (confirm(`'${name}' 단어장을 정말 삭제하시겠습니까? 모든 단어가 사라집니다.`)) {
      deleteWordbook(name);
    }
  };

  const handleStartEditing = (name) => {
    setEditingWordbookName(name);
    setUpdatedWordbookName(name);
  };

  const handleCancelEditing = () => {
    setEditingWordbookName(null);
    setUpdatedWordbookName('');
  };

  const handleRenameWordbook = (oldName) => {
    const newName = updatedWordbookName.trim();
    if (newName === '') {
      alert('단어장 이름은 비워둘 수 없습니다.');
      return;
    }
    if (oldName === newName) {
      handleCancelEditing();
      return;
    }
    renameWordbook(oldName, newName);
    handleCancelEditing();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>단어장 관리</h1>
      
      <div className={styles.wordbookGrid}>
        {wordbooks.length > 0 ? (
          wordbooks.map(wb => (
            <div key={wb.name} className={styles.wordbookCard}>
            
              {editingWordbookName === wb.name ? (
                <div className={styles.renameContainer}>
                  <input
                    type="text"
                    value={updatedWordbookName}
                    onChange={(e) => setUpdatedWordbookName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameWordbook(wb.name)}
                    autoFocus
                    className={styles.input}
                  />
                  <button onClick={() => handleRenameWordbook(wb.name)} className={`${styles.button} ${styles.saveButton}`}>저장</button>
                  <button onClick={handleCancelEditing} className={`${styles.button} ${styles.cancelButton}`}>취소</button>
                </div>
              ) : (
                <div className={styles.titleContainer}>
                  <h2>{wb.name}</h2>
                  <button onClick={() => handleStartEditing(wb.name)} className={styles.iconButton}>
                    <img src="/img/edit-text.png" alt="수정" />
                  </button>
                </div>
              )}
              
              <div className={styles.buttonGroup}>
                <Link href={`/wordbook/${encodeURIComponent(wb.name)}`} className={styles.cardButton}>
                  단어 관리
                </Link>
                <Link href={`/scarecrow?wordbook=${encodeURIComponent(wb.name)}&mode=all`} className={`${styles.cardButton} ${styles.practiceButton}`}>
                  전체 연습
                </Link>
                <Link href={`/scarecrow?wordbook=${encodeURIComponent(wb.name)}&mode=unmemorized`} className={`${styles.cardButton} ${styles.practiceButton}`}>
                  미암기 연습
                </Link>
              </div>

              <div className={styles.statsContainer}>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill}
                    style={{ width: `${wb.stats.total > 0 ? (wb.stats.memorized / wb.stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className={styles.statsText}>{`${wb.stats.memorized} / ${wb.stats.total} 단어 암기`}</p>
              </div>

              <button 
                  onClick={() => handleDeleteWordbook(wb.name)} 
                  className={`${styles.button} ${styles.deleteButton}`}>
                    삭제
              </button>
              
            </div>
          ))
        ) : (
          <p className={styles.emptyMessage}>단어장이 없습니다. <Link href="/">메인으로 돌아가</Link> 새 단어장을 추가해보세요.</p>
        )}
      </div>
    </div>
  );
}
