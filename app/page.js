"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addWordbook } from '@/lib/words';
import styles from './page.module.css';

export default function HomePage() {

  const [newWordbookName, setNewWordbookName] = useState('');

  const handleAddWordbook = () => {
    if (newWordbookName.trim() === '') {
      alert('단어장 이름을 입력하세요.');
      return;
    }
    addWordbook(newWordbookName.trim());
    alert(`'${newWordbookName.trim()}' 단어장이 추가되었습니다.`);
    setNewWordbookName('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContentWrapper}>
        <div className={styles.titleContainer}>
          <img src="/img/lacuns.jpg" alt="Vocoon Logo" className={styles.logo} />
          <h1 className={styles.title}>Vocoon</h1>
        </div>
        
        <div className={styles.formContainer}>
          <input
              type="text"
              value={newWordbookName}
              onChange={(e) => setNewWordbookName(e.target.value)}
              placeholder="새 단어장 이름"
              className={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWordbook()}
          />
          <button onClick={handleAddWordbook} className={styles.addButton}>
            <img src="/img/leaf.png" alt="새 단어장 추가" className={styles.addIcon} />
          </button>
        </div>

        <div className={styles.manageButtonContainer}>
          <Link href="/wordbooks" className={`${styles.button} ${styles.manageButton} ${styles.imageButton}`}>
            <Image src="/etc/folder.png" alt="단어장 관리" width={70} height={70} />
          </Link>
          <Link href="/game/unmemorized" className={`${styles.button} ${styles.manageButton} ${styles.imageButton}`}>
            <Image src="/etc/plays.png" alt="미암기 단어 연습" width={70} height={70} />
          </Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Developer Contact:</p>
        <p><img src="/img/envelope.png" alt="Email" className={styles.footerIcon} /> Email: <a href="mailto:dohana1205@gmail.com">dohana1205@gmail.com</a></p>
        <p><img src="/img/instagram.png" alt="Instagram" className={styles.footerIcon} /> Instagram: <a href="https://www.instagram.com/doil_0213" target="_blank" rel="noopener noreferrer">doil_0213</a></p>
        <p><img src="/img/blogger.png" alt="Blog" className={styles.footerIcon} /> Blog: <a href="https://novlog.tistory.com/" target="_blank" rel="noopener noreferrer">novlog.tistory.com</a></p>
      </footer>
    </div>
  );
}
