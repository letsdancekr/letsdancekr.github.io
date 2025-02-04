import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import './CreateCharacter.css';
import './PlaceSelection.css';
import { isTablet, isDesktop } from 'react-device-detect'; // 추가
import Invitation from './Invitation'; // Invitation 컴포넌트 임포트
import { UseVideo } from './VideoContext';

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

  
const backgrounds = [
    "/static/stockimages/trans_bg1.webp",
    "/static/stockimages/trans_bg2.webp",
    "/static/stockimages/trans_bg3.webp",
];

const modelPositions = [
    { x: 32, y: 131, width: 215, height: 220 },
    { x: 145, y: 83, width: 215, height: 220 },
    { x: 200, y: 40, width: 215, height: 220 },
];

const descriptions = [
    {
        title: "만월댄스",
        date: "2019",
        text: "그림의 꽉 찬 만월은 여성성의 세상이 때가 되었음을 상징합니다. 가부장적인 현장의 시작인 '집' 옥상 위에서 슬리퍼를 신은 여성이 깨춤(절로 흥이 나서 제멋대로 추는 막춤)을 춥니다. 각자의 일상에서 우리는 늘 불평등의 문제를 만납니다. 자, 이제 둥근달이 떴습니다. 모두가 어떤 억압도 없이 나다운 삶을 살 수 있도록 '나'만의 해방의 춤을 신나게 춥시다. 달빛이 닿아 반짝이는 이들의 아름다운 세상을 기대합니다.",
        image: "static/stockimages/work1.webp",
    },
    {
        title: "뭇생명의 작은 날갯짓과 함께",
        date: "2022",
        text: "혐오의 시대, 폭력이 난무하는 시대에 우린 던져져 있습니다. 기후 위기로 산이 불타오르고, 인간은 여전히 전쟁 중이며, 매스컴은 소비와 탐욕을 부추깁니다. 그럼에도 순천만 갈대는 많은 생명들을 품은 채 밤새 춤을 추었고, 작은 풀벌레는 초록 잎 위에서 이슬 한 모금 들이켜고 한껏 노래를 부릅니다. 그 마음들이 모여 뜨거운 생명평화 나무가 솟아납니다. 뭇 생명들과 한데 살아갈 수 있는 세상을 향해 그들의 작은 날갯짓들과 함께 춤을 춥시다. 인권과 자연의 권리가 살아 숨 쉬는 평화로운 세상을 기대합니다.",
        image: "static/stockimages/work2.webp",
    },
    {
        title: "기쁨의 정원",
        date: "2024",
        text: "우리는 모두 연결된 존재입니다. 그림의 가운데에는 인드라망 무늬가 빛을 내고 있습니다. 이는 해, 달, 나무, 네 발 달린 동물, 사람, 새, 물고기가 이어져 서로 기대어 산다는 의미의 상징 무늬입니다. 버드나무는 팔을 크게 흔들어 마당을 일으키고, 북극곰과 노루, 고양이가 흥겹게 춤을 추고 있습니다. 아이와 상괭이는 블루스를 추고, 새도 신이나 날갯짓을 합니다. 우리도 함께 신나게 춤을 춥시다. 모두가 함께 살아가는 기쁨의 세상을 위해 빛을 내며 춤을 춥시다.",
        image: "static/stockimages/work3.webp",
    }
];

