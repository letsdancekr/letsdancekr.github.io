import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import { useParams } from 'react-router-dom';
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

const PostcardShareView = ({isFixedSize}) => {
  const { id } = useParams();
  const [postcard, setPostcard] = useState(null);
  const [gifKey, setGifKey] = useState(0); // Add state for gif reload
  // const [isFixedSize, setIsFixedSize] = useState(false); // 화면 고정 여부 상태
  const audioRef = useRef(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(true); // 오디오 로딩 상태
  
  const canvasRef = useRef(null);



  useEffect(() => {
    const fetchPostcard = async () => {
      try {
        const response = await axios.get('/data/allData.json'); // JSON 파일에서 데이터 가져오기
        const data = response.data.postcards; // postcards 배열 접근
        const selectedPostcard = data.find(item => item.id === parseInt(id, 10)); // id로 필터링

        if (selectedPostcard) {
          setPostcard(selectedPostcard); // 필터링한 postcard 데이터 설정
        } else {
          console.error(`Postcard with ID ${id} not found.`);
        }
      } catch (error) {
        console.error('Error fetching postcard:', error);
      }
    };

    fetchPostcard();
  }, [id]);

  const handlePlayAudioAndRestartGIF = () => {
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
      gifElement.src = `/api/uploads/${postcard.gif_name}`;
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
  };

  const handleAudioLoaded = () => {
    setIsAudioLoaded(true);
  };


  //글자크기 설정
  const [fontSize, setFontSize] = useState('16px'); // 기본 폰트 크기
  const divRef = useRef(null);

  useEffect(() => {
    // div 요소의 너비를 기준으로 폰트 크기 계산
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
      <div
        style={{
          height: '58px', // Keep the height fixed
          position: 'fixed',
          top: '0',
          width: isFixedSize ? '390px' : '100vw', // Adjust width based on screen size
          zIndex: '1000',
          left: '50%', // Centering
          transform: isFixedSize ? 'translateX(-50%)' : 'none', // Center for fixed width
          overflow: 'hidden', // Prevent content overflow
          padding: '0', // Ensure no padding inflates the size
          margin: '0', // Ensure no margins affect size
          boxSizing: 'border-box', // Ensure padding and borders are included in the size calculation
      }}
      >
        <Header
          title={`'${postcard.name}'의 춤사위`}
          needthird={false}
          style={{
            width: '100%',
            height: '100%', // Ensure the header fits within its container
            display: 'flex',
            alignItems: 'center', // Vertically center content
            justifyContent: 'center', // Horizontally center content
            padding: '0', // Ensure no extra padding inside the header
            margin: '0', // Remove margins if any
            overflow: 'hidden', // Ensure no overflow
          }}
        />
      </div>



      <div id="createdImages" ref={divRef} style={{
        position: 'fixed',
        top: isFixedSize? '68px': '58px',
        // width: '100vw', // 창의 전체 너비를 차지
        // height: 'calc(100vw * (15/9))', // 9:16 비율을 맞추기 위해 너비에 따른 높이 설정
        width: isFixedSize? '390px': 'calc((100dvh - 108px) * (720/1197))', // 높이에 맞춘 비율을 유지한 최대 너비
        height: isFixedSize? '650px': 'calc(100dvh - 108px)', // 동적 뷰포트에서 108px을 뺀 값만큼 최대 높이를 제한
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: '900',
        overflow: 'hidden',
        backgroundImage: `url(/static/stockimages/share_postcardfinal_${postcard.number}.webp)`,
        backgroundSize: 'contain',  // 배경 이미지가 컨테이너를 덮도록 설정
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center Top',  // 이미지가 가운데에 위치하게 설정
        fontSize: isFixedSize ? '20px' : '2.6dvh', // Adjust font size for larger screens
      }}>


          <img
            id="gifElement" 
            key={gifKey} // Ensure the GIF is reloaded by changing the key
            src={`/uploads/${postcard.gif_name}`}
            alt="GIF"
            style={{
              position: 'absolute',
              overflow: 'hidden',

              zIndex: '900',
              top: `calc(${modelPositions[postcard.number-1].y}% - 2%)`,
              left: `calc(${modelPositions[postcard.number-1].x}% + 1%)`,
              width: `calc(${modelPositions[postcard.number-1].width}% + 7%)`,
              height:'auto',
              display:'none',
            }}
            onLoad={(e) => e.target.style.display = 'block'} // GIF가 로드되면 표시
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
            width: '20%',
            color: '#412823',
            zIndex: '900',
            marginTop: '5px',
            width: '320px',
            color: '#412823',
            fontSize: '8px',
            textAlign: 'center',
            lineHeight: '2',
            fontFamily: 'Cafe24Simplehae, sans-serif',
            wordWrap: 'break-word',
            overflow: 'hidden',
            fontWeight: 'bold',
          }}
        >
          {postcard.timestamp}
        </div>

        <div
          style={{
            position: 'absolute',
            top: isFixedSize? '85.6%' : '85.6%',
            zIndex: '900',
            width: '20%',
            color: '#412823',
            // border: '1px solid #412823',
            fontSize: '0.6em',
            fontFamily: 'Pretendard-Regular, sans-serif',
            left: '67%',
            textAlign: 'center',
            verticalAlign: 'middle',
            overflow: 'hidden',
            fontWeight: 'bold',
          }}
        >
          {postcard.name}
        </div>

      </div>

              {/* Add a button to start audio playback and restart the GIF */}
      <div id='buttoncontainer' style={{
        position: 'fixed',
        width: '100%',
        height: '50px',
        bottom: '0',
        backgroundColor: '#F8F6F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid #E6E1DC',
      }}>
        <button 
          onClick={handlePlayAudioAndRestartGIF} 
          style={{
            position: 'absolute',
            zIndex: '200000',
            cursor: 'pointer',
            overflow: 'hidden',

            /* 캐릭터 생성하기 */
            width: '170px',
            height: '30px',

            background: '#F8F6F1',
            border: '1px solid #E6E1DC',
            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
            color: '#412823',
          }}
          disabled={!isAudioLoaded} // 오디오 로드되기 전까지 버튼 비활성화
        >
          {isAudioLoaded? '음악과 함께 춤추기' : '로딩 중..'}
        </button>

      </div>


      {/* <footer style={{
          position: 'absolute',
          width:'100%',
          bottom: '0.1%',
          letterSpacing: '-0.025em',
        }}>
          <div>2024. 10. 12 - 10.29.</div>
          <div className="footerBorder">|</div>
        <a href="https://www.instagram.com/kkot.pida.gallery/">김화순 개인전</a>
        <div className="footerBorder">|</div>
        <a href="https://www.zahamuseum.org">자하미술관</a>
        </footer> */}

      {/* Add the audio element for test.mp3 */}
      {/* <audio ref={audioRef} loop onCanPlayThrough={handleAudioLoaded}> */}
      <audio ref={audioRef} loop>
        <source src="/static/test_short.mp3" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default PostcardShareView;
