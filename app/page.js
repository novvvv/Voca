"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { addWordbook } from '@/lib/words';
import styles from './page.module.css';

export default function HomePage() {
  const { data: session } = useSession();
  const [newWordbookName, setNewWordbookName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAddWordbook = () => {
    if (newWordbookName.trim() === '') {
      alert('단어장 이름을 입력하세요.');
      return;
    }
    addWordbook(newWordbookName.trim());
    alert(`'${newWordbookName.trim()}' 단어장이 추가되었습니다.`);
    setNewWordbookName('');
  };

  const LoginModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={() => setShowLoginModal(false)} className={styles.closeButton}>X</button>
        <h2>로그인</h2>
        <p>Google 계정으로 로그인하여 단어장을 안전하게 보관하세요.</p>
        <button onClick={() => signIn('google')} className={styles.googleLoginButton}>
          <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
          <span>Google 계정으로 로그인</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.topRightButtons}>
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src={session.user.image} alt={session.user.name} width={40} height={40} style={{ borderRadius: '50%' }} />
            <button onClick={() => signOut()} className={styles.logoutButton}>로그아웃</button>
          </div>
        ) : (
          <div onClick={() => setShowLoginModal(true)} className={styles.iconButton} style={{ cursor: 'pointer' }}>
            <Image src="/etc/login.png" alt="로그인" width={40} height={40} />
          </div>
        )}
        <Link href="#" className={styles.iconButton}>
          <Image src="/etc/setting.png" alt="설정" width={40} height={40} />
        </Link>
      </div>

      {showLoginModal && <LoginModal />}
      
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
