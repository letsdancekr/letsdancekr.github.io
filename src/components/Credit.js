import React, { useEffect, useState } from 'react';

function Credit({ onBack }) {
  const [isSlideIn, setIsSlideIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsSlideIn(true), 50);
  }, []);

  const handleBack = () => {
    setIsSlideIn(false);
    setTimeout(() => onBack(), 700);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: isSlideIn ? '0' : '-100%',
        width: '100%',
        height: '100%',
        transition: 'right 0.7s ease',
        backgroundColor: '#412823',
        overflow: 'hidden',
        zIndex: '999999',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // backgroundImage: 'url("/static/stockimages/invitation_background.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          borderTopLeftRadius: '20px',
          zIndex: 1,
          opacity: 1,
        }}
      ></div>

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
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
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
            justifyContent: 'center',
            background: 'transparent',
            alignItems: 'center',
            padding: '0 15px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '15px',
              transform: 'translateY(-50%)',
            }}
          >
            <img
              src="/static/icons/back_double.png"
              alt="back"
              onClick={handleBack}
              style={{
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <div style={{ fontSize: '20px' }}>춤 이야기 크레딧</div>
        </div>
      </div>

      <img
        src="/static/stockimages/moon.png"
        alt="moon"
        style={{
          position: 'sticky',
          left: '46.06%',
          right: '6.62%',
          top: '14.91%',
          bottom: '64.08%',
          width: '47.33%',
          filter: 'blur(5px)',
          zIndex: 1,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '60%',
          zIndex: 999,
          top: '-10%',
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
          }}
        />
      </div>

      {/* <div
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
          href="/CreateCharacter"
          style={{
            display: 'inline-block',
            width: '170px',
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
          캐릭터 생성하기
        </a>
      </div> */}
    </div>
  );
}

export default Credit;