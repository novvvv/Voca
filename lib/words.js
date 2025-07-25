// lib/words.js

// --- Helper Functions ---

const getLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const getWordbookData = () => {
  const storage = getLocalStorage();
  if (!storage) return { wordbooks: {}, activeWordbook: null };

  const data = storage.getItem('wordbookApp');
  if (data) {
    const parsedData = JSON.parse(data);
    if (parsedData.checkedWords) {
      delete parsedData.checkedWords;
      saveWordbookData(parsedData);
    }
    return parsedData;
  } else {
    const initialData = { wordbooks: { '기본 단어장': [] }, activeWordbook: '기본 단어장' };
    storage.setItem('wordbookApp', JSON.stringify(initialData));
    return initialData;
  }
};

const saveWordbookData = (data) => {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem('wordbookApp', JSON.stringify(data));
    window.dispatchEvent(new Event('storage-updated'));
  }
};

// --- Wordbook Management ---

export const getWordbookNames = () => {
  const { wordbooks } = getWordbookData();
  return Object.keys(wordbooks);
};

// getWordBookStatus : 단어장의 총 단어 수 (total), 암기된 단어 수를 반환 
export const getWordbookStats = (wordbookName) => {
  const words = getWords(wordbookName);
  if (!words) return { total: 0, memorized: 0 };

  const total = words.length;
  const memorized = words.filter(word => word.isMemorized).length;
  return { total, memorized };
};

export const addWordbook = (name) => {
  if (!name || typeof name !== 'string' || name.trim() === '') return;
  const data = getWordbookData();
  if (data.wordbooks[name]) return;
  data.wordbooks[name] = [];
  saveWordbookData(data);
};

export const deleteWordbook = (name) => {
  const data = getWordbookData();
  if (!data.wordbooks[name]) return;
  delete data.wordbooks[name];

  if (data.activeWordbook === name) {
    const remainingNames = Object.keys(data.wordbooks);
    data.activeWordbook = remainingNames.length > 0 ? remainingNames[0] : null;
  }
  saveWordbookData(data);
};

// --- Active Wordbook Management ---

export const getActiveWordbookName = () => {
  const { activeWordbook } = getWordbookData();
  return activeWordbook;
};

export const setActiveWordbookName = (name) => {
  const data = getWordbookData();
  if (data.wordbooks[name]) {
    data.activeWordbook = name;
    saveWordbookData(data);
  }
};

// --- Word Management (within a wordbook) ---

export const getWords = (wordbookName) => {
  const data = getWordbookData();
  const name = wordbookName || data.activeWordbook;
  return (name && data.wordbooks[name]) ? data.wordbooks[name] : [];
};

export const addWord = (word, wordbookName) => {
  const data = getWordbookData();
  const name = wordbookName || data.activeWordbook;
  if (name && data.wordbooks[name]) {
    const newWord = { ...word, createdAt: new Date().toISOString(), isMemorized: false };
    data.wordbooks[name].push(newWord);
    saveWordbookData(data);
  }
};

export const deleteWord = (wordId, wordbookName) => {
  const data = getWordbookData();
  const name = wordbookName || data.activeWordbook;
  if (name && data.wordbooks[name]) {
    data.wordbooks[name] = data.wordbooks[name].filter(w => w.id !== wordId);
    saveWordbookData(data);
  }
};

export const toggleWordMemorized = (wordId, wordbookName) => {
  const data = getWordbookData();
  const name = wordbookName || data.activeWordbook;
  if (name && data.wordbooks[name]) {
    const wordIndex = data.wordbooks[name].findIndex(w => w.id === wordId);
    if (wordIndex > -1) {
      const word = data.wordbooks[name][wordIndex];
      word.isMemorized = !word.isMemorized;
      saveWordbookData(data);
    }
  }
};

// New function to save the entire word list for a specific wordbook.
// This is used at the end of a practice session.
export const saveWordsForBook = (wordbookName, words) => {
  const data = getWordbookData();
  const name = wordbookName || data.activeWordbook;
  if (name && data.wordbooks[name]) {
    data.wordbooks[name] = words;
    saveWordbookData(data);
  } else {
    console.error(`Cannot save words. Wordbook "${name}" not found.`);
  }
};

// 현재 단어장을 CSV 파일로 내보내기 
export const exportWordsToCsv = (wordbookName) => {
       const words = getWords(wordbookName);
       if (!words || words.length === 0) {
         return null; // No words to export
       }
     
       const headers = ["단어", "뜻", "암기여부", "생성일"];
       const csvRows = [];
     
      // Add headers
      csvRows.push(headers.map(header => `"${header}"`).join(","));
    
      // Add data rows
      words.forEach(word => {
        const row = [
          `"${word.word.replace(/"/g, '""')}"`, // Escape double quotes
          `"${word.meaning.replace(/"/g, '""')}"`,
          word.isMemorized ? "TRUE" : "FALSE",
          word.createdAt ? new Date(word.createdAt).toLocaleDateString() : ""
        ];
        csvRows.push(row.join(","));
      });
    
      return csvRows.join("\n");
};

export const addWordsToWordbook = (wordsToAdd, wordbookName) => {
  const data = getWordbookData();
  const name = wordbookName || data.activeWordbook;
  if (name && data.wordbooks[name]) {
    wordsToAdd.forEach(word => {
      const newWord = { ...word, id: Date.now() + Math.random(), createdAt: new Date().toISOString(), isMemorized: false }; // 고유 ID 생성
      data.wordbooks[name].push(newWord);
    });
    saveWordbookData(data);
  } else {
    console.error(`Cannot add words. Wordbook "${name}" not found.`);
  }
};

// ✨ renameWordbook - 단어장 이름 변경 함수✨
export const renameWordbook = (oldName, newName) => {

  // Validation - 입력값 검증 
  // 1. oldName (이전 단어장명) , newName(새로운 단어장 명)이 비어있는 경우 
  // 2. newName이 String Type이 아닌 경우 
  // 3. newName이 공백으로만 이루어져 있는 경우 
  if (!oldName || !newName || oldName === newName || typeof newName !== 'string' || newName.trim() === '') return;

  // localStorage에 저장된 전체 단어장 데이터 로드. 
  // { "wordbooks": { "단어장1" : [단어 객체] , ...}}
  const data = getWordbookData();


  // data.wordbooks[oldName] - 변경하려는 oldName 단어장이 실제로 wordbooks 객체에 존재하는지 검증
  // !data.wordbooks[newName] - 변경하려는 newName 단어장이 존재하지 않는 지 검증 
  // -> newName을 검증하지 않으면 단어장 데이터가 덮어 씌워지기 떄문 
  // * 같은 이름으로 변경할 수 없다는 경고 문구를 띄워주면 좋을듯 

  if (data.wordbooks[oldName] && !data.wordbooks[newName]) {

    // 새로운 단어장[newName]으로 기존 데이터 [oldName] 복사
    data.wordbooks[newName] = data.wordbooks[oldName];

    // 기존 데이터 [oldName] 제거
    delete data.wordbooks[oldName];

    // 활성 단어장 이름 업데이트 
    if (data.activeWordbook === oldName) {
      data.activeWordbook = newName;
    }
    
    // 변경이 완료된 data객체를 saveWordbookData 함수로 넘겨주어 LocalStorage에 저장 
    saveWordbookData(data);
  }

};