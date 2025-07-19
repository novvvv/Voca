// app/scarecrow/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getWords } from '@/lib/words';
import Image from 'next/image';
// import Link from 'next/link'; // Link will be replaced by a button with onClick
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
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
    id: 4,
    image: '/Monster/hidden_monster4.png',
    damagedImage: '/Monster/hidden_monster4_damaged.png'
  },
  // {
  //   id: 1,
  //   image: '/Monster/monster_1.png',
  //   damagedImage: '/Monster/monster_1_damaged.jpeg'
  // },
];

const playerImage = '/Monster/123.jpg'; // 플레이어 이미지 경로

export default function Scarecrow() {

  const router = useRouter(); // Initialize useRouter


  // TODO: persistedChecked State와 sessionCheckedWords State를 구분하는 이유?

  // --- Global States (loaded from localStorage, represents the persistent state) ---
  // ✨allWordsData State✨ localStorage에서 불러온 모든 단어 배열 
  // ✨persistedChecked State✨ 이전에 "암기함"으로 표시되어 localStorage에 저장된 단어들의 ID를 관리하는 객체
  const [allWordsData, setAllWordsData] = useState([]); // All words from localStorage
  const [persistedCheckedWords, setPersistedCheckedWords] = useState({}); // Checked words from localStorage
  const [practiceMode, setPracticeMode] = useState('all'); // Practice mode from localStorage

  // --- Session-specific States (changes during the session, not immediately persisted) ---
  // ✨sessionCheckedWords State✨ 현재 게임 세션 진행중 "암기함"으로 표시괸 단어를 임시로 저장하는 객체 
  // 게임이 종료되는 시점에 persistedCheckedWords와 병합되어 저장된다.
  // ✨sessionWords State✨ 현재 게임 세션을 위해 선택된 단어 배열로 연습 모드에 따라 필터링된다. 
  // 게임 진행 도중 sessionWords는 변경되지 않는다. 
  const [sessionCheckedWords, setSessionCheckedWords] = useState({}); // Checked words during the current session
  const [sessionWords, setSessionWords] = useState([]); // The fixed list of words for the current practice session

  // --- UI States ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMonster, setCurrentMonster] = useState(null);
  const [monsterImage, setMonsterImage] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [displayWord, setDisplayWord] = useState(null);


  // ✨Init useEffect✨
  useEffect(() => {

    const loadedAllWords = getWords();
    setAllWordsData(loadedAllWords);

    const storedChecked = localStorage.getItem('checkedWords'); // 암기된 단어 목록 
    const parsedStoredChecked = storedChecked ? JSON.parse(storedChecked) : {};
    setPersistedCheckedWords(parsedStoredChecked);
    setSessionCheckedWords(parsedStoredChecked);

    const savedMode = localStorage.getItem('practiceMode') || 'all';
    setPracticeMode(savedMode);

  }, []);

  // --- Effect for Setting Up Session Words ---
  // This effect runs when `allWordsData`, `persistedCheckedWords`, or `practiceMode` changes.
  // It sets up the `sessionWords` array which remains fixed for the current session.
  useEffect(() => {

    let filteredWordsForSession = [];
    // unemorized mode - persistedCheckedWords에 없는 단어만을 필터링 후 sessionWords에 저장
    if (practiceMode === 'unmemorized') {
      filteredWordsForSession = allWordsData.filter(word => !persistedCheckedWords[word.id]);
    } else {
      filteredWordsForSession = allWordsData;
    }
    setSessionWords(filteredWordsForSession);

    // Start a new round with the newly set session words
    if (filteredWordsForSession.length > 0) {
      startNewRound(0, filteredWordsForSession);
    } else {
      setCurrentIndex(0);
      setDisplayWord(null);
      setShowMeaning(false);
      setMonsterImage('');
    }
  }, [allWordsData, persistedCheckedWords, practiceMode]);

  // --- startNewRound function ---
  // Now takes `wordsList` as an argument to ensure it operates on the correct fixed list.
  const startNewRound = (index, wordsList) => {
    const wordToDisplay = wordsList[index];
    setDisplayWord(wordToDisplay); 
    setCurrentIndex(index);

    const newMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setCurrentMonster(newMonster);
    setMonsterImage(newMonster.image); 
    setShowMeaning(false); 
  };

  // --- handleShowMeaningAndDamage ---
  const handleShowMeaningAndDamage = () => {
    setShowMeaning(true); 
    if (currentMonster) {
      setMonsterImage(currentMonster.damagedImage);
    }
  };

  // --- handleMemorizeWord ---
  // Updates `sessionCheckedWords` (temporary state) only.
  const handleMemorizeWord = () => {
    setShowMeaning(true); 
    if (currentMonster) {
      setMonsterImage(currentMonster.damagedImage);
    }

    if (displayWord) { 
      // Update sessionCheckedWords, not persistedCheckedWords directly
      const newSessionCheckedWords = { ...sessionCheckedWords, [displayWord.id]: true };
      setSessionCheckedWords(newSessionCheckedWords);
      // Do NOT save to localStorage here
    }
  };

  // --- handleNext / handlePrevious ---
  // Operate on `sessionWords` (the fixed list for the session).
  const handleNext = () => {
    if (sessionWords.length === 0) return;
    const nextIndex = (currentIndex + 1) % sessionWords.length;
    startNewRound(nextIndex, sessionWords);
  };

  const handlePrevious = () => {
    if (sessionWords.length === 0) return;
    const prevIndex = (currentIndex - 1 + sessionWords.length) % sessionWords.length;
    startNewRound(prevIndex, sessionWords);
  };

  // --- handleEndSessionAndSave ---
  // New function to save changes and navigate.
  const handleEndSessionAndSave = () => {
    // Merge sessionCheckedWords into persistedCheckedWords and save to localStorage
    const finalCheckedWords = { ...persistedCheckedWords, ...sessionCheckedWords };
    localStorage.setItem('checkedWords', JSON.stringify(finalCheckedWords));

    // Navigate to the main page
    router.push('/');
  };

  // --- Conditional Renders ---
  if (allWordsData.length === 0) {
    return <div className={styles.message}>단어장에 단어를 추가하여 연습 모드를 시작하세요!</div>;
  }

  if (sessionWords.length === 0 && practiceMode === 'unmemorized') {
    return (
        <div className={styles.container}>
            <div className={styles.message}>선택한 모드에서 연습할 단어가 없습니다.</div>
            <button onClick={handleEndSessionAndSave} className={styles.button}>메인으로 돌아가기</button>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Practice Mode</h1>
      {displayWord && <p>{`${currentIndex + 1} / ${sessionWords.length}`}</p>} 

      <div className={styles.battleContainer}>
        <div className={styles.playerContainer}>
          <Image src={playerImage} alt="Player" width={400} height={400} />
        </div>
        <div className={styles.monsterContainer}>
          {monsterImage && <Image src={monsterImage} alt="Monster" width={400} height={400} />}
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
        <button onClick={handleEndSessionAndSave} className={styles.button}>게임 종료</button>
      </div>

    </div>
  );
}