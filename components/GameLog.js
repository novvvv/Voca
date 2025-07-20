"use client";

import React, { useEffect, useRef } from 'react';
import styles from './GameLog.module.css';

export default function GameLog({ logs }) {
  const logContainerRef = useRef(null);

  // logs 배열이 업데이트될 때마다 스크롤을 맨 위로 이동
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className={styles.logContainer}>
      <h3 className={styles.logHeader}>게임 로그</h3>
      <div ref={logContainerRef} className={styles.logMessages}>
        {logs.length === 0 ? (
          <p className={styles.emptyLog}>게임 활동이 여기에 기록됩니다.</p>
        ) : (
          logs.map((log, index) => (
            <p key={index} className={styles.logMessage}>
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
