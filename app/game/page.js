// app/game/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { getRandomWord } from '@/lib/words';

export default function Game() {
  const [playerHp, setPlayerHp] = useState(100);
  const [monsterHp, setMonsterHp] = useState(100);
  const [currentWord, setCurrentWord] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCurrentWord(getRandomWord());
  }, []);

  const handleAttack = () => {
    if (!currentWord) return;

    if (inputValue.toLowerCase() === currentWord.word.toLowerCase()) {
      const newMonsterHp = monsterHp - 20;
      setMonsterHp(newMonsterHp);
      setMessage('Correct! Monster takes 20 damage.');
      if (newMonsterHp <= 0) {
        alert('You defeated the monster!');
        setCurrentWord(getRandomWord());
        setMonsterHp(100);
      }
    } else {
      const newPlayerHp = playerHp - 10;
      setPlayerHp(newPlayerHp);
      setMessage('Wrong! You take 10 damage.');
      if (newPlayerHp <= 0) {
        alert('Game Over!');
        // Reset game
        setPlayerHp(100);
        setMonsterHp(100);
        setCurrentWord(getRandomWord());
      }
    }
    setInputValue('');
  };

  if (!currentWord) {
    return <div>No words in your dictionary. Add some words to play!</div>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Word Monster Battle</h1>
      <div>
        <h2>Player HP: {playerHp}</h2>
        <h2>Monster HP: {monsterHp}</h2>
      </div>
      <div>
        <h3>Monster: {currentWord.meaning}</h3>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAttack()}
        />
        <button onClick={handleAttack}>Attack</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
