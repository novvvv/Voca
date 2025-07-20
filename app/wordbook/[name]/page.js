"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WordTable from '@/components/WordTable';
import WordForm from '@/components/WordForm';
import { getWords } from '@/lib/words';
import styles from '@/app/table/table.module.css'; // 기존 스타일 재활용

export default function WordbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // URL의 인코딩된 단어장 이름을 디코딩하여 사용
  const wordbookName = params.name ? decodeURIComponent(params.name) : null;

  const [words, setWords] = useState([]);

  // 단어 목록을 불러오는 함수
  const loadWords = useCallback(() => {
    if (wordbookName) {
      const wordsFromStorage = getWords(wordbookName);
      setWords(wordsFromStorage);
    }
  }, [wordbookName]);

  // 컴포넌트 마운트 시, 그리고 wordbookName이 변경될 때 단어 목록 로드
  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // 단어가 추가/삭제되었을 때 목록을 다시 불러오기 위한 이벤트 리스너
  useEffect(() => {
    const handleStorageUpdate = () => {
      loadWords();
    };
    window.addEventListener('storage-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage-updated', handleStorageUpdate);
    };
  }, [loadWords]);

  if (!wordbookName) {
    return (
      <div className={styles.container}>
        <p>단어장을 찾을 수 없습니다.</p>
        <Link href="/">메인으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/">
        <button className={styles.button} style={{ marginBottom: '20px' }}>
          ← 모든 단어장 보기
        </button>
      </Link>
      <h1>단어장: {wordbookName}</h1>
      <p>이 단어장에 단어를 추가, 삭제, 또는 확인할 수 있습니다.</p>
      
      {/* WordForm에 wordbookName 전달 */}
      <WordForm wordbookName={wordbookName} />
      
      {/* WordTable에 words와 wordbookName 전달 */}
      <WordTable words={words} wordbookName={wordbookName} />
    </div>
  );
}
