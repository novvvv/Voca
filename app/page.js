"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWordbookNames, addWordbook, deleteWordbook, addWordsToWordbook } from '@/lib/words'; // addWordsToWordbook 추가
import Papa from 'papaparse'; // papaparse import
import styles from './table/table.module.css'; // 기존 스타일 재활용

export default function HomePage() {
  const [wordbookNames, setWordbookNames] = useState([]);
  const [newWordbookName, setNewWordbookName] = useState('');
  const [csvFile, setCsvFile] = useState(null); // CSV 파일 상태 추가
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

  // CSV 파일 선택 핸들러
  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  // CSV 파일 가져오기 핸들러
  const handleImportCsv = () => {
    if (!csvFile) {
      alert('CSV 파일을 선택해주세요.');
      return;
    }

    if (newWordbookName.trim() === '') {
      alert('새로 생성할 단어장 이름을 입력해주세요.');
      return;
    }

    Papa.parse(csvFile, {
      header: true, // 첫 줄을 헤더로 사용
      skipEmptyLines: true,
      complete: (results) => {
        const parsedWords = results.data.map(row => ({
          word: row['단어'] || '', // CSV 헤더에 맞게 필드명 조정
          meaning: row['뜻'] || '',
          isMemorized: (row['암기여부'] || '').toLowerCase() === 'true' // 'TRUE' 문자열을 boolean으로 변환
        })).filter(word => word.word.trim() !== '' && word.meaning.trim() !== ''); // 단어와 뜻이 비어있지 않은 경우만 추가

        if (parsedWords.length === 0) {
          alert('CSV 파일에서 유효한 단어를 찾을 수 없습니다. "단어"와 "뜻" 헤더가 올바른지 확인해주세요.');
          return;
        }

        // 새 단어장 추가 (이미 존재하면 추가되지 않음)
        addWordbook(newWordbookName.trim());
        // 파싱된 단어들을 새 단어장에 추가
        addWordsToWordbook(parsedWords, newWordbookName.trim());

        alert(`${newWordbookName} 단어장에 ${parsedWords.length}개의 단어가 추가되었습니다.`);
        setNewWordbookName(''); // 입력 필드 초기화
        setCsvFile(null); // 파일 선택 초기화
        // 파일 입력 필드 초기화 (선택 사항)
        document.getElementById('csvFileInput').value = '';
      },
      error: (error) => {
        alert('CSV 파일을 파싱하는 중 오류가 발생했습니다: ' + error.message);
      }
    });
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

      {/* CSV 파일로 단어장 생성 UI */}
      <div style={{ marginTop: '20px', marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2>CSV 파일로 단어장 생성</h2>
        <p>CSV 파일을 선택하고 새로운 단어장 이름을 입력하여 단어장을 생성합니다.</p>
        <input
          type="file"
          id="csvFileInput" // ID 추가
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <input
          type="text"
          value={newWordbookName} // 기존 newWordbookName 상태 재활용
          onChange={(e) => setNewWordbookName(e.target.value)}
          placeholder="새 단어장 이름 (CSV)"
          className={styles.input}
          style={{ marginBottom: '10px' }}
        />
        <button onClick={handleImportCsv} className={styles.button}>
          CSV로 단어장 생성
        </button>
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