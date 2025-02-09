import React, { useEffect, useState } from 'react';

function Invitation({ onBack, showbutton = false, isFinal = false }) {
  const [isSlideIn, setIsSlideIn] = useState(false);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);

  const imageSources = [
    '/static/stockimages/invitation_background.webp',
    '/static/icons/back_double.webp',
    '/static/stockimages/moon.webp',
    '/static/stockimages/invitext.webp'
  ];

  // Preload images function
  const preloadImages = (sources) => {
    return Promise.all(
      sources.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  };

  useEffect(() => {
    // Preload images before setting slide-in effect
    preloadImages(imageSources)
      .then(() => {
        setIsImagesLoaded(true); // Images are fully loaded
        setTimeout(() => setIsSlideIn(true), 50);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
      });
  }, []);

  const handleBack = () => {
    setIsSlideIn(false); // 슬라이드 아웃 시작
    // 애니메이션이 완료된 후 컴포넌트를 제거
    setTimeout(() => {
      onBack(); // 애니메이션이 완료된 후 onBack 호출
    }, 700); // 애니메이션 시간이 0.7초이므로 700ms 후에 실행
  };

  if (!isImagesLoaded) {
    return <div></div>; // You can replace this with a custom loader
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: isSlideIn ? '0' : '-100%', // 슬라이드 인/아웃 상태에 따라 right값 변경
        width: '100%',
        height: '100%',
        transition: 'right 0.7s ease', // 애니메이션 시간 설정
        backgroundColor: '#412823 !important',
        overflow: 'hidden',
        zIndex: '99999999',
      }}
    >
      <div
        id="invitation-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: '999999 !important',
          opacity: 1,
        }}
      >
        <img
          src="/static/stockimages/invitation_background.webp"
          alt="background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: isSlideIn ? '0' : '-150%',
          width: '100%',
          transition: 'right 0.7s ease',
          height: '58px',
          zIndex: 1000,
          overflow: 'hidden',
          boxShadow: 'none',
          backgroundColor: 'transparent',
        }}
      >
        <div
          style={{
            color: '#f8f6f1',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            background: 'transparent',
            alignItems: 'center',
            padding: '0 15px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          <div
            style={{
              left: '15px',
              width: '30px',
            }}
          >
            <img
              src="/static/icons/back_double.webp"
              alt="back"
              onClick={handleBack}
              style={{
                width: '100%',
                height: '100%',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <div style={{ fontSize: '20px' }}>이제 댄스타임 (2024)</div>
          <div style={{ width: '7%' }}></div>
        </div>
      </div>

      <img
        src="/static/stockimages/moon.webp"
        alt="moon"
        style={{
          position: 'sticky',
          left: '40.06%',
          right: '6.62%',
          top: '8.91%',
          bottom: '64.08%',
          width: '47.33%',
          filter: 'blur(5px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '72%',
          zIndex: 999,
          top: '-16%',
          position: 'relative',
        }}
      >
        <img
          src="/static/stockimages/invitext.png"
          alt="invitation text"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            marginTop: '10%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Button container */}
      {showbutton && !isFinal && (
        <div
          style={{
            position: 'fixed',
            bottom: '5%',
            right: isSlideIn ? '0%' : '-150%',
            left: 0,
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            transition: 'right 0.7s ease',
          }}
        >
          <a
            href="/CreateCharacter"
            style={{
              display: 'inline-block',
              width: '200px',
              height: '35px',
              lineHeight: '35px',
              textAlign: 'center',
              boxSizing: 'border-box',
              background: '#f8f6f1',
              border: '1px solid #e6e1dc',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
              textDecoration: 'none',
              color: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ed9a9a';
              e.target.style.color = '#f8f6f1';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8f6f1';
              e.target.style.color = 'inherit';
            }}
          >
            춤추러 갈 준비하기
          </a>
        </div>
      )}

      {showbutton && isFinal && (
        <div
          style={{
            position: 'fixed',
            bottom: '10%',
            right: isSlideIn ? '0%' : '-150%',
            left: 0,
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            transition: 'right 0.7s ease',
          }}
        >
          <a
            href="https://letsdancekr.github.io/choompan/ "
            style={{
              display: 'inline-block',
              width: '200px',
              height: '35px',
              lineHeight: '35px',
              textAlign: 'center',
              boxSizing: 'border-box',
              background: '#f8f6f1',
              border: '1px solid #e6e1dc',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
              textDecoration: 'none',
              color: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ed9a9a';
              e.target.style.color = '#f8f6f1';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8f6f1';
              e.target.style.color = 'inherit';
            }}
          >
            ‘함께 만드는 춤판' 이동하기
          </a>
        </div>
      )}
    </div>
  );
}

export default Invitation;
