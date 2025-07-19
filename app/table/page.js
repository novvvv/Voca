"use client";

// app/table/page.js
import React, { useState } from 'react';
import WordTable from '@/components/WordTable';
import styles from './table.module.css';

export default function TablePage() {
  const [filter, setFilter] = useState('all'); // 'all', 'unmemorized', 'memorized'

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          모든 단어
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'unmemorized' ? styles.active : ''}`}
          onClick={() => setFilter('unmemorized')}
        >
          외우지 않은 단어
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'memorized' ? styles.active : ''}`}
          onClick={() => setFilter('memorized')}
        >
          암기한 단어
        </button>
      </div>
      <WordTable filter={filter} />
    </div>
  );
}