// app/scarecrow/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getWords, saveWordsForBook } from '@/lib/words';
import GameLog from '@/components/GameLog'; // Import the new component
import styles from './scarecrow.module.css';

const monsters = [
  {
    id: 1,
    image: '/Monster/hidden_monster1.png',
    damagedImage: '/Monster/hidden_monster1_damaged.png'
  },
  {
    id: 2,
    image: '/Monster/hidden_monster2.png',
    damagedImage: '/Monster/hidden_monster2_damaged.png'
  },
  {
    id: 3,
    image: '/Monster/hidden_monster3.png',
    damagedImage: '/Monster/hidden_monster3_damaged.png'
  },
  {
    id: 4, // Assuming a different ID for this one
    image: '/Monster/monster_1.png',
    damagedImage: '/Monster/monster_1_damaged.jpeg'
  },
];

const playerImage = '/Monster/123.jpg';

export default function ScarecrowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wordbookName = searchParams.get('wordbook');
  const practiceMode = searchParams.get('mode') || 'all';

  const [sessionWords, setSessionWords] = useState([]);
  const [practiceList, setPracticeList] = useState([]);
  const [logs, setLogs] = useState([]); // State for game logs

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMonster, setCurrentMonster] = useState(null);
  const [monsterImage, setMonsterImage] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [displayWord, setDisplayWord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to add a new log entry
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  };

  useEffect(() => {
    if (!wordbookName) {
      setIsLoading(false);
      return;
    }
    addLog(`'${wordbookName}' 단어장으로 게임을 시작합니다. (${practiceMode} 모드)`);
    const allWordsForBook = getWords(wordbookName);
    setSessionWords(JSON.parse(JSON.stringify(allWordsForBook)));

    let filteredWords = [];
    if (practiceMode === 'unmemorized') {
      filteredWords = allWordsForBook.filter(word => !word.isMemorized);
    } else {
      filteredWords = allWordsForBook;
    }
    
    setPracticeList(filteredWords);

    if (filteredWords.length > 0) {
      startNewRound(0, filteredWords);
    } else {
      setDisplayWord(null);
    }
    setIsLoading(false);

  }, [wordbookName, practiceMode]);

  const startNewRound = (index, wordsList) => {
    const wordToDisplay = wordsList[index];
    setDisplayWord(wordToDisplay);
    setCurrentIndex(index);
    addLog(`다음 단어: "${wordToDisplay.word}"`);

    const newMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setCurrentMonster(newMonster);
    setMonsterImage(newMonster.image);
    setShowMeaning(false);
  };

  const handleShowMeaningAndDamage = () => {
    if (!showMeaning) {
      addLog(`"${displayWord.word}"의 뜻을 확인했습니다.`);
      setShowMeaning(true);
      if (currentMonster) {
        setMonsterImage(currentMonster.damagedImage);
      }
    }
  };

  const handleMemorizeWord = () => {
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
  };

  const handleNext = () => {
    if (practiceList.length === 0) return;
    const nextIndex = (currentIndex + 1) % practiceList.length;
    startNewRound(nextIndex, practiceList);
  };

  const handlePrevious = () => {
    if (practiceList.length === 0) return;
    const prevIndex = (currentIndex - 1 + practiceList.length) % practiceList.length;
    startNewRound(prevIndex, practiceList);
  };

  const handleEndSessionAndSave = () => {
    addLog("게임을 종료하고 모든 변경사항을 저장합니다.");
    if (wordbookName) {
      saveWordsForBook(wordbookName, sessionWords);
    }
    router.push('/');
  };

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
          </>
        )}
      </div>
      <div className={styles.logArea}>
        <GameLog logs={logs} />
      </div>
    </div>
  );
}
