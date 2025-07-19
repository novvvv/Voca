// lib/words.js

// ✨ 1. getWords : localStorage에 접근하기 이전 SSR 환경인지 체크하여 예외를 방지해주는 코드  
// 서버 사이드 렌더링(SSR) 환경인지 확인이란?
// window 객체는 웹 브라우저 환경에서 존재하는 전역 객체. 브라우저의 창, 탭, localStorage 등에 접근할 수 있도록 해준다. 
// NextJS는 기본적으로 SSR로 동작하기에 서버 환경에서는 브라우저가 존재하지 않음. 따라서 window 객체도 존재하지 않음. 
// 그렇기에 window 객체 확인 없이 localStorage에 접근해 애플리케이션을 뻗기 위한 동작을 방지하는 예외처리 코드 


export const getWords = () => {


  if (typeof window === 'undefined') {
    return [];
  }

  // 2. localStorage에서 'words'키로 저장된 데이터를 가져온다.  
  const words = localStorage.getItem('words');

  // 3. 데이터가 있으면 JSON 데이터 파싱, 없으면 빈 배열 반환 
  return words ? JSON.parse(words) : [];
};

export const addWord = (word) => {

  if (typeof window === 'undefined') {
    return;
  }

  const words = getWords();
  localStorage.setItem('words', JSON.stringify([...words, word]));
  window.dispatchEvent(new Event('word-updated'));

};

export const deleteWord = (wordId) => {
  if (typeof window === 'undefined') {
    return;
  }
  const words = getWords();
  const updatedWords = words.filter(word => word.id !== wordId);
  localStorage.setItem('words', JSON.stringify(updatedWords));
  window.dispatchEvent(new Event('word-updated'));
};

export const getRandomWord = () => {
  const words = getWords();
  if (words.length === 0) {
    return null;
  }
  return words[Math.floor(Math.random() * words.length)];
};

// getWordByIndex - 단어를 순차적으로 가져오는 메서드 
export const getWordByIndex = (index) => {
  const words = getWords();
  if (words.length === 0 || index < 0 || index >= words.length) {
    return null;
  }
  return words[index];
};