const PlaceSelection = ({isFixedSize}) => {
    useEffect(() => {
        // 배경 이미지 프리로딩
        const backgroundImages = backgrounds.map((background) => background);
      
        // 작품 설명 이미지 프리로딩
        const descriptionImages = descriptions.map((description) => description.image);
      
        // 아이콘 이미지 프리로딩
        const iconImages = ["/static/icons/down.webp"];
      
        // 모든 이미지 합치기
        const allImages = [...backgroundImages, ...descriptionImages, ...iconImages];
      
        // 이미지 프리로딩
        preloadImages(allImages);
      }, []);

      
    const { videoFiles } = UseVideo();

    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        // 화면 크기 업데이트 함수
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        // 윈도우 리사이즈 이벤트 리스너 등록
        window.addEventListener('resize', handleResize);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 높이 제한 계산
    const shouldLimitHeight = (isTablet || isDesktop); // tablet 또는 desktop이면 제한 적용

    const [isInvitationVisible, setIsInvitationVisible] = useState(false); // Invitation의 가시성을 관리하는 상태
    const [isFloatingVisible, setIsFloatingVisible] = useState(true); // 플로팅 버튼 가시성 관리 상태
  
    // Invitation을 보이게 하는 함수 (메뉴 클릭 시 호출됨)
    const handleMenuClick = () => {
      setIsInvitationVisible(true);
    };
  
    // Invitation을 숨기고 원래 화면으로 돌아가는 함수 (뒤로가기 클릭 시 호출됨)
    const handleBackClick = () => {
      setIsInvitationVisible(false);
    };
    
      // 초대장 이미지 표시 관련
    const [showImage, setShowImage] = useState(false); // 이미지 표시 여부를 결정하는 상태

    const handleCloseImage = () => {
      setShowImage(false); // 화면을 클릭하면 이미지 사라지게 설정
    };


    const location = useLocation();
    const navigate = useNavigate();
    const { gifUrl, realgifUrl } = location.state || {};
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const containerRef = useRef(null);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    };
    
    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + backgrounds.length) % backgrounds.length);
    };

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10);
        }
    };

    useEffect(() => {
        const currentContainer = containerRef.current;
        if (currentContainer) {
            currentContainer.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const scrollToBottom = () => {
        // eslint-disable-next-line no-unused-expressions
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    };
      
    const scrollToTop = () => {
        // eslint-disable-next-line no-unused-expressions
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectPlace = () => {
        console.log('Selected background:', currentIndex + 1);
        navigate('/postcardcreation', { state: { selectedBackground: currentIndex + 1, gifUrl, realgifUrl, videoFiles } });
    };
    
    const currentModelPosition = modelPositions[currentIndex] || modelPositions[0];
    const currentDescription = descriptions[currentIndex] || descriptions[0];

    if (!currentDescription) {
        return <div>Loading...</div>;
    }

    document.addEventListener('scroll', function() {
        document.documentElement.scrollLeft = 0;  // 항상 가로 스크롤을 0으로 유지
    });
    
    

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%', 
            margin: '0', 
            left: '0', 
            overflowY: 'hidden',
            overflowX: 'hidden',
        }}>
            <Header title="장소 정하기" needthird={true} onMenuClick={handleMenuClick} style={{ position: 'fixed' }} />
        
            {isInvitationVisible && (
                <div className={`invitation-container ${isInvitationVisible ? 'visible' : ''}`}>
                    <Invitation onBack={handleBackClick} />
                </div>
            )}

            <div ref={containerRef} style={{ 
                position: 'fixed',
                flex: 1, 
                top: '58px',
                left:0,
                bottom: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',   
                width: '100%',
                height: 'calc(100% - 118px)',
                overflowY: 'auto',
                backgroundColor: '#F8F6F1', 
                boxSizing: 'border-box',
            }}>


            <div id="top" style={{
                display: 'flex',
                flexDirection: 'column',
                // justifyContent: 'center',
                alignItems: 'center',
                padding: '0 20px',  
                top: '0',
            }}>

                {/* Image and gif */}
                <div id="picturecontainer" style={{ 
                    position: 'relative',

                    aspectRatio: '23 / 28',
                    
                    minHeight: (isDesktop || isTablet) ? '340px' : 'calc(95dvh - 410px)',
                    width: 'auto',
                    maxWidth: '400px',
                    margin: '10px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                    backgroundImage: `url(${backgrounds[currentIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',

                }}>
                    {/* 새 이미지 */}

                    {videoFiles.map((file, index) => (
                        <img
                            key={index}
                            src={file}
                            alt="Generated Image"
                            style={{
                                position: 'absolute',
                                top: `${currentModelPosition.y / 400 * 80}%`,
                                left: `${currentModelPosition.x / 500 * 100}%`,
                                width: `${currentModelPosition.width / 400 * 108}%`,
                                aspectRatio: '1 / 1',
                            }}
                        />
                    ))}

                </div>

                <div id="directions" style={{
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        top: (isDesktop || isTablet) ? '175px' : 'calc(47.5dvh - 205px)',
                        left: '0',
                        width: '100%',
                        padding: '0 30px',
                        boxSizing: 'border-box',
                        fontSize: '22px',
                        color: 'rgba(65,30,45,0.3)',
                        zIndex: 1000,
                        textShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
                        cursor: 'pointer',
                    }}>
                        <div 
                            onClick={handlePrevious}
                        >
                            &#9664;
                        </div>
                        <div 
                            onClick={handleNext}
                        >
                            &#9654;
                        </div>
                    </div>
                {/* Dot Indicators */}
                <div style={{ 
                    position: 'relative',
                    // top: 'calc(100% - 270px)',
                    display: 'flex', 
                    justifyContent: 'center', 
                    margin: '0' ,
                    }}>
                    {backgrounds.map((_, index) => (
                        <div 
                            key={index} 
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: index === currentIndex ? 'rgba(65,30,45,1)' : 'rgba(65,30,45,0.3)',
                                margin: '0 5px',
                            }}
                        />
                    ))}
                </div>

                <hr style={{ 
                    width: '100%',
                    marginTop: '5px 0', 
                    border: '0.5px solid #E6E1DC' }} />

                {/* Work details */}
                <div id="workdetails" style={{ 
                    position: 'relative',
                    letterSpacing:`-0.5px`,
                    width: '100%',
                    maxWidth: '390px',
                    marginTop: '-5px',
                    textAlign: 'center',
                    minHeight: '330px', // Minimum height for this section
                    maxHeight: '330px', // Minimum height for this section
                    // backgroundColor: 'blue',
                }}>
                    <div id='worktitle' >{currentDescription.title}</div>
                    <div id="workdate">{currentDescription.date}</div>
                    <div id="workexplanation">{currentDescription.text}</div>

                   

                {/* Copyright text */}
                
                </div>

                </div>

                {/* Scroll button */}
                <div 
                    onClick={isScrolledToBottom ? scrollToTop : scrollToBottom} 
                    style={{
                        display: 'flex',
                        flexDirection: isScrolledToBottom ? 'column' : 'column-reverse',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        position: 'fixed',
                        textAlign: 'center',
                        left: 0,
                        top: isScrolledToBottom ? '58px' : 'auto',
                        bottom: isScrolledToBottom ? 'auto' : '60px',
                        width: '100%',
                        height: '65px',
                        borderTop: !isScrolledToBottom ?  '1px solid #E6E1DC' : 'none',
                        borderBottom: isScrolledToBottom ?  '1px solid #E6E1DC' : 'none',
                        backgroundColor: '#F8F6F1',
                        cursor: 'pointer',
                        textAlign: 'center',
                        padding: '7px',
                        boxSizing: 'border-box',
                        zIndex: 1000,
                    }}
                >
                     <div style={{ 
                        position: 'absolute',
                        top: '-20px',
                        color: '#9C9C9C', 
                        fontSize: '8px', 
                        display: 'block',
                        width: '100%',
                        textAlign: 'right',
                        right: '30px',
                        display: isScrolledToBottom ? 'none' : 'block',
                        zIndex: 999
                    }}>
                        * 해당 배경은 김화순 작가의 작품을 오마주하여 제작하였습니다.
                    </div>
                    <span>{isScrolledToBottom ? '장소 고르러 돌아가기' : '원본 작품 보러가기'}</span>
                    <br/>
                    <img 
                        src="/static/icons/down.webp" 
                        alt="Arrow" 
                        style={{
                            margin: '-12px',
                            width: 'auto', 
                            height: '55%', 
                            transform: isScrolledToBottom ? 'rotate(180deg)' : 'none',
                        }} 
                    />
                </div>

                    <img 
                        src={currentDescription.image} 
                        alt="original work" 
                        style={{ 
                            position: 'relative',
                            // margin: '10px 0',
                            width: '100%',
                            height: 'auto',
                            maxHeight: isFixedSize? '605px': 'calc(100dvh - 185px)',
                            objectFit: 'contain',
                        }} 
                    />

            </div>

            {/* Bottom button */}
            <div style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                borderTop: '1px solid #E6E1DC',
                width: '100%',
                height: '60px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F8F6F1',
                zIndex: 1000,
                fontFamily: "Pretendard-Regular",
            }}>
                <button id="scrolldownbutton" onClick={handleSelectPlace}>
                    여기서 춤추기
                </button>
            </div>
        </div>
    );
};

export default PlaceSelection;
