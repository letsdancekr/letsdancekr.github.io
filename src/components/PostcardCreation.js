import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import './CreateCharacter.css';
import Invitation from './Invitation';
import { UseVideo } from './VideoContext';

// 이미지 프리로딩 함수
function preloadImages(imageArray) {
  const promises = imageArray.map((imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = resolve;
      img.onerror = reject;
    });
  });
  return Promise.all(promises);
}

const modelPositions = [
  { x: 32, y: 131, width: 220, height: 220 },
  { x: 145, y: 83, width: 220, height: 220 },
  { x: 200, y: 40, width: 220, height: 220 },
];

const backgroundImages = [
  '/static/stockimages/trans_bg1.webp',
  '/static/stockimages/trans_bg2.webp',
  '/static/stockimages/trans_bg3.webp',
];

const postcardImages = [
  '/static/stockimages/postcard.webp',
  '/static/stockimages/postcard_underlined.webp',
];



const PostcardCreation = ({isFixedSize}) => {
  const { videoFiles } = UseVideo();

  useEffect(() => {
    // 이미지 및 비디오 파일 프리로딩
    const allAssetsToPreload = [...backgroundImages, ...postcardImages, ...(videoFiles || [])];
    
    preloadImages(allAssetsToPreload)
      .then(() => {
        // setIsLoading(false); // 이미지 로딩 완료 시 로딩 상태 업데이트
      })
      .catch((error) => {
        console.error('Error preloading images:', error);
        // setIsLoading(false); // 에러 발생 시에도 로딩 완료로 간주
      });
  }, [videoFiles]);
  

  const postcardRef = useRef(null); // Ref for postcard container
  const [fontSize, setFontSize] = useState('12px'); // State for font size


  useEffect(() => {
    const updateFontSize = () => {
      if (postcardRef.current) {
        const parentWidth = postcardRef.current.offsetHeight; // Get parent width
        const newFontSize = `${((parentWidth / 532) * (12)).toFixed(2)}px`; // Calculate font size
        setFontSize(newFontSize); // Update font size state
        // alert(newFontSize);
      }
    };

    updateFontSize(); // Initial calculation
    window.addEventListener('resize', updateFontSize); // Update on resize

    return () => {
      window.removeEventListener('resize', updateFontSize); // Clean up on unmount
    };
  }, []);

    // Preload background images
    useEffect(() => {
      backgroundImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { selectedBackground, gifUrl, realgifUrl } = location.state || {};

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isNameEmpty, setIsNameEmpty] = useState(true);
  const [isCommentEmpty, setIsCommentEmpty] = useState(true);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setIsNameEmpty(value.length === 0);
  };

  const handleCommentChange = (e) => {
    setIsCommentEmpty(false); 
    const value = e.target.value;
    if (value.length <= 75) {
      setComment(value);
      setIsCommentEmpty(value.length === 0);
    }
  };

  const handleSubmit = async () => {
    try {
      const currentTime = new Date().toISOString();
      const postData = {
        gifName: realgifUrl,
        name,
        comment,
        timestamp: `${new Date().getFullYear()}년 ${String(new Date().getMonth() + 1).padStart(2, '0')}월 ${String(new Date().getDate()).padStart(2, '0')}일에 함께 한 춤사위`,
        selectedBackground,
      };
      
      navigate(`/postcardview/`, { state: {postcardData: postData, videoFiles: videoFiles } });
    } catch (error) {
      console.error('Error submitting postcard:', error);
      alert('포스트카드 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const currentModelPosition = modelPositions[selectedBackground - 1];

  const [isInvitationVisible, setIsInvitationVisible] = useState(false); // Invitation의 가시성을 관리하는 상태

  const handleMenuClick = () => {
    // alert('메뉴 클릭');
    setIsInvitationVisible(true);
    // setIsFloatingVisible(false); // Invitation을 보이면 플로팅 버튼을 숨김
  };

  // Invitation을 숨기고 원래 화면으로 돌아가는 함수 (뒤로가기 클릭 시 호출됨)
  const handleBackClick = () => {
    setIsInvitationVisible(false);
    // setIsFloatingVisible(true); // Invitation을 숨기고 플로팅 버튼을 다시 보이게 함
  };

  return (
    <div className="postcard-page">

        {/* Invitation이 보일 때 */}
  {isInvitationVisible && (
    <div
      className={`invitation-container ${
        isInvitationVisible ? "visible" : ""
      }`}
      style={{ zIndex: "1000" }}
    >
      <Invitation onBack={handleBackClick} /> {/* Invitation 컴포넌트 및 뒤로가기 핸들러 */}
    </div>
  )}
  
      <div className="header-container">
        <Header title="답신 보내기" onMenuClick={handleMenuClick} />
      </div>

      <div className="postcard-container" style={{
        width: '100%',
      }}>
        <div className="postcard-content" ref={postcardRef} style={{
          fontWeight: 'bold',
          fontSize: fontSize,
          lineHeight: '2.3',
          letterSpacing: '-0.5px', /* 자간 -0.5px */
          fontFamily: 'Cafe24Simplehae',
          color:'#412823',
          // backgroundImage: "url('/static/stockimages/postcard_underlined.webp')" ,
          backgroundImage: isCommentEmpty? "url('/static/stockimages/postcard_underlined.webp')" : "url('/static/stockimages/postcard.webp')" ,
          backgroundSize: 'contain',
          width: '85%',
          // color:'pink',
        }}>
          
          {selectedBackground && (
            <div className="background-container">
              <div 
                className="background-image"
                style={{
                  backgroundImage: `url('/static/stockimages/trans_bg${selectedBackground}.webp')`
                }}
              />

                                  {/* 새 이미지 */}

                  {videoFiles.map((file, index) => (
                  <img
                      key={index}
                      src={file}
                      alt="Generated Image"
                      style={{
                          position: 'absolute',
                          top: `${currentModelPosition.y / 400 * 80 + 2}%`,
                          left: `${currentModelPosition.x / 500 * 100 + 1}%`,
                          width: `${currentModelPosition.width / 400 * 108}%`,
                          aspectRatio: '1 / 1',
                      }}
                  />
              ))}

            </div>
          )}

          <div className="input-section">
              <div id="input-name">
                {/* <label htmlFor="name">이름 :</label> */}
                <label htmlFor="name"> </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className={isNameEmpty ? 'empty' : ''}
                />
              </div>
              <div id="input-comment">
                {/* <label htmlFor="comment">한마디 :</label> */}
                <label htmlFor="comment"> </label>
                <div className="textarea-container">
                  <div className={`textarea-background ${isCommentEmpty ? '' : 'hidden'}`}></div>
                  <textarea
                    id="comment"
                    maxLength={75}
                    value={comment}
                    onChange={handleCommentChange}
                    className={`lined-textarea ${isCommentEmpty ? 'empty' : ''}`}
                    style ={{          
                      fontSize: isFixedSize? 'calc(1rem * 0.8)' : '1.8vh',
                      lineHeight: isFixedSize? 'calc(1rem * 1.86)' : '4.05vh',
                    }}
                  />
                </div>
                <div className="char-count">{comment.length}/75</div>
              </div>
            </div>

          {/* <div id="finalwords">
            이제 춤을 추러 가봅시다.<br />
            우리의 춤판엔 어떤 사람들이 모였을까요?<br />
            우리는 어떤 춤을 추게 될까요?
          </div> */}
        </div>
      </div>

      <div id="submitcontainer">
        <button className="submit-button" onClick={handleSubmit}>
          '나'의 춤 추러가기
        </button>
      </div>
      
      <style>{`
        .postcard-page {
          font-family: 'Cafe24Simplehae', sans-serif;
          
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;

          // background-color: yellowgreen;
        }
        .header-container {
          position: absolute;
          top:0;
          width: 100%;
          height: 58px;
          font-family: 'Pretendard', sans-serif;
        }
        .postcard-container {
          // width: 100%;
          
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          // background: salmon;
        }

        .postcard-content {
          margin: 60px;
          box-sizing: border-box;

          background-size: contain; /* 이미지가 비율을 유지하며 축소/확대됨 */
          background-repeat: no-repeat;
          background-position: center;

          filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.5));

          aspect-ratio: 1292 / 2132 !important; /* 비율 유지 */
          
          width: calc(100% - 100px); /* 부모 요소 너비에 맞춤 */
          max-width: 390px; /* 최대 너비 390px로 제한 */
          height: auto; /* 높이 0으로 설정 */
          min-height: 200px; /* 최소 높이 0으로 설정 */
          
          
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          // box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          // background-color: yellow; /* 이미지가 채워지지 않은 부분에 노란 배경 */
        }

        .guide-text {
          position: absolute;
          top: 13%;
          left:0;
          width:100%;

          text-align: center;
          vertical-align: top;
          
        }

        #finalwords {
          position: absolute;
          top: 70%;
          width : 100%;
          text-align : center;
        }

        
        .background-container {
          position: absolute;
          top: 29%;
          left: 50%;
          width: 45%;
          height: 36%;
          // background-color: purple;
        }
        .background-image {
          width: 100%;
          height: 100%;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .gif-overlay {
          position: absolute;
          object-fit: contain;
        }

        .input-section {
          position: absolute;
          top:28.7%;
          left: 10%;
          width: 36%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: start;

          margin-right: 20px;
        }

        #input-name {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        #input-name label {
          font-size: 1em;
          width: 100%;
        }
       #input-name input {
          position: absolute;
          top: 1.7%;
          right: 10%;
          width: 65%;
        
          font-family: "Cafe24Simplehae";
          font-size: 1em;
          font-weight: bold;
          line-height: 1;
          color: #412823;
          background: transparent; /* 배경을 투명하게 설정 */
          border: none; /* 기본 border 제거 */
          outline: none; /* 클릭 시 나타나는 기본 outline 제거 */
          border-bottom: 1px solid #555;
          transition: border-bottom 0.3s ease;
        }

      #input-name input:not(.empty) {
        border-bottom: none;
      }

      #input-comment {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
      }

      #input-comment label {
          margin-top: 5.8%;
          font-size: 1em;
          line-height: 2;
          color: #333;
          margin-bottom: 45.6%;
        }

       #input-comment textarea {
          position: absolute;
          width: 100%;
          left: -2%;
          border: none;
          height: 26%;
          background: transparent;
          overflow: hidden;
          margin-top:-5%;

          vertical-align: bottom;
          
          outline: none;
          font-family: 'Cafe24Simplehae', sans-serif;
          font-weight: bold;
          color: #412823;
          resize: none;

        }

        .textarea-container {
          width: 100%;
          height: 90px;
          // background: red;
        }

        .textarea-background.hidden {
          opacity: 0;
        }
        .input-group textarea.lined-textarea {
          width: 100%;
          height: 150px;
          resize: none;
          background: transparent;
          border: none;
          line-height: 2;
          padding: 0;
          z-index: 1;
        }

        .char-count {
          position: absolute;
          top: 5.7%;
          align-self: flex-end;
          font-size: 12px;
          color: #777;
          margin-top: 1%;
        }

        #submitcontainer {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #F8F6F1;
          border-top: 1px solid #E6E1DC;
        }
        .submit-button {
          width: 170px;
          height: 35px;
          background-color: #F8F6F1;
          border: 1px solid #E6E1DC;
          color: #412823;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
        }
          .hidden {
        opacity: 0;
        visibility: hidden;
      }

      `}</style>
    </div>
  );
};

export default PostcardCreation;