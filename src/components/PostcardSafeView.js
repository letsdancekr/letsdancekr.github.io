import React, { useRef, useEffect, useState, } from 'react';
import axios from 'axios';
import Header from './Header';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three'; // Importing Three.js
import { isTablet, isDesktop } from 'react-device-detect';
import './PostcardView.css';


const backgrounds = [
  "/static/stockimages/bg1.webp",
  "/static/stockimages/bg1.webp",
  "/static/stockimages/bg2.webp",
  "/static/stockimages/bg3.webp",
];

const modelPositions = [
  { x: 16.75, y: 31.5, width: 36.75},
  { x: 33.5, y: 27.7, width: 36.75},
  { x: 42.25, y: 22, width: 36.75},
];

const PostcardSafeView = ({ isFixedSize }) => {
  const { id } = useParams();
  const [postcard, setPostcard] = useState(null);
  const [gifKey, setGifKey] = useState(0); // Add state for gif reload
  const [isButtonVisible, setIsButtonVisible] = useState(true); // 버튼 표시 여부
  const [buttonText, setButtonText] = useState('화면 녹화를 켠 후, 이 버튼을 눌러주세요.'); // 버튼 텍스트 상태
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostcard = async () => {
      try {
        const response = await axios.get(`/api/postcard/${id}`, { cache: 'no-cache' });
        if (response.status === 200) {
          setPostcard(response.data);
        } else {
          console.error('Error fetching postcard:', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    fetchPostcard();
  }, [id]);

  const handlePlayAudioAndRestartGIF = () => {
    if (buttonText === '홈 화면으로 돌아가기') {
      navigate('/'); // 홈 화면으로 이동
    } 
    // Generate a new unique timestamp
    const timestamp = new Date().getTime();

    // Find the GIF element
    const gifElement = document.querySelector('#gifElement');

    if (gifElement) {
      // Set the src to an empty string to stop the current animation
      gifElement.src = '';

      // Force a reflow
      void gifElement.offsetWidth;

      // Set the new src with the timestamp to force a reload
      gifElement.src = `/api/uploads/${postcard.gif_name}?t=${timestamp}`;
    }

    // Play the audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
    // Update the state to trigger a re-render
    setGifKey(prevKey => prevKey + 1);

    // 버튼 숨기기
    setIsButtonVisible(false);

    // 19초 후에 다시 버튼 보이도록 설정
    setTimeout(() => {
      setButtonText('홈 화면으로 돌아가기');
      setIsButtonVisible(true); // 버튼 다시 나타나게 설정
    }, 19000); // 19초 후에 버튼 표시
  };

  // 글자 크기 설정
  const [fontSize, setFontSize] = useState('16px'); // 기본 폰트 크기
  const divRef = useRef(null);

  useEffect(() => {
    const updateFontSize = () => {
      if (divRef.current) {
        const divWidth = divRef.current.offsetWidth; // div 요소의 현재 너비
        const newFontSize = (divWidth * 12) / 390; // 너비의 12/390 값을 폰트 크기로 설정
        setFontSize(`${newFontSize}px`);
      }
    };

    // 초기 폰트 크기 설정 및 창 크기 변경 시 업데이트
    updateFontSize();
    window.addEventListener('resize', updateFontSize);

    return () => {
      window.removeEventListener('resize', updateFontSize); // 리소스 정리
    };
  }, []);

  if (!postcard) {
    return <div>Loading...</div>;
  }

  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

  return (
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      backgroundImage: `url('/static/stockimages/background_paper.webp')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: isFixedSize ? '390px' : '100dvw', // 고정 크기 또는 가로 100%
      height: isFixedSize ? '780px' : '100dvh', // 고정 크기 또는 세로 100%
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'hidden',
    }}>
      <div id="createdImages" ref={divRef} style={{
        position: 'fixed',
        top: isFixedSize ? '68px' : '45px',
        aspectRatio: '3 / 5', // 가로 세로 비율
        width: isFixedSize ? '390px' : '100%', // 높이에 맞춘 비율을 유지한 최대 너비
        maxHeight: isFixedSize ? '650px' : 'calc(100dvh - 58px)', // 동적 뷰포트에서 108px을 뺀 값만큼 최대 높이를 제한
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: '900',
        overflow: 'hidden',
        backgroundImage: `url(/static/stockimages/share_postcardfinal_${postcard.number}.webp)`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center Top',
        fontSize: isFixedSize ? '20px' : '2.6dvh',
      }}>

        <img
          id="gifElement"
          key={gifKey}
          src={`/api/uploads/${postcard.gif_name}`}
          alt="GIF"
          style={{
            position: 'absolute',
            overflow: 'hidden',
            zIndex: '900',
            top: `calc(${modelPositions[postcard.number - 1].y}% - 2%)`,
            left: `calc(${modelPositions[postcard.number - 1].x}% + 1%)`,
            width: `calc(${modelPositions[postcard.number - 1].width}% + 7%)`,
            height: 'auto',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '72.5%',
            zIndex: '900',
            width: '85%',
            color: '#412823',
            fontSize: '0.6em',
            textAlign: 'center',
            verticalAlign: 'top',
            lineHeight: '2.4',
            fontFamily: 'Cafe24Simplehae, sans-serif',
            fontWeight: 'bold',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            overflow: 'hidden',
          }}
        >
          {postcard.comment}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '81%',
            zIndex: '900',
            width: '100%',
            color: '#412823',
            marginTop: '5px',
            fontSize: '8px',
            textAlign: 'center',
            verticalAlign: 'center',
            lineHeight: '2',
            fontFamily: 'Cafe24Simplehae, sans-serif',
            fontWeight: 'bold',
          }}
        >
          {postcard.timestamp}
        </div>

        <div
          style={{
            position: 'absolute',
            top: isFixedSize ? '85.5%' : '85.6%',
            zIndex: '900',
            width: '20%',
            color: '#412823',
            fontSize: '0.6em',
            fontFamily: 'Pretendard-Regular, sans-serif',
            left: '67%',
            textAlign: 'center',
            fontWeight: 'bold',
            
          }}
        >
          {postcard.name}
        </div>

      </div>

      {/* 버튼이 보여질 때만 렌더링 */}
      {isButtonVisible && (
        <div id='buttoncontainer' style={{
          position: 'fixed',
          width: '90%',
          height: '100px',
          bottom: '0',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '10000'
        }}>
          <button
            onClick={handlePlayAudioAndRestartGIF}
            style={{
              position: 'absolute',
              zIndex: '200000',
              cursor: 'pointer',
              overflow: 'hidden',
              width: '80%',
              height: '35px',
              background: '#F8F6F1',
              border: '1px solid #E6E1DC',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
              color: '#412823',
            }}
          >
            {buttonText}
          </button>
        </div>
      )}

      {/* Add the audio element for test.mp3 */}
      <audio ref={audioRef} loop>
        <source src="/static/test_short.mp3" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default PostcardSafeView;
