// app/scarecrow/page.js
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getWords, saveWordsForBook } from '@/lib/words';
import GameLog from '@/components/GameLog';
import styles from './scarecrow.module.css';

const monsters = [
  { id: 1, image: '/Monster/hidden_monster1.png', damagedImage: '/Monster/hidden_monster1_damaged.png' },
  { id: 2, image: '/Monster/hidden_monster2.png', damagedImage: '/Monster/hidden_monster2_damaged.png' },
  { id: 3, image: '/Monster/hidden_monster3.png', damagedImage: '/Monster/hidden_monster3_damaged.png' },
  { id: 4, image: '/Monster/hidden_monster4.png', damagedImage: '/Monster/hidden_monster4_damaged.png' },
  { id: 5, image: '/Monster/hidden_monster5.png', damagedImage: '/Monster/hidden_monster5_damaged.png' },
  { id: 6, image: '/Monster/hidden_monster6.png', damagedImage: '/Monster/hidden_monster6_damaged.png' },
  { id: 7, image: '/Monster/hidden_monster7.png', damagedImage: '/Monster/hidden_monster7_damaged.png' },
];

const playerImage = '/Monster/123.jpg';

export default function ScarecrowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wordbookName = searchParams.get('wordbook');
  const practiceMode = searchParams.get('mode') || 'all';

  const [sessionWords, setSessionWords] = useState([]);
  const [practiceList, setPracticeList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMonster, setCurrentMonster] = useState(null);
  const [monsterImage, setMonsterImage] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [displayWord, setDisplayWord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(true);
  const [autoAdvanceInterval, setAutoAdvanceInterval] = useState(3);
  const [isAutoAdvanceActive, setIsAutoAdvanceActive] = useState(false);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  }, []);

  const startNewRound = useCallback((index, wordsList) => {
    if (!wordsList || wordsList.length === 0) return;
    const wordToDisplay = wordsList[index];
    setDisplayWord(wordToDisplay);
    setCurrentIndex(index);
    addLog(`다음 단어: "${wordToDisplay.word}"`);
    const newMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setCurrentMonster(newMonster);
    setMonsterImage(newMonster.image);
    setShowMeaning(false);
  }, [addLog]);

  useEffect(() => {
    if (!wordbookName) {
      setIsLoading(false);
      return;
    }
    addLog(`'${wordbookName}' 단어장으로 게임을 시작합니다. (${practiceMode} 모드)`);
    const allWordsForBook = getWords(wordbookName);
    setSessionWords(JSON.parse(JSON.stringify(allWordsForBook)));
    let filteredWords = practiceMode === 'unmemorized'
      ? allWordsForBook.filter(word => !word.isMemorized)
      : allWordsForBook;
    setPracticeList(filteredWords);
    if (filteredWords.length > 0) {
      startNewRound(0, filteredWords);
    } else {
      setDisplayWord(null);
    }
    setIsLoading(false);
  }, [wordbookName, practiceMode, addLog, startNewRound]);

  const handleNext = useCallback(() => {
    if (practiceList.length === 0) return;
    const nextIndex = (currentIndex + 1) % practiceList.length;
    startNewRound(nextIndex, practiceList);
  }, [currentIndex, practiceList, startNewRound]);

  const handleShowMeaningAndDamage = useCallback(() => {
    if (!showMeaning) {
      addLog(`"${displayWord.word}"의 뜻을 확인했습니다.`);
      setShowMeaning(true);
      if (currentMonster) {
        setMonsterImage(currentMonster.damagedImage);
      }
    }
    if (displayWord) {
      const updatedSessionWords = sessionWords.map(w =>
        w.id === displayWord.id ? { ...w, isMemorized: false } : w
      );
      setSessionWords(updatedSessionWords);
      addLog(`"${displayWord.word}" 단어를 미암기 상태로 변경했습니다.`);
    }
  }, [addLog, currentMonster, displayWord, sessionWords, showMeaning]);

  const handleMemorizeWord = useCallback(() => {
    if (displayWord) {
      if (!showMeaning) {
        setShowMeaning(true);
        if (currentMonster) setMonsterImage(currentMonster.damagedImage);
      }
      addLog(`"${displayWord.word}" 단어를 암기했습니다!`);
      const updatedSessionWords = sessionWords.map(w =>
        w.id === displayWord.id ? { ...w, isMemorized: true } : w
      );
      setSessionWords(updatedSessionWords);
    }
  }, [addLog, currentMonster, displayWord, sessionWords, showMeaning]);

  useEffect(() => {
    if (isAutoAdvanceActive && displayWord) {
      const meaningTimeout = setTimeout(() => {
        addLog(`"${displayWord.word}"의 뜻을 자동으로 확인했습니다.`);
        setShowMeaning(true);
        if (currentMonster) {
          setMonsterImage(currentMonster.damagedImage);
        }
      }, autoAdvanceInterval * 1000);

      const nextWordTimeout = setTimeout(() => {
        handleNext();
      }, autoAdvanceInterval * 2000);

      return () => {
        clearTimeout(meaningTimeout);
        clearTimeout(nextWordTimeout);
      };
    }
  }, [isAutoAdvanceActive, autoAdvanceInterval, currentIndex, displayWord, currentMonster, addLog, handleNext]);

  const handlePrevious = useCallback(() => {
    if (practiceList.length === 0) return;
    const prevIndex = (currentIndex - 1 + practiceList.length) % practiceList.length;
    startNewRound(prevIndex, practiceList);
  }, [currentIndex, practiceList, startNewRound]);

  const handleEndSessionAndSave = useCallback(() => {
    addLog("게임을 종료하고 모든 변경사항을 저장합니다.");
    if (wordbookName) {
      saveWordsForBook(wordbookName, sessionWords);
    }
    router.push('/');
  }, [addLog, router, sessionWords, wordbookName]);

  if (isLoading) {
    return <div className={styles.message}>로딩 중...</div>;
  }

  if (!wordbookName) {
    return (
      <div className={styles.container}>
        <div className={styles.message}>연습할 단어장을 선택해주세요.</div>
        <Link href="/"><button className={styles.button}>메인으로 돌아가기</button></Link>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.gameArea}>
        <h1>연습 모드: {wordbookName} ({practiceMode === 'all' ? '전체' : '미암기'})</h1>
        {practiceList.length === 0 ? (
          <div className={styles.message}>연습할 단어가 없습니다.</div>
        ) : (
          <>
            {displayWord && <p>{`${currentIndex + 1} / ${practiceList.length}`}</p>}
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${((currentIndex + 1) / practiceList.length) * 100}%` }}
              ></div>
            </div>
            <div className={styles.battleContainer}>
              <div className={styles.playerContainer}>
                <Image src={playerImage} alt="Player" width={280} height={0} />
              </div>
              <div className={styles.monsterContainer}>
                {monsterImage && <Image src={monsterImage} alt="Monster" width={280} height={280} />}
              </div>
            </div>
            <div className={styles.wordContainer}>
              {displayWord && <h2>{displayWord.word}</h2>}
              {showMeaning && displayWord && <p className={styles.meaning}>{displayWord.meaning}</p>}
            </div>
            <div>
              <button onClick={handlePrevious} className={styles.button}>이전 단어</button>
              <button onClick={handleNext} className={styles.button}>다음 단어</button>
              <button onClick={handleShowMeaningAndDamage} className={styles.button}>모름</button>
              <button onClick={handleMemorizeWord} className={styles.button}>암기함</button>
              <button onClick={handleEndSessionAndSave} className={styles.button}>게임 종료 및 저장</button>
            </div>
            <div style={{ marginTop: '10px' }}>
              <input
                type="number"
                value={autoAdvanceInterval}
                onChange={(e) => setAutoAdvanceInterval(Number(e.target.value))}
                min="1"
                style={{ marginRight: '10px', width: '60px' }}
              />
              <button onClick={() => setIsAutoAdvanceActive(!isAutoAdvanceActive)} className={styles.button}>
                {isAutoAdvanceActive ? '자동 넘김 중지' : '자동 넘김 시작'}
              </button>
            </div>
          </>
        )}
      </div>
      <div className={styles.logArea}>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={styles.button}
          style={{ marginBottom: '10px' }}
        >
          {showLogs ? '로그 숨기기' : '로그 보기'}
        </button>
        {showLogs && <GameLog logs={logs} />}
      </div>
    </div>
  );
}