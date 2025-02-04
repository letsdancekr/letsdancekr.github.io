import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Invitation from './components/Invitation';
import CreateCharacter from './components/CreateCharacter';
import PlaceSelection from './components/PlaceSelection';
import PostcardCreation from './components/PostcardCreation';
import PostcardView from './components/PostcardView';
import PostcardShareView from './components/PostcardShareView';
import PostcardSafeView from './components/PostcardSafeView';
import Credit from './components/Credit';
import { VideoProvider } from './components/VideoContext';
import { SceneProvider } from './components/SceneContext'; // SceneProvider import

import './App.css';

function App() {

    //카카오 인앱
    useEffect(() => {
  
      const userAgent = navigator.userAgent.toLowerCase();
      if (/kakaotalk/i.test(userAgent)) {
        window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(
          window.location.href
        )}`;
      } else if (/line/i.test(userAgent)) {
        const targetUrl = window.location.href;
        window.location.href = targetUrl.includes("?")
          ? `${targetUrl}&openExternalBrowser=1`
          : `${targetUrl}?openExternalBrowser=1`;
      } else if (
        /inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsApp|electron|wadiz|aliapp|zumapp|iphone.*whale|android.*whale|kakaostory|band|twitter|DaumApps|DaumDevice\/mobile|FB_IAB|FB4A|FBAN|FBIOS|FBSS|trill|SamsungBrowser\/[^1]/i.test(
          userAgent
        )
      ) {
        // redirectToExternalBrowser();
      }
    }, []);
    
  const [isFixedSize, setIsFixedSize] = useState(false);
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [showInstaInfo, setShowInstaInfo] = useState(false); // 추가된 상태
  const [showKakaoInfo, setShowKakaoInfo] = useState(false); // 추가된 상태 
  const [showNaverInfo, setShowNaverInfo] = useState(false); // 추가된 상태 
  const [isSizeChecked, setIsSizeChecked] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);  // 실시간 창 높이 상태 관리

  const checkWindowSize = useCallback(() => {
    const getDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/mobile/i.test(userAgent)) return 'mobile';
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
      return 'desktop';
    };
  
    const checkBrowser = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return {
        isInstagram: userAgent.includes("Instagram"),
        isKakao: userAgent.includes("Kakao"),
        // isNaver: userAgent.includes("NAVER") &&  userAgent.includes("Android")
        isNaver: false
      };
    };

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType();
    const { isInstagram, isKakao, isNaver } = checkBrowser();  // 한 번만 호출

    setWindowHeight(height);  // 창 높이 상태 업데이트
    setShowSizeInfo((deviceType === 'tablet' || deviceType === 'desktop') && (width < 500 || height < 500));
    setIsFixedSize((deviceType === 'tablet' || deviceType === 'desktop') && (width >= 500 && height >= 500));
    setShowInstaInfo(isInstagram);
    setShowKakaoInfo(isKakao);
    setShowNaverInfo(isNaver);
    setIsSizeChecked(true);
  }, []);

  useEffect(() => {
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    return () => window.removeEventListener('resize', checkWindowSize);
  }, [checkWindowSize]);  // Dependency added

  if (!isSizeChecked) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // 실시간 창 크기 변화에 따른 transform 계산
  const getTransformStyle = () => {
    if (isFixedSize) {
      if (windowHeight >= 900) {
        return `translate(-50%, -50%) scale(1.1538)`;
      } else {
        return `translate(-50%, -50%) scale(${windowHeight / 780})`;
      }
    }
    return '';
  };

  return (
    <div className={isFixedSize ? 'fixed-size-container' : ''}
      style={{
        transform: getTransformStyle(),  // 실시간으로 업데이트된 transform 스타일 적용
      }}>

      {showSizeInfo ? (
        <div className="size-info-container">
          <img src="/static/stockimages/sizeinfo.png" alt="Size Information" className="size-info-image" />
        </div>
      ) : showInstaInfo ? ( // 인스타그램 안내 정보 추가
        <div className="size-info-container">
          <img src="/static/stockimages/instainfo.png" alt="Instagram Browser Information" className="size-info-image" />
        </div>
      ) : showKakaoInfo ? ( // 카카오 안내 정보 추가
        <div className="size-info-container">
          <img src="/static/stockimages/kakaoinfo.png" alt="Kakao Browser Information" className="size-info-image" />
        </div> 
      ) : showNaverInfo ? ( // 카카오 안내 정보 추가
        <div className="size-info-container">
          <img src="/static/stockimages/naverinfo.png" alt="Naver Browser Information" className="size-info-image" />
        </div> 
      ) :(
        
        <SceneProvider>
          <VideoProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/undefined" element={<Home isFixedSize={isFixedSize} />} />
                <Route path="/invitation" element={<Invitation />} />
                <Route path="/postcardview/" element={<PostcardView isFixedSize={isFixedSize}/>} />
                <Route path="/CreateCharacter" element={<CreateCharacter isFixedSize={isFixedSize} />} />
                <Route path="/place-selection" element={<PlaceSelection isFixedSize={isFixedSize}/>} />
                <Route path="/postcardcreation" element={<PostcardCreation isFixedSize={isFixedSize}/>} />
                <Route path="/credit/:id" element={<Credit />} />
                <Route path="/postcardshareview/:id" element={<PostcardShareView isFixedSize={isFixedSize} />} />
                <Route path="/postcardsafeview/" element={<PostcardSafeView isFixedSize={isFixedSize} />} />
              </Routes>
            </Router>
          </VideoProvider>
        </SceneProvider>
      )}
    </div>
  );
}

export default App;
