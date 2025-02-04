import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Invitation from './Invitation';
import './Home.css';
import { useLocation } from 'react-router-dom';

function Home( {isFixedSize}) {

  // Tutorial State
  const [tutorialVisible, setTutorialVisible] = useState(true);
  
  // Floating Button State
  const floatingButtonRef = useRef(null);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false); // Initially false
  const [buttonImagesLoaded, setButtonImagesLoaded] = useState(false); // Track button images loading

  // Container Ref
  const containerRef = useRef(null);

  // Postcards State
  const [postcards, setPostcards] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isInvitationVisible, setIsInvitationVisible] = useState(false);
  const [marginTop, setMarginTop] = useState(0);

  // Banner and Button Images
  const bannerImages = useMemo(() => [
    '/static/stockimages/mainbanner1.webp',
    '/static/stockimages/mainbanner2.webp',
    '/static/stockimages/mainbanner3.webp'
  ], []);

  const buttonImages = useMemo(() => [
    '/static/images/buttonImages/button1.webp',
    '/static/images/buttonImages/button2.webp',
    '/static/images/buttonImages/button3.webp',
    '/static/images/buttonImages/button4.webp',
    '/static/images/buttonImages/button5.webp',
    '/static/images/buttonImages/button6.webp',
    '/static/images/buttonImages/button7.webp',
    '/static/images/buttonImages/button8.webp'
  ], []);

  // Refs to prevent multiple preloads
  const preloadedButtonImagesRef = useRef(false);
  const preloadedBannerImagesRef = useRef(false);

  // Preload Images Function
  const preloadImages = useCallback((imageArray) => {
    return Promise.all(
      imageArray.map((imageSrc) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageSrc;
        });
      })
    );
  }, []);

  // Preload Button Images First
  useEffect(() => {
    if (!preloadedButtonImagesRef.current) {
      preloadImages(buttonImages)
        .then(() => {
          console.log('CHP_react: FE and BE by Hyungyu Lee');
          preloadedButtonImagesRef.current = true;
          setButtonImagesLoaded(true); // Set button images loaded
        })
        .catch((error) => {
          console.error('Error preloading button images:', error);
        });
    }
  }, [buttonImages, preloadImages]);

  // Preload Banner Images After Button Images
  useEffect(() => {
    if (buttonImagesLoaded && !preloadedBannerImagesRef.current) {
      preloadImages(bannerImages)
        .then(() => {
          // console.log('Banner images preloaded successfully');
          preloadedBannerImagesRef.current = true;
        })
        .catch((error) => {
          console.error('Error preloading banner images:', error);
        });
    }
  }, [buttonImagesLoaded, bannerImages, preloadImages]);

  // Floating Button Logic
  useEffect(() => {
    if (!buttonImagesLoaded) return; // Do not execute until button images are loaded

    setIsFloatingVisible(true); // Now floating button can be visible

    const floatingButton = floatingButtonRef.current;
    const container = containerRef.current;
    
    if (floatingButton && container && isFloatingVisible) {

      const buttonWidth = 70;
      const buttonHeight = 70;
      const collisionMargin = 5;
      const collisionCooldown = 2000; // Reduced cooldown time
  
      let lastCollisionTime = 0;

      const updateContainerDimensions = () => {
        const containerRect = container.getBoundingClientRect();
        const maxX = Math.min(containerRect.width - buttonWidth / 2, 390 - buttonWidth / 2);
        const maxY = Math.min(containerRect.height - buttonHeight / 2, 780 - buttonHeight / 2);
        return { maxX, maxY };
      };
  
      let { maxX, maxY } = updateContainerDimensions();
  
      let posX = Math.random() * maxX;
      let posY = Math.random() * maxY;
      let angle = Math.random() * 2 * Math.PI;
  
      function getRandomButtonImage() {
        const currentImage = floatingButton.style.backgroundImage;
        let newImage;
        do {
          newImage = buttonImages[Math.floor(Math.random() * buttonImages.length)];
        } while (newImage === currentImage);
        return newImage;
      }
  
      function moveFloatingButton() {
        if (!isFloatingVisible) {
          return;
        }
        const now = Date.now();
        ({ maxX, maxY } = updateContainerDimensions());

        const angleVariation = (Math.random() - 0.5) * 0.03; // Reduced from 0.1 to 0.03
        angle += angleVariation;

         // Reduce speed to make the movement slower
        posX += Math.cos(angle) * (3 * 0.2);  // Speed reduced
        posY += Math.sin(angle) * (3 * 0.2);  // Speed reduced
    
        let collision = false;
      
        // Boundary handling
        if (posX <= collisionMargin || posX >= maxX - collisionMargin) {
          angle = Math.PI - angle; // Reflect horizontally
          collision = true;
        }

        if (posY <= collisionMargin + 29 || posY >= maxY - collisionMargin) {
          angle = -angle; // Reflect vertically
          collision = true;
        }
          
        floatingButton.style.left = `${posX}px`;
        floatingButton.style.top = `${posY}px`;

         // Smooth change in direction instead of random large changes
          if (collision && now - lastCollisionTime > collisionCooldown) {
            // console.log("Collision detected, changing image", now, lastCollisionTime);
            lastCollisionTime = now;
            floatingButton.style.backgroundImage = `url(${getRandomButtonImage()})`;
            collision = false;
          }
        
        requestAnimationFrame(moveFloatingButton);
      }
      
      // Initial Setup
      floatingButton.style.position = 'absolute';
      floatingButton.style.width = `${buttonWidth}px`;
      floatingButton.style.height = `${buttonHeight}px`;
      floatingButton.style.backgroundSize = 'cover';
      floatingButton.style.display = 'block';
      
      // Set initial background image
      floatingButton.style.backgroundImage = `url(${getRandomButtonImage()})`;

      // Initial Position
      posX = Math.random() * (maxX - buttonWidth - 2 * collisionMargin) + collisionMargin;
      posY = Math.random() * (maxY - buttonHeight - 2 * collisionMargin) + collisionMargin + 58;
      
      floatingButton.style.left = `${posX}px`;
      floatingButton.style.top = `${posY}px`;

      requestAnimationFrame(moveFloatingButton);
      
      floatingButton.addEventListener('click', () => {
        window.location.href = '/CreateCharacter';
      });

      window.addEventListener('resize', updateContainerDimensions);

      return () => {
        window.removeEventListener('resize', updateContainerDimensions);
      };
    }



    // Initialize AJAX Links
    function initializeAjaxLinks() {
      document.body.addEventListener('click', function (event) {
        const ajaxLink = event.target.closest('.ajax-link');
        if (ajaxLink) {
          event.preventDefault();
          const url = ajaxLink.href;
          const content = document.getElementById('content');
          content.classList.add('fade-out');
          setTimeout(() => {
            window.location.href = url;
          }, 500);
        }
      });
    }

    initializeAjaxLinks();

    // Adjust Container Height


    // Handle Scroll (Placeholder)
    function handleScroll(e) {
      // Handle scroll events if needed
    }

    // adjustContainerHeight();
    // window.addEventListener('resize', adjustContainerHeight);

    // const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      // window.removeEventListener('resize', adjustContainerHeight);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [buttonImagesLoaded, isFloatingVisible, buttonImages]);

  

  // Tutorial Overlay Logic
  const closeOverlay = () => {
    setTutorialVisible(false);
  };
  
  useEffect(() => {
    if (tutorialVisible) {
      const timer = setTimeout(() => {
        closeOverlay();
      }, 1000000);

      const handleClick = () => {
        closeOverlay();
      };

      document.addEventListener('click', handleClick);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClick);
      };
    }

  }, [tutorialVisible]);

  // Preload All Images After Button and Banner Images
  useEffect(() => {
    if (!buttonImagesLoaded) return; // Ensure button images are loaded first

    // Preload any additional images if needed
    // preloadImages([...additionalImages]);

    // Fetch Postcards
    const fetchPostcards = async () => {
      try {
        const response = await axios.get('/data/allData.json'); // JSON 파일 경로
        const data = response.data;
  
        // postcards가 배열인지 확인하고 설정
        if (Array.isArray(data.postcards)) {
          setPostcards(data.postcards);
        } else {
          console.error("Expected 'postcards' to be an array, but got:", typeof data.postcards);
        }
      } catch (error) {
        console.error("There was an error fetching the postcards!", error);
      }
    };
  

    fetchPostcards();

    // Banner Image Slider
    const imageInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(imageInterval);
  }, [buttonImagesLoaded, bannerImages]);

  // Handle Image Errors with Retry Logic
  const handleImageError = (e, num) => {
    const fallbackSrc = `https://placehold.co/200x200?text=Image+${num}+Error`;
    
    // Manage retry attempts
    if (!e.target.attemptedRetries) {
      e.target.attemptedRetries = 0;
    }
    
    // Retry once
    if (e.target.attemptedRetries < 1) {
      e.target.attemptedRetries += 1;
      e.target.src = e.target.src.split('?')[0] + `?retry=${e.target.attemptedRetries}`; // Invalidate cache
    } else {
      e.target.src = fallbackSrc; // Set fallback image on failure
    }
  };
  
  // Handle Menu Click to Show Invitation
  const handleMenuClick = () => {
    setIsInvitationVisible(true);
    setIsFloatingVisible(false);
  };

  // Handle Back Click to Hide Invitation
  const handleBackClick = () => {
    setIsInvitationVisible(false);
    setIsFloatingVisible(true);
  };

  // Adjust Footer Visibility Based on Scroll
  useEffect(() => {
    const adjustFooterVisibility = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const windowHeight = window.innerHeight;
        const footerTop = footer.getBoundingClientRect().top;
        if (footerTop < windowHeight) {
          footer.style.visibility = 'visible';
        } else {
          footer.style.visibility = 'visible';
        }
      }
    };
  
    window.addEventListener('resize', adjustFooterVisibility);
    adjustFooterVisibility();
  
    return () => window.removeEventListener('resize', adjustFooterVisibility);
  }, []);

  // Ensure Footer is Visible on Resize
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.visibility = 'visible';  // Force footer to be visible
      }
    };
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div key={location.pathname} className="App" style={{height: '100%', width: '100%'}}>
      
      {/* Tutorial Overlay */}
      {tutorialVisible && <div className="tutorial-overlay" style={{
        position: 'fixed',
        top: '0px',
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(129, 126, 114, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '3000',
      }}>
        <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '13px',
        width: '40px', // Diameter of the circle
        height: '40px', // Diameter of the circle
        borderRadius: '50%', // Makes it circular
        backgroundColor: '#F8F6F1', // Same as overlay background
        clipPath: 'circle(30px at 50% 50%)', // Circle cutout
        zIndex: '3001', // Ensure it's above the background but below the tutorial image
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img src="/static/icons/hamburger.webp" alt="menu" id="menu-button" style={{width: '30px'}}/>
              
    </div>
        <img src="/static/stockimages/tutorial.png" alt="tutorial" style={{
          position: 'absolute',
          top: '55px',
          width: '90%', 
          objectFit: 'contain',
          pointerEvents: 'none',
          }} />

        </div>}
      
      {/* Floating Button - Render Only After Button Images are Loaded */}
      {buttonImagesLoaded && isFloatingVisible && <div ref={floatingButtonRef} className="floating" style={{

      }}></div>}
      
      {/* Header Loader */}
      <div id="headerLoader" style={{ 
        backgroundColor: isInvitationVisible ? 'transparent' : '#f8f6f1', 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
      }}>
        <div id="header" style={{ 
          backgroundColor: 'transparent', 
          position:'absolute', 
          width:"100%", 
          height:"100%",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div className="titleArea" style={{ width: '100%' }}>
            <div style={{  flexGrow: 0, textAlign: 'left' }}  onClick={() => window.location.reload()}>
              <span style={{ fontFamily: "ClimateCrisisKR-1979", fontWeight: 200, fontSize: '15px', color: '#412823', lineHeight: '0.9', display: 'block' }}>이제</span>
              <span style={{ fontFamily: "ClimateCrisisKR-1979", fontWeight: 400, fontSize: '24px', color: '#412823', lineHeight: '0.9', display: 'block' }}>댄스타임</span>
            </div>
      
            <div onClick={handleMenuClick} style={{ 
              cursor: 'pointer', 
              display:'flex', 
              justifyContent:'center', 
              alignItems:"center",
            }}>
              <img src="/static/icons/hamburger.webp" alt="menu" id="menu-button" style={{width: '30px'}}/>
            </div>
          </div>
        </div>
        
      </div>

      {/* Main Content Container */}
      <div className="container" id="content" ref={containerRef} style={{
        flexGrow: 1,
        zIndex: 1500,
        overflowY: 'auto',
        height: '100%',
      }}>
        <div id="ajax-content">
          {/* Main Banner Image */}
          <div className="mainImage" style={{ 
            marginTop: `${marginTop}px`,
            pointerEvents: 'none',}}>
            <img 
              id="mainBanner" 
              src={bannerImages[currentImageIndex]} 
              alt="main" 
              className={`slider-image ${fade ? 'fade-in' : 'fade-out'}`} 
              onError={(e) => handleImageError(e, 'banner')}
            />
          </div>

          {/* Image Grid */}
          <div className="image-grid">
            {postcards.map((postcard) => (
              <div className="image-item" key={postcard.id} style={{
                aspectRatio: '1/1',
              }}>
                <img
                  style={{width:'100%', height:'100%'}}
                  src={`/uploads/${postcard.gif_name.replace('.gif', '.png')}`} // 확장자를 .png로 변경
                  alt={`grid ${postcard.id}`}
                  onError={(e) => handleImageError(e, postcard.id)} 
                  onClick={() => window.location.href = `/postcardshareview/${postcard.id}`} 
                  loading="lazy"  // Apply lazy loading
                />
              </div>
            ))}
          </div>
        <div style={{
            fontFamily: 'Pretendard-Regular',
            fontSize: '9px',
            textAlign: 'center',
            color: '#412823',
            boxSizing: 'border-box',
            paddingTop: '3vh',
            height: '150px',
            marginBottom: 'calc(60px)',
          }}>
          이제 댄스타임 : 평화의 나무에 달빛이 닿은 날, 반짝이는 춤결<br />
          춤판 이끔이 | 유채영 김휴초
        </div>
        </div>

        {/* Footer Note */}
      </div>

      {/* Invitation Overlay */}
      {isInvitationVisible && (
        <div className={`invitation-container ${isInvitationVisible ? 'visible' : ''}`} style={{}}>
          <Invitation onBack={handleBackClick} showbutton={true} />
        </div>
      )}

      {/* Footer */}

      <footer style={{letterSpacing:'-0.025em'}}>
        <div id="footer1">이 프로젝트는 2024년&nbsp;<a href="https://www.instagram.com/kkot.pida.gallery/">김화순 개인전</a>&nbsp;과 함께 진행되었습니다. </div>
        <div id="footer2">
        <div>2024. 10. 12 - 11. 3&nbsp;</div>
        <a href="https://www.zahamuseum.org">자하미술관</a>
        <div >&nbsp; | &nbsp;</div>
        <div >2024. 12. 09 - 2025. 01. 12 &nbsp;</div>
        <a href="https://place.map.kakao.com/1666463188">오월미술관</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
