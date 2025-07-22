"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { addWordbook, addWordsToWordbook } from '@/lib/words';
import styles from '@/app/table/table.module.css'; // 스타일 재활용

/**
 * CSV 파일을 이용해 단어장을 생성하는 폼 컴포넌트
 * @param {object} props
 * @param {function} props.onImportSuccess - 단어장 추가 성공 시 호출될 콜백 함수
 */
export default function CsvImportForm({ onImportSuccess }) {
  
  // 1. CsvImportForm 컴포넌트가 독립적으로 사용할 상태
  const [csvFile, setCsvFile] = useState(null);
  const [csvWordbookName, setCsvWordbookName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // 2. 핸들러
  // CSV 파일 선택 시, 선택된 파일을 상태에 저장하는 함수
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setCsvFile(event.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  // 'CSV로 단어장 생성' 버튼 클릭 시 실행되는 메인 함수
  const handleImportCsv = () => {
    if (!csvFile) {
      alert('CSV 파일을 선택해주세요.');
      return;
    }

    if (csvWordbookName.trim() === '') {
      alert('새로 생성할 단어장 이름을 입력해주세요.');
      return;
    }

    setIsImporting(true);

    // PapaParse를 사용하여 CSV 파일 파싱
    Papa.parse(csvFile, {
      header: true, // 첫 번째 줄을 헤더로 인식
      skipEmptyLines: true, // 빈 줄은 건너뛰기
      complete: (results) => {
        // '단어', '뜻', '암기여부' 컬럼을 기준으로 데이터 파싱
        const parsedWords = results.data.map(row => ({
          word: row['단어']?.trim() || '',
          meaning: row['뜻']?.trim() || '',
          isMemorized: (row['암기여부'] || '').toLowerCase() === 'true'
        })).filter(word => word.word && word.meaning); // 단어와 뜻이 모두 있는 경우만 필터링

        if (parsedWords.length === 0) {
          alert('CSV 파일에서 유효한 단어를 찾을 수 없습니다. "단어"와 "뜻" 헤더가 올바른지, 내용이 비어있지 않은지 확인해주세요.');
          setIsImporting(false);
          return;
        }

        try {
          // 새 단어장 추가 (lib/words.js 함수 사용)
          addWordbook(csvWordbookName.trim());
          // 파싱된 단어들을 새 단어장에 추가
          addWordsToWordbook(parsedWords, csvWordbookName.trim());

          alert(`'${csvWordbookName}' 단어장에 ${parsedWords.length}개의 단어가 성공적으로 추가되었습니다.`);
          
          // 부모 컴포넌트에게 성공 사실 알림 (단어장 목록 새로고침용)
          if (onImportSuccess) {
            onImportSuccess();
          }

          // 성공 후 상태 및 입력 필드 초기화
          setCsvWordbookName('');
          setCsvFile(null);
          document.getElementById('csvFileInput').value = '';

        } catch (error) {
          alert(error.message);
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        alert('CSV 파일을 파싱하는 중 오류가 발생했습니다: ' + error.message);
        setIsImporting(false);
      }
    });
  };

  // 3. JSX 렌더링
  return (
    <div style={{ marginTop: '20px', marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2>CSV 파일로 단어장 생성</h2>
      <p>CSV 파일(*.csv)을 선택하고 새로운 단어장 이름을 입력하여 단어장을 생성합니다.</p>
      <p style={{ fontSize: '0.8rem', color: '#666' }}>※ CSV 파일은 '단어', '뜻', '암기여부' 헤더를 포함해야 합니다.</p>
      
      <input
        type="file"
        id="csvFileInput"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'block', marginBottom: '10px' }}
        disabled={isImporting}
      />
      <input
        type="text"
        value={csvWordbookName}
        onChange={(e) => setCsvWordbookName(e.target.value)}
        placeholder="새 단어장 이름 (CSV)"
        className={styles.input}
        style={{ marginBottom: '10px' }}
        disabled={isImporting}
      />
      <button onClick={handleImportCsv} className={styles.button} disabled={isImporting}>
        {isImporting ? '생성 중...' : 'CSV로 단어장 생성'}
      </button>
    </div>
  );
}