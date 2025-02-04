import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useNavigate } from 'react-router-dom';
import GIF from 'gif.js';
import './CreateCharacter.css';
import Header from './Header.js';
import { UseVideo } from './VideoContext.js'; // Context에서 가져옴
import Invitation from './Invitation'; // Invitation 컴포넌트 임포트
import { useScene } from './SceneContext'; // SceneContext 사용
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function preloadImages(imageArray) {
  // 이미지 로드를 Promise로 처리
  return Promise.all(
    imageArray.map(
      (imageSrc) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.src = imageSrc;
          img.onload = resolve;  // 이미지가 로드되면 resolve
          img.onerror = reject;  // 로드 실패 시 reject
        })
    )
  );
}

const CreateCharacter = ({isFixedSize}) => {

  useEffect(() => {
    // 프리로딩할 이미지 리스트 구성
    const allImages = CATEGORIES.flatMap((category) =>
      category.assets.map((asset) => `/static/assetImages/${asset}.webp`)
    );

    // 프리로딩할 overlay 이미지 추가
    allImages.push('../static/stockimages/maker_invitation.webp');

    // 이미지 프리로딩 후 로딩 상태 업데이트
    preloadImages(allImages)
      .then(() => {
      })
      .catch((error) => {
        console.error("Error preloading images:", error);
      });
  }, );

  const dracoLoaderRef = useRef(null);
  const loaderRef = useRef(null);

  const [isAccessorySelected, setIsAccessorySelected] = useState(false);


  useEffect(() => {
    if (!dracoLoaderRef.current) {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      dracoLoaderRef.current = dracoLoader;
    }
  
    if (!loaderRef.current) {
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoaderRef.current);
      loaderRef.current = loader;
      
    }
  }, []);  

  const { updateSceneData } = useScene(); // SceneContext의 업데이트 함수 사용

  const [isInvitationVisible, setIsInvitationVisible] = useState(false); // Invitation의 가시성을 관리하는 상태

  // Invitation을 보이게 하는 함수 (메뉴 클릭 시 호출됨)
  const handleMenuClick = () => {
    setIsInvitationVisible(true);
 };

  // Invitation을 숨기고 원래 화면으로 돌아가는 함수 (뒤로가기 클릭 시 호출됨)
  const handleBackClick = () => {
    setIsInvitationVisible(false);
  };

  const { addVideoFile } = UseVideo(); // UseVideo를 컴포넌트 내부에서 호출

  const navigate = useNavigate();

  //초대장 이미지 표시 관련
  const [overlayVisible, setOverlayVisible] = useState(true);

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const modelsRef = useRef([]);

  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedFaceColor, setSelectedFaceColor] = useState('#FFF2F2');
  
  const [selectedIndices, setSelectedIndices] = useState({
    HEAD: null,
    TOP: null,
    BOTTOM: null,
    SHOES: null,
    ACCESSORY: null,
  });

// Define the accessory groups
const HATS = [0, 1, 2, 3, 4, 5, 7, 10, 11, 16, 17];
const GLASSES = [12, 13, 14, 15];
const OTHER_ACCESSORIES = [6, 8, 9];

// New state to store selected accessory indices by group
const [selectedAccessories, setSelectedAccessories] = useState({
  hat: null,
  glasses: null,
  other: null,
});

useEffect(() => {
  console.log("Updated selectedAccessories:", selectedAccessories);
  // selectedAccessories가 업데이트된 이후 수행할 작업
}, [selectedAccessories]);

const removeAccessoryModel = (group) => {
  return new Promise((resolve) => {
    modelsRef.current = modelsRef.current.filter((item) => {
      if (item.categoryName !== 'ACCESSORY' || selectedAccessories[group] === null) {
        return true;
      }
      
      const modelInScene = sceneRef.current.getObjectById(item.model.id);
      if (!modelInScene) {
        return false;
      }

      sceneRef.current.remove(item.model);

      item.model.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(disposeMaterial);
            } else {
              disposeMaterial(child.material);
            }
          }
        }
      });
      return false;
    });

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    resolve();
  });
};


const handleAssetSelection = async (category, index, modelPath) => {
  //소품은 아예 다르게 처리
  if (category === 'ACCESSORY') {
    let group = null;
    if (HATS.includes(index)) group = 'hat';
    else if (GLASSES.includes(index)) group = 'glasses';
    else if (OTHER_ACCESSORIES.includes(index)) group = 'other';
    console.log(`Selected accessory group: ${group}`);

    // 현재 그룹에 선택된 소품이 이미 있으면 제거
    if (selectedAccessories[group] !== null && selectedAccessories[group] === index) {
      await removeAccessoryModel(group, index);
      setSelectedAccessories((prev) => ({ ...prev, [group]: null }));
      return;
    }

    // 현재 그룹에 다른 소품이 선택되어 있으면 제거
    if (selectedAccessories[group] !== null && selectedAccessories[group] !== index) {
      await removeAccessoryModel(group, selectedAccessories[group]);
    }

    // 새로운 소품 로딩 및 상태 업데이트
    loadModel(modelPath, category+group);
    setSelectedAccessories((prev) => ({ ...prev, [group]: index }));

    setIsAccessorySelected(true); // 액세서리 선택됨

    return;
  }

    const isSameModelSelected = selectedIndices[category] === index;
    const isDress = (/19|20|21|22|23|24/.test(modelPath)) && category === 'TOP';

    if (isSameModelSelected) {
        await removeModel(category);
        setSelectedIndices(prev => ({ ...prev, [category]: null }));
        return;
    }

    // Handle other categories as usual
    if (selectedIndices[category] !== null) {
        await removeModel(category);
    }

    loadModel(modelPath, category);

    if (category === 'TOP' && isDress) {
        await removeBottomModel();
        setSelectedIndices(prev => ({ ...prev, [category]: index, 'BOTTOM': null }));
        return;
    } else if (category === 'BOTTOM' && selectedIndices['TOP'] >= 17) {
        await removeModel('TOP');
        setSelectedIndices(prev => ({ ...prev, [category]: index, 'TOP': null }));
        return;
    }

    setSelectedIndices(prev => ({ ...prev, [category]: index }));
};

// Modify removeModel to handle specific accessory items by index
const removeModel = (category, index = null) => {
    return new Promise((resolve) => {
        modelsRef.current = modelsRef.current.filter((item) => {
            if (item.categoryName !== category || (index !== null && item.index !== index)) {
                return true;
            }

            const modelInScene = sceneRef.current.getObjectById(item.model.id);
            if (!modelInScene) {
                console.log(`Model in category ${category} is already removed`);
                return false;
            }

            if (category === 'ACCESSORY'){
              return;
            }

            sceneRef.current.remove(item.model);

            if (item.mixer) {
                item.mixer.stopAllAction();
                item.mixer.uncacheRoot(item.model);
            }

            item.model.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(disposeMaterial);
                        } else {
                            disposeMaterial(child.material);
                        }
                    }
                }
            });
            return false;
        });

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        resolve();
    });
};

  
  // 모델을 씬에서 제거하는 함수 최적화// 모델을 씬에서 제거하는 함수 최적화
  const disposeMaterial = (material) => {
    if (material.map) {
      material.map.dispose();  // 텍스처 해제
    }
    material.dispose();  // Material 해제
  };
  
  
  

  const [loadingStatus, setLoadingStatus] = useState('Loading...');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedColors, setSelectedColors] = useState({
    HEAD: 'black',
    TOP: 'black',
    BOTTOM: 'black',
    SHOES: 'black',
    ACCESSORY: 'black',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('HEAD'); // 초기값을 'HEAD'로 설정
  const CATEGORY_NAME_MAP = {
    HEAD: '머리',
    TOP: '상의',
    BOTTOM: '하의',
    SHOES: '신발',
    ACCESSORY: '소품',
    EXPRESSION: '표정',
  };

  const CATEGORIES = [
    { name: 'HEAD', assets: ['head_9', 'head_10', 'head_11', 'head_12', 'head_1', 'head_2', 'head_3', 'head_4', 'head_5', 'head_6', 'head_7', 'head_8'], useColor: true }, // 12개
    // { name: 'TOP', assets: ['top_1', 'top_2', 'top_3', 'top_4', 'top_5', 'top_6', 'top_7', 'top_8', 'top_9', 'top_10', 'top_11', 'top_12', 'top_13', 'top_14', 'top_15', 'top_16', 'top_17', 'top_18', 'top_19', 'top_20', 'top_21', 'top_22', 'top_23', 'top_24'], useColor: false }, // 24개
    { name: 'TOP', assets: ['top_1', 'top_2', 'top_3', 'top_4', 'top_5', 'top_7', 'top_8', 'top_9', 'top_10', 'top_11', 'top_12', 'top_13', 'top_14', 'top_15', 'top_16', 'top_17', 'top_18', 'top_19', 'top_24'], useColor: false }, // 24개
    { name: 'BOTTOM', assets: ['bottom_1', 'bottom_2', 'bottom_3', 'bottom_4', 'bottom_5', 'bottom_6', 'bottom_7', 'bottom_8', 'bottom_9', 'bottom_10', 'bottom_11', 'bottom_12', 'bottom_13', 'bottom_14', 'bottom_15', 'bottom_16', 'bottom_17', 'bottom_18', 'bottom_19', 'bottom_20', 'bottom_21', 'bottom_22'], useColor: false }, // 22개
    { name: 'SHOES', assets: ['shoes_1', 'shoes_2', 'shoes_3', 'shoes_4', 'shoes_5', 'shoes_6', 'shoes_7', 'shoes_8', 'shoes_9', 'shoes_10', 'shoes_11', 'shoes_12'], useColor: false }, // 8개
    { name: 'ACCESSORY', assets: ['accessory_1', 'accessory_2', 'accessory_3', 'accessory_4', 'accessory_5', 'accessory_6', 'accessory_7', 'accessory_8', 'accessory_9', 'accessory_10', 'accessory_11', 'accessory_12', 'accessory_13', 'accessory_14', 'accessory_15', 'accessory_16', 'accessory_17', 'accessory_18'], useColor: false }, // 18개
    { name: 'EXPRESSION', assets: [], useColor: false },
  ];
  

  const COLORS = [
    { name: 'Red', bigCircle: '#E88181', smallCircle: '#F5A0A0' },
    { name: 'Yellow', bigCircle: '#D5CF78', smallCircle: '#E1E17B' },
    { name: 'Purple', bigCircle: '#B078F9', smallCircle: '#CCA9FA' },
    { name: 'Pink', bigCircle: '#F170BE', smallCircle: '#F8BAF1' },
    { name: 'Blue', bigCircle: '#66C7DD', smallCircle: '#A1EEFF' },
    { name: 'Green', bigCircle: '#83C0AA', smallCircle: '#96ECA9' },
    { name: 'Brown', bigCircle: '#9B7565', smallCircle: '#B18A82' },
    { name: 'Black', bigCircle: '#554343', smallCircle: '#694F4F' },
  ];

  const [selectedHeadIndex, setSelectedHeadIndex] = useState(0); // 선택된 얼굴 색 인덱스 상태 추가

  const selectCategory = useCallback((category) => {
    setActiveCategory(category);
    
    // 표정 카테고리를 선택했을 때 캔버스 초기화
    if (category.name === 'EXPRESSION') {
      const canvas = expressionCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = selectedFaceColor; // 흰색으로 설정
        ctx.fillRect(0, 0, canvas.width, canvas.height); // 캔버스 전체를 흰색으로 채움
      }
    }
  }, []);

  const selectColor = (categoryName, color) => {
    // 선택된 카테고리와 색상 정보를 콘솔에 출력 (디버깅용)
    console.log('Selected category:', categoryName);
    console.log('Selected color:', color);
  
    // alert로 정보 표시 (필요한 경우)
  
    setSelectedColors((prevColors) => ({
      ...prevColors,
      [categoryName]: color, // color 객체 전체를 저장
    }));

  };
  
  //표정 그리기 관련
  const GRAYSCALE_COLORS = [
    { color: '#FFF2F2', bigColor: '#EFE8E8', smallColor: '#F8F6F1' },
    { color: '#EADABC', bigColor: '#F6EABC', smallColor: '#FFF6D2' },
    { color: '#FFD4B3', bigColor: '#FFD4B3', smallColor: '#FFE5D2' },
    { color: '#CA9572', bigColor: '#CA9572', smallColor: '#DBA988' },
    { color: '#A36D4C', bigColor: '#A36D4C', smallColor: '#C68862' },
    { color: '#6B4311', bigColor: '#6B4311', smallColor: '#925E1D' }
  ];
  
  const [expressionIsErasing, setExpressionIsErasing] = useState(false); // 지우개 여부
  const expressionCanvasRef = useRef(null); // 표정을 그리는 캔버스  

  const clearCanvasWithColor = (color) => {
    const canvasContainer = document.querySelector('#facedrawingContainer');
    canvasContainer.style.backgroundColor = color; // 배경색을 색상으로 설정
    const canvas = expressionCanvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 배경색을 채움

    ctx.beginPath();  // 그리기 준비
  };

  const mixersRef = useRef([]);



  const loadModel = useCallback((modelPath, categoryName, useColor = false, onLoad) => {

    
    let storedExpressionTexture = null;
  
    // HEAD 카테고리인 경우 텍스처 백업
    if (categoryName === 'HEAD') {
      modelsRef.current.forEach(({ model }) => {
        model.traverse((child) => {
          if (child.name === 'head_1' && child.material.map) {
            storedExpressionTexture = child.material.map;
          }
        });
      });
    }
  
    // 중복된 모델이 이미 있는지 확인
    const existingModelIndex = findExistingModel(categoryName);
  
    if (existingModelIndex !== -1 && categoryName != 'ACCESSORY') {
      const existingModel = modelsRef.current[existingModelIndex];
  
      // 이미 선택된 동일 모델이면 제거만 하고 리턴
      if (existingModel.modelPath === modelPath) {
          // Base 카테고리의 경우는 모델을 제거하지 않음
        if (existingModel.categoryName === 'Base') {
          console.log('Base model selected again, not removing.');
          return;  // Base는 다시 선택해도 제거하지 않음
        }
        console.log('Same model selected again, removing it.');
        removeModelFromScene(existingModel);
        modelsRef.current.splice(existingModelIndex, 1);
        console.log('Current modelsRef after removal:', modelsRef.current);
        return; // 여기서 즉시 리턴
      }
  
      // 다른 모델이면 기존 모델을 제거
      console.log(`Removing existing model in the same category: ${existingModel.categoryName}`);
      removeModelFromScene(existingModel);
      modelsRef.current.splice(existingModelIndex, 1);
    }

    const pre_existingModel = modelsRef.current.find(modelItem => modelItem.modelPath === modelPath);
    if (pre_existingModel) {
      console.log("Model already loaded, skipping load:", modelPath);
      return;  // 이미 로드된 모델이 있으면 로딩하지 않음
    }

    // 새로운 모델 로드
    const loader = loaderRef.current;
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        sceneRef.current.add(model);

        model.traverse((child) => {
          if (child.isMesh) {
            // child.material.depthTest = false;  // 깊이 버퍼에 쓰지 않음
          }
        });
        
        setRenderOrder(model, categoryName);
  
        // HEAD 카테고리의 경우 텍스처 복원
        if (categoryName === 'HEAD' && storedExpressionTexture) {
          applyStoredTexture(model, storedExpressionTexture);
        }

        const mixer = new THREE.AnimationMixer(model);
        let action = null;
  
        // 애니메이션 설정
        if (gltf.animations.length > 0) {
          console.log('Animations:', gltf.animations);
          action = setupAnimation(mixer, gltf.animations[0]);
        }
  
        mixersRef.current.push(mixer);
  
        // 새 모델을 modelsRef에 추가
        modelsRef.current.push({ model, mixer, action, categoryName, modelPath });
        console.log('Adding model to modelsRef:', { categoryName, modelPath });
  
        if (onLoad) onLoad();
        setLoadingStatus('Loaded Successfully');
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          setLoadingStatus(`${Math.round(percentComplete)}% loaded`);
        }
      },
      (error) => {
        console.error('Error loading GLB file:', error);
        setLoadingStatus('Load Failed');
      }
    );
  }, []);
  
  // 기존 모델을 찾아서 제거
  function findExistingModel(categoryName) {
    return modelsRef.current.findIndex(item => {
      return item.categoryName.trim().toLowerCase() === categoryName.trim().toLowerCase();
    });
  }
  
  // 하의를 제거하는 함수
  function removeBottomModel() {
    modelsRef.current = modelsRef.current.filter((item) => {
      if (item.categoryName === 'BOTTOM') {
        removeModelFromScene(item);
        return false;
      }
      return true;
    });
  }
  
// 모델을 씬에서 제거하고 메모리 해제
function removeModelFromScene(modelItem) {
  sceneRef.current.remove(modelItem.model);  // 씬에서 모델 제거
  disposeModel(modelItem.model);  // 모델의 리소스 해제
}

// 모델 리소스를 해제하는 함수
function disposeModel(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }
  });
}

  // 저장된 텍스처를 적용하는 함수
  function applyStoredTexture(model, storedTexture) {
    model.traverse((child) => {
      if (child.name === 'head_1' && child.isMesh) {
        child.material.map = storedTexture;
        child.material.needsUpdate = true;
      }
    });
  }
  
  // 모델의 렌더 순서 설정
  function setRenderOrder(model, categoryName) {
    const renderOrderMap = {
      'Base': 10,
      'HEAD': 20,
      'TOP': 30,
      'BOTTOM': 40,
      'SHOES': 50,
      'ACCESSORY': 60
    };
    model.traverse((child) => {
      if (child.isMesh) {
        child.renderOrder = renderOrderMap[categoryName] || 0;
      }
    });
  }
  
  const setupAnimation = (mixer, animation) => {
    const action = mixer.clipAction(animation);
    action.setLoop(THREE.LoopRepeat);
    action.clampWhenFinished = true;
    action.play();
    const frameDuration = 1 / 24;
    mixer.update(frameDuration);
    action.paused = true;
    return action;
  };
  

  const updateCameraView = useCallback(() => {
    if (modelsRef.current.length === 0) return;

    const box = new THREE.Box3();
    modelsRef.current.forEach(({ model }) => {
      box.expandByObject(model);
    });

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5;

    // cameraRef.current.position.set(center.x, center.y, center.z + cameraZ);
    cameraRef.current.position.set(0, 1, 50);
    // cameraRef.current.lookAt(center);
    cameraRef.current.lookAt(new THREE.Vector3(0, 3.2, 0));
    cameraRef.current.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    return () => {
      // Stop and dispose mixers
      mixersRef.current.forEach((mixer) => {
        mixer.stopAllAction();
        // No dispose method on AnimationMixer, but removing references helps GC
      });
      mixersRef.current = [];
    };
  }, []);
  
  useEffect(() => {
    if (!canvasRef.current) return;

    const initThreeJS = () => {
      sceneRef.current = new THREE.Scene();
      sceneRef.current.background = null;
      
      rendererRef.current = new THREE.WebGLRenderer({ 
        antialias: true, 
        canvas: canvasRef.current, 
        alpha: true,
        // preserveDrawingBuffer: true 
      });

      rendererRef.currentoutputColorSpace = THREE.SRGBColorSpace;

      const canvasParent = canvasRef.current.parentNode;
      console.log(window.innerWidth, window.innerHeight);
      console.log(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      // cameraRef.current = new THREE.PerspectiveCamera(10, 1, 0.1, 1000);

      // 캔버스 크기에 따라 orthographic 카메라 설정
      const aspect = (canvasRef.current.clientWidth) / (canvasRef.current.clientHeight);
      console.log(aspect);
      const frustumSize = 5; // 카메라 시야 크기, 필요에 따라 조정

      cameraRef.current = new THREE.OrthographicCamera(
        (frustumSize * aspect ) / -2, // left
        (frustumSize * aspect ) / 2,  // right
        frustumSize / 2,             // top
        frustumSize / -2,            // bottom
        0.1,                         // near
        1000                         // far
      );

      rendererRef.current.setSize(canvasParent.clientWidth/2, canvasParent.clientHeight * 0.42); // 창 크기에 맞춰 초기화
      
      rendererRef.current.setClearColor(0x000000, 0);

        // 카메라 업데이트 후 정사각형 비율로 맞추기
      cameraRef.current.aspect = aspect; // 정사각형 비율 (aspect 1:1)
      cameraRef.current.updateProjectionMatrix();

      // hiddenRendererRef.current.setClearColor(0x000000, 0);

      const ambientLight1 = new THREE.AmbientLight(0xffffff, 1.0);
      sceneRef.current.add(ambientLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight2.position.set(2, 2, 2);
      sceneRef.current.add(directionalLight2);

      cameraRef.current.position.z = 5;

        // AmbientLight (전체적으로 부드러운 조명)
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      sceneRef.current.add(ambientLight);

      // 여러 개의 PointLight (다양한 위치에서 강한 조명)
      const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
      pointLight1.position.set(10, 10, 10);
      sceneRef.current.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 1, 100);
      pointLight2.position.set(-10, 10, 10);
      sceneRef.current.add(pointLight2);

      const pointLight3 = new THREE.PointLight(0xffffff, 1, 100);
      pointLight3.position.set(0, -10, 10);
      sceneRef.current.add(pointLight3);

      // DirectionalLight (태양처럼 넓게 퍼지는 조명)
      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight3.position.set(5, 10, 5);
      sceneRef.current.add(directionalLight3);

    };

    initThreeJS();
    loadModel('/static/models/animation_1.glb', 'Base', false, () => setLoadingStatus('Loaded Successfully'));
    
    const animate = () => {
      requestAnimationFrame(animate);
    
      const delta = clockRef.current.getDelta();
      modelsRef.current.forEach(({ mixer }) => mixer.update(delta));

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.clear(); 
        rendererRef.current.setClearColor(0xffffff, 0);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    
    };

    animate();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
    }
    
      // cancelAnimationFrame(animateRef.current);
    };
    
  }, [loadModel, updateCameraView]);

  const resetAndStartAnimation = () => {
    modelsRef.current.forEach(({ mixer, action }) => {
      if (mixer && action) {
        action.setLoop(THREE.LoopOnce);  // 애니메이션을 한 번만 재생
        action.clampWhenFinished = true; // 애니메이션이 끝난 후 멈추도록 설정
        action.reset();                  // 애니메이션을 처음부터 시작
        action.play();                   // 애니메이션 실행
      }
    });
  };

  // const startGifRecording = () => {
  //   return new Promise((resolve) => {
  //     rendererRef.current.setSize(400, 400);

  //     const canvas = document.createElement('canvas');
  //     canvas.width = 400;
  //     canvas.height = 400;
  //     const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  //     const gif = new GIF({
  //       workers: 4,
  //       quality: 10,
  //       width: 400,
  //       height: 400,
  //       transparent: 'rgba(0,0,0,0)',
  //     });
  
  //     const originalFps = 24;  // 원래 애니메이션 재생 속도
  //     const totalFrames = 450; // 450프레임 녹화
  //     const frameDuration = 1 / originalFps;  // 24fps 기준 프레임당 시간
  //     let frameCount = 0;
  
  //     // 애니메이션을 2배 빠르게 재생
  //     resetAndStartAnimation();
  //     modelsRef.current.forEach(({ mixer }) => {
  //       mixer.timeScale = 1;  // 애니메이션 속도를 2배로
  //     });

  
  //     gif.on('finished', async (blob) => {
  //       console.log('gif created');
  //       // 서버에 GIF 업로드
  //       let gifUploadUrl = await uploadGif(blob);
      
  //       // 업로드 후 URL 반환
  //       resolve(gifUploadUrl);
  //       gif.abort();
  //     });
      
  //     // 빠르게 렌더링 및 캡처하는 루프
  //     let delta = 0;
  //     while (frameCount < totalFrames) {
  //       // 애니메이션 프레임 업데이트 (2배 빠른 속도)
  //       modelsRef.current.forEach(({ mixer }) => mixer.update(frameDuration));
  
  //       // 캔버스에 그리기
  //       rendererRef.current.render(sceneRef.current, cameraRef.current);
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       ctx.drawImage(canvasRef.current, 0, 0);
  
  //       // GIF에 프레임 추가 (24fps로 보이도록 딜레이 설정)
  //       gif.addFrame(ctx, { copy: true, delay: 1000 / originalFps });

  //       if (frameCount === 0) {
  //               // 첫 번째 프레임을 PNG로 저장 (선택 사항)
  //         rendererRef.current.render(sceneRef.current, cameraRef.current);
  //         const pngBlob = canvas.toDataURL('image/png');
  //         // console.log("First frame as PNG:", pngBlob);
  //         addVideoFile(pngBlob);  // VideoContext에 첫 프레임 저장
  //       }
  

  //       frameCount++;
  //       delta += frameDuration;
  //     }
  
  //     // GIF 렌더링 시작
  //     gif.render();
  //   });
  // };
  
  

  const startRecording = async (setVideoFile) => {
    setIsRecording(true); // 녹화 시작

    // await new Promise((resolve) => setTimeout(resolve, 200)); // 약간의 대기 후 녹화 시작

    //모델링 정보 넘기기
    updateSceneData({
      mixer: modelsRef,
    });

  //녹화 카메라  
  cameraRef.current = new THREE.OrthographicCamera(
    -5, // left
    5,  // right
    5,  // top
    -5, // bottom
    0.1, // near
    1000 // far
  );

  cameraRef.current.position.set(0, 1, 50);
  cameraRef.current.lookAt(new THREE.Vector3(0, 3.2, 0));
  cameraRef.current.updateProjectionMatrix();

  await new Promise((resolve) => setTimeout(resolve, 30));

  resetAndStartAnimation(); 

  rendererRef.current.render(sceneRef.current, cameraRef.current);
  const firstFrame = canvasRef.current.toDataURL('image/png');
  addVideoFile(firstFrame); // VideoContext에 첫 프레임(스틸컷) 저장

   // 짧은 지연 후 녹화 시작
   await new Promise((resolve) => setTimeout(resolve, 30));


  
  // 100ms 지연을 위해 Promise와 setTimeout을 사용
  await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms 대기

  cameraRef.current.position.set(0, 1, 50);  // 기본 카메라 위치로 되돌리기
  cameraRef.current.lookAt(new THREE.Vector3(0, 3.2, 0));
  cameraRef.current.updateProjectionMatrix();

  
  console.log("Start recording initiated");
  // setIsRecording(true); // 녹화 시작

  try {
    // Wait for both GIF and MP4 recordings to finish
    // const gifUploadUrl = await startGifRecording();  // Return the gif URL directly
    // await startRecordingWithBackgrounds(setVideoFile);  // Handle MP4 recordings

    // console.log("Recording completed", gifUploadUrl);

    // Access video files from context

    // After recording is done and GIF is uploaded, navigate to placeselection
    navigate('/place-selection', {
      state: {
        gifUrl: 'offline archive',  // Use the returned gif URL directly
        realgifUrl: 'offline archive',
      },
    });

  } catch (error) {
    console.error("Error during recording:", error);
  }
};

  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  useEffect(() => {
    if (overlayVisible) {
      const timer = setTimeout(() => {
        closeOverlay();
      }, 30000);

      const handleClick = () => {
        closeOverlay();
      };

      document.addEventListener('click', handleClick);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClick);
      };
    }
    const initialCategory = CATEGORIES.find(category => category.name === 'HEAD');
    if (initialCategory) {
      selectCategory(initialCategory); // 초기 렌더링 시 'HEAD' 카테고리 로드
    }
  }, [overlayVisible]);

  // 표정
  let isDrawingExpression = false;

  const getCanvasCoords = (e) => {
    const canvas = expressionCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
  
    // devicePixelRatio를 사용하여 좌표 보정
    const scaleX = canvas.width / rect.width;    // 수평 스케일링 비율
    const scaleY = canvas.height / rect.height;  // 수직 스케일링 비율
  
    // 터치 이벤트일 경우 터치 위치에서 좌표를 얻음, 아니면 마우스 좌표
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
    return {
      x: (clientX - rect.left) * scaleX,  // 스케일링 비율 적용
      y: (clientY - rect.top) * scaleY    // 스케일링 비율 적용
    };
  };
  

  const startExpressionDrawing = (e) => {
    e.preventDefault(); // 기본 터치 동작 방지
    isDrawingExpression = true;
    const coords = getCanvasCoords(e);
    drawExpressionAt(coords.x, coords.y); // 시작할 때 바로 첫 점을 그림
  };

  const drawExpression = (e) => {
    e.preventDefault(); // 기본 터치 동작 방지
    if (!isDrawingExpression) return;
  
    const coords = getCanvasCoords(e);
    drawExpressionAt(coords.x, coords.y);
  };
  
  const finishExpressionDrawing = () => {
    isDrawingExpression = false;
    const ctx = expressionCanvasRef.current.getContext('2d');
    ctx.beginPath(); // 새로운 경로를 시작
  };
  
  const drawExpressionAt = (x, y) => {
    const ctx = expressionCanvasRef.current.getContext('2d');
    ctx.lineCap = 'round';
  
    if (expressionIsErasing) {
      // 지우개 모드일 때는 선택된 색상으로 그리고 굵기는 20
      ctx.lineWidth = 30;
      ctx.strokeStyle = selectedFaceColor;
    } else {
        // 그 외의 경우 흰색으로 그리고 굵기는 5
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#111111'; // 검은색으로 그리기

    }
  
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const applyExpressionTextureToModel = () => {
    const canvas = expressionCanvasRef.current;
    const context = canvas.getContext('2d');
  
    // 캔버스를 텍스처로 변환
    const texture = new THREE.CanvasTexture(canvas);
  
    // 텍스처 설정
    texture.flipY = false;  // Y축 반전 방지
    texture.needsUpdate = true;  // 텍스처 갱신 필요
    texture.minFilter = THREE.LinearFilter;  // 텍스처 확대 시 선명하게 처리
    texture.magFilter = THREE.NearestFilter;  // 텍스처 확대 시 블러링 방지
    texture.format = THREE.RGBAFormat;  // 알파 채널 사용
    texture.premultipliedAlpha = false;  // 프리멀티플라이드 알파 비활성화
    texture.colorSpace = THREE.SRGBColorSpace;  // 색 공간을 sRGB로 설정
    texture.generateMipmaps = false;  // Mipmap 비활성화
  
    // 모델에 텍스처 적용하는 로직
    modelsRef.current.forEach(({ model }) => {
      model.traverse((child) => {
        if (child.name === 'head_1') {  // head_1에 텍스처 적용
          const mesh = child;
          if (mesh) {
  
            // 원래 컬러 적용
            const originalColor = new THREE.Color(selectedFaceColor);
  
            // 새로운 머티리얼 생성 및 적용
            mesh.material = new THREE.MeshStandardMaterial({
              color: originalColor.convertSRGBToLinear,  // 얼굴 전체를 originalColor로 채움
              map: texture,  // 텍스처를 적용
              opacity: 1.0,  // 불투명하게 설정
              depthWrite: true,  // 깊이 쓰기 활성화
              depthTest: true,  // 깊이 테스트 활성화 (깊이 정보가 정확히 적용되도록)
              transparent: true,  // 투명도 활성화
            });
  
            // renderOrder를 높게 설정하여 우선적으로 렌더링
            mesh.renderOrder = 10;  // 소품보다 우선적으로 렌더링되게 함
  
            mesh.material.needsUpdate = true;
          }
        }
      });
    });
  };
  
  
  
  
useEffect(() => {
  const canvas = expressionCanvasRef.current;

  if (canvas) {
    clearCanvasWithColor(selectedFaceColor);  // 기본 흰색 배경 설정
    
    // 터치 이벤트 리스너에 passive: false 옵션을 추가
    canvas.addEventListener('touchstart', startExpressionDrawing, { passive: false });
    canvas.addEventListener('touchmove', drawExpression, { passive: false });
    canvas.addEventListener('touchend', finishExpressionDrawing, { passive: false });

    // 컴포넌트 언마운트 시 이벤트 리스너를 제거
    return () => {
      canvas.removeEventListener('touchstart', startExpressionDrawing);
      canvas.removeEventListener('touchmove', drawExpression);
      canvas.removeEventListener('touchend', finishExpressionDrawing);
    };
  }
}, []);

const clearExpressionCanvas = useCallback(() => {
  const canvas = expressionCanvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = selectedFaceColor; // 흰색으로 설정
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 캔버스 전체를 흰색으로 채움
  }
}, []);

  useEffect(() => {
    if (selectedCategory === 'EXPRESSION') {
      clearCanvasWithColor(selectedFaceColor);
    }
  }, [selectedCategory, clearExpressionCanvas]);

  const handleCategorySelection = useCallback((category) => {
    setSelectedCategory(category.name);
    selectCategory(category);
  }, [selectCategory]);

  //바디 모델 금쪽이 해결
  const changeBaseModelColor = (colorHexString) => {
    const colorHex = parseInt(colorHexString.replace('#', ''), 16);
    
    modelsRef.current.forEach(({ model, categoryName }) => {
        // 'Base' 카테고리인 모델에만 색상을 변경하고 텍스처를 제거하도록 필터링
        if (categoryName === 'Base') {
            model.traverse((child) => {
                if (child.isMesh) {
                    // 텍스처 제거
                    if (child.material.map) {
                        child.material.map.dispose();  // 텍스처 메모리 해제
                        child.material.map = null;  // 텍스처 참조 제거
                    }
                    // 새 색상 설정
                    child.material.color.setHex(colorHex);
                    child.material.needsUpdate = true;
                }
            });
        }
    });
  
    // 씬을 다시 렌더링
    rendererRef.current.render(sceneRef.current, cameraRef.current);
};




  useEffect(() => {
    if (selectedCategory === 'EXPRESSION') {
      // 표정 그리기 모드일 때 카메라 위치와 줌을 조정
      cameraRef.current.position.set(0, 5.7, 3);  // 카메라 위치
      cameraRef.current.lookAt(new THREE.Vector3(0, 5.7, 3));  // 바라볼 좌표 설정
      cameraRef.current.zoom = 2.7;  // 줌인 (값이 클수록 더 가까이 보임)
      cameraRef.current.updateProjectionMatrix();  // 카메라 매트릭스 업데이트
    } else if (selectedCategory === 'HEAD') {
      // 머리 고르기 모드일 때 카메라 위치와 줌을 조정
      cameraRef.current.position.set(0, 5.6, 3);  // 카메라 위치
      cameraRef.current.lookAt(new THREE.Vector3(0, 5.6, 3));  // 바라볼 좌표 설정
      cameraRef.current.zoom = 2.2;  // 적당히 줌인
      cameraRef.current.updateProjectionMatrix();
    } else if (selectedCategory === 'SHOES') {
      // 머리 고르기 모드일 때 카메라 위치와 줌을 조정
      cameraRef.current.position.set(0, 0.7, 3);  // 카메라 위치
      cameraRef.current.lookAt(new THREE.Vector3(0, 0.7, 3));  // 바라볼 좌표 설정
      cameraRef.current.zoom = 1.6;  // 적당히 줌인
      cameraRef.current.updateProjectionMatrix();
    } else {
      // 다른 카테고리로 돌아갈 때 카메라 위치와 줌을 원래대로 되돌림
      cameraRef.current.position.set(0, 3.15, 3);  // 카메라 위치
      cameraRef.current.lookAt(new THREE.Vector3(0, 3.15, 3));  // 바라볼 좌표 설정
      cameraRef.current.zoom = 0.65;  // 기본 줌
      cameraRef.current.updateProjectionMatrix();
    }
  }, [selectedCategory]);
  

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {

        // 상태에 따른 controls의 최소 높이 계산 (기본값을 낮춤)
        let controlsHeight = 370; // 기본 최소 높이로 수정
        if (selectedCategory === 'HEAD') {
          controlsHeight = 430; // HEAD 상태일 때
        } else if (selectedCategory === 'EXPRESSION') {
          controlsHeight = 460; // EXPRESSION 상태일 때
        }

        let newHeight = isFixedSize? 780-controlsHeight : window.innerHeight - controlsHeight;


        rendererRef.current.setSize(window.innerWidth, newHeight);
  
        // 캔버스 크기 설정
        canvasRef.current.style.width = isFixedSize? '390px' : window.innerWidth;
        canvasRef.current.style.height = `${newHeight}px`;
        canvasRef.current.style.top = '58px';
        canvasRef.current.style.left = '0';
        // 카메라 비율 업데이트
        const aspect = (canvasRef.current.clientWidth) / (newHeight);
        const frustumSize = 5; // 카메라 시야 크기, 필요에 따라 조정
        cameraRef.current.left = (-frustumSize * aspect) / 2;
        cameraRef.current.right = (frustumSize * aspect) / 2;
        cameraRef.current.top = frustumSize / 2;
        cameraRef.current.bottom = -frustumSize / 2;
        cameraRef.current.aspect =  aspect;
        
        cameraRef.current.updateProjectionMatrix();

        const controls = document.querySelector('.controls');
        controls.style.height = `${controlsHeight}px`;
      }
    };
  
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행 시 크기 맞추기
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedCategory]);

  useEffect(() => {
    // 초대장이 보일 때 강제로 리사이즈 이벤트 발생
    if (isInvitationVisible) {
      window.dispatchEvent(new Event('resize'));
    }
  }, [isInvitationVisible]);

  useEffect(() => {
    const img = document.querySelector('.invitation-container #invitation-background');
    if (img) {
      img.onload = () => {
        window.dispatchEvent(new Event('resize'));
      };
    }
  }, [isInvitationVisible]);

    // iOS에서 스크롤 문제 해결을 위해 뷰포트 높이를 동적으로 설정하는 함수
    const setViewportHeight = () => {
      const height = window.innerHeight; // 실제 높이 값을 가져옴
      document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    };
  
    useEffect(() => {
      // 초기 로드 시 뷰포트 높이 설정
      setViewportHeight();
  
      // 창 크기 변경 시 뷰포트 높이 다시 설정
      window.addEventListener('resize', setViewportHeight);
  
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.removeEventListener('resize', setViewportHeight);
      };
    }, []);

    

    //스크롤 무시
    useEffect(() => {
      const allowScrollOnGrid = (event) => {
        const gridElement = document.querySelector('.controls');
        if (gridElement && gridElement.contains(event.target) && !event.target.contains( document.querySelector('canvas'))) {
          return; // 터치가 그리드 내부에서 발생하면 기본 스크롤 허용
        }
        event.preventDefault(); // 그 외의 경우 스크롤 막기
      };
    
      // touchmove 및 scroll 이벤트에 대한 핸들러 추가
      window.addEventListener('touchmove', allowScrollOnGrid, { passive: false });
      window.addEventListener('scroll', allowScrollOnGrid, { passive: false });
    
      return () => {
        window.removeEventListener('touchmove', allowScrollOnGrid);
        window.removeEventListener('scroll', allowScrollOnGrid);
      };
    }, []);
  
    
  return (

    
  <div
    id="oversize"
    style={{     
      overflow: 'hidden',
    }}
    
  >

    

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

  <div
    style={{
      overflow: "auto",
      backgroundImage: `url('/static/stockimages/background_paper.webp')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height:'100%',
      width: "100%",
      overflow: "hidden",
      // minHeight: '780px'
    }}
    id="whatareYou"
  >

  {/* 처음 초대장 */}
  {overlayVisible && (
    <div id="overlay" className="overlay" style={{
      pointerEvents: 'none',
    }}>
      <div className="overlay-content">
        <img
          src="../static/stockimages/maker_invitation.png"
          alt="Invitation"
        />
      </div>
    </div>
  )}

  <Header 
    id="ccheader"
    title="춤 복장 선택하기" 
    onMenuClick={handleMenuClick} 
    style={{
      display: isInvitationVisible ? 'none !important' : 'block', // 초대장이 보이면 none
      zIndex: 100,
      backgroundColor: 'green',
      height: '58px',
      minHeight: '58px',
    }}
  />

  {/* 녹화 중일 때 보여줄 "녹화중입니다" 이미지 */}
  {isRecording && (
    <div id="splash-screen" className="splash-screen" style={{backgroundColor:'#F8F6F1'}}>
      <img
        src="/static/stockimages/making.webp"
        alt="Splash"
        style={{
          position: "Fixed",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: "0",
          left: "0",
          zIndex: "999999999",
        }}
      />

      <img src="/static/stockimages/loading-circle.gif" alt="Logo" style={{
        position: "Fixed",
        top: "55%",
        left: "50%",
        width: '40px',
        height: '40px',
        transform: "translate(-50%, -50%)",
        zIndex: "999999999",
      }}/>

    </div>
  )}

    {/* 전체 컨테이너 */}
    <div
      id="container"
      style={{
        position: "relative",
        top: "58px",
        width: "100%",
        height: "calc(100% - 58px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        overflow: "hidden",
        // backgroundColor: "salmon",

        backgroundImage: `url('/static/stockimages/background_paper.webp')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      
        zIndex: "10",
      }}
    >
      <canvas id="ourcanvas" ref={canvasRef} style={{
        backgroundImage: `url('/static/stockimages/background_paper.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        marginTop: '-1px'
      }}/>
      {/* <canvas ref={hiddenCanvasRef} style={{ display: "none" }} /> */}

      <div className="controls" style={{
        left: 0,
      }}>
        <div id="botbottoms" style={{ display: "flex", flexDirection: "Column" }}>
          <div className="category-selection">
            {CATEGORIES.map((category, index) => (
              <button
                key={category.name}
                onClick={() => handleCategorySelection(category)} // Handles category selection on click
                className={`color-button ${
                  selectedCategory === category.name ? "selected" : ""
                }`}
                // Disable button based on conditions
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0",
                  width: "44px",
                  height: "44px",
                  backgroundColor: "transparent", // Ensure background is transparent
                  cursor: "pointer",
                  position: "relative",
                  boxSizing: "border-box",
                  border: "none", // Remove border from button
                  outline: "none", // Removes pink outline on click
                  WebkitTapHighlightColor: "transparent", /* 클릭 시 하이라이트 제거 */
                  userSelect: "none", // 텍스트 선택 방지
                }}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  overflow="visible"
                >
                  <defs>
                    {/* Adjust drop shadow filter to prevent clipping */}
                    <filter
                      id="drop-shadow-path-filter"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                      filterUnits="userSpaceOnUse"
                    >
                      <feDropShadow
                        dx="0"
                        dy="4"
                        stdDeviation="4"
                        floodColor="rgba(0, 0, 0, 0.25)"
                      />
                    </filter>
                  </defs>

                  {/* Apply shadow directly to the path and scale it to fit the 44x44 size */}
                  <path
                    d="M31.732 24.906C31.3723 25.5071 29.9437 27.7978 27.161 29.7447C22.4124 33.067 17.3387 32.7323 15.527 32.6887C9.3294 32.5388 4.97102 28.6501 3.13725 25.9566C1.24676 23.18 -2.05667 18.3511 2.45184 9.31604C6.10884 1.98759 10.1052 1.45598 13.6287 0.508273C20.5745 -1.35954 28.416 1.9484 32.7435 9.97204C35.264 14.6458 34.2974 20.6183 31.732 24.9057V24.906Z"
                    fill={
                      selectedCategory === category.name
                        ? "#e9a7a7"
                        : "#bab9b3"
                    } // Fill color based on selection
                    filter="url(#drop-shadow-path-filter)" // Apply shadow directly to the path
                    stroke="#E6E1DC" // Border color following the path
                    strokeWidth="1" // Border thickness
                    transform="scale(1.25 1.25)" // Scale the path to fit within 44x44
                  />
                </svg>

                {/* Text label inside the button */}
                <span
                  style={{
                    position: "absolute",
                    top: "47%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#f8f6f1",
                    fontSize: "12px",
                  }}
                >
                  {CATEGORY_NAME_MAP[category.name]} {/* Display category name */}
                </span>
              </button>
            ))}
          </div>

          <div className="create-character-container">
          <button className="create-character" onClick={() => startRecording(sceneRef.current, cameraRef.current, rendererRef.current)}>
            캐릭터 생성하기
          </button>
          </div>
        </div>

        {/* Asset Grid (표정 카테고리를 선택했을 때와 그렇지 않을 때) */}
        <div
          className={`asset-grid ${
            selectedCategory === "EXPRESSION" ? "expanded" : ""
          }`}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedCategory === "EXPRESSION" ? (
            <>
              {/* 버튼들을 가로로 배치하는 컨테이너 */}
              <div id="expressionTools">
                {/* 색상 선택 버튼 */}
                <div
                  className="expression-color-selection"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center", // 'alignItens'를 'alignItems'로 수정
                    width: "75%",
                    height: "100%",
                  }}
                >
                  {GRAYSCALE_COLORS.map((colorObj, index) => (
                    <button
                      key={colorObj.color}
                      onClick={() => {
                        setSelectedFaceColor(colorObj.color);
                        clearCanvasWithColor(colorObj.color);
                        changeBaseModelColor(colorObj.color);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "none",
                        padding: "0",
                        width: "32px",
                        height: "32px",
                        position: "relative",
                        boxSizing: "border-box",
                        background: "none",
                        filter:
                          "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.5))",
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 35 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ position: "absolute", top: 0, left: 0 }}
                      >
                        <mask
                          id={`mask-${index}`}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="35"
                          height="33"
                        >
                          <path
                            d="M31.732 24.906C31.3723 25.5071 29.9437 27.7978 27.161 29.7447C22.4124 33.067 17.3387 32.7323 15.527 32.6887C9.3294 32.5388 4.97102 28.6501 3.13725 25.9566C1.24676 23.18 -2.05667 18.3511 2.45184 9.31604C6.10884 1.98759 10.1052 1.45598 13.6287 0.508273C20.5745 -1.35954 28.416 1.9484 32.7435 9.97204C35.264 14.6458 34.2974 20.6183 31.732 24.9057V24.906Z"
                            fill="white"
                          />
                        </mask>
                        <g mask={`url(#mask-${index})`}>
                          <rect
                            width="35"
                            height="33"
                            fill={colorObj.bigColor}
                          />
                        </g>
                      </svg>
                      <svg
                        width="23"
                        height="23"
                        viewBox="0 0 28 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-58%, -50%)",
                        }}
                      >
                        <mask
                          id={`small-mask-${index}`}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="28"
                          height="23"
                        >
                          <path
                            d="M8.99724 2.29525C9.37989 2.01516 10.8738 0.96221 13.1275 0.476599C16.9729 -0.352017 20.0668 1.17971 21.1914 1.67968C25.0386 3.38958 26.7561 6.94617 27.2027 9.10064C27.663 11.3215 28.4736 15.1879 23.2868 19.6336C19.0796 23.2398 16.435 22.5281 13.978 22.1984C9.13463 21.5487 5.08135 17.4449 4.46305 11.3235C4.10306 7.75802 6.26882 4.29377 8.99724 2.29525Z"
                            fill="white"
                          />
                        </mask>
                        <g mask={`url(#small-mask-${index})`}>
                          <rect
                            width="28"
                            height="23"
                            fill={colorObj.smallColor}
                          />
                        </g>
                      </svg>

                      {selectedFaceColor === colorObj.color && (
                        <img
                          src="/static/stockimages/check.webp"
                          alt="check"
                          style={{
                            position: "absolute",
                            width: "45%",
                            height: "45%",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* 연필/지우개 토글 버튼 */}
                <div
                  className="expression-tool-selection"
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    paddingLeft: "10px",
                    width: "25%",
                  }}
                >
                  <button
                    onClick={() =>
                      setExpressionIsErasing(!expressionIsErasing)
                    }
                    style={{
                      width: "32px", // 너비 32px
                      height: "32px", // 높이 32px
                      borderRadius: "50%", // 둥근 원 모양
                      backgroundColor: "#000", // 배경색 검정
                      backgroundImage: `url(${
                        expressionIsErasing
                          ? "static/stockimages/eraser.webp"
                          : "static/stockimages/pencil.webp"
                      })`, // 조건에 따라 배경 이미지 변경
                      backgroundPosition: "center",
                      backgroundSize: "70%",
                      backgroundRepeat: "no-repeat",
                      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.45)", // 그림자 효과
                      border: "none", // 테두리 없음
                      cursor: "pointer", // 마우스 커서 변경
                    }}
                  />

                  {/* 적용 버튼 */}
                  <div
                    className="apply-button"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={applyExpressionTextureToModel}
                      style={{
                        width: "32px", // 너비 32px
                        height: "32px", // 높이 32px
                        borderRadius: "50%", // 둥근 원 모양
                        backgroundColor: "#2B74E2", // 배경색 검정
                        backgroundImage:
                          "url(static/stockimages/apply.png)", // apply.webp 이미지 사용
                        backgroundPosition: "center",
                        backgroundSize: "75%", // 이미지 크기를 50%로 설정
                        backgroundRepeat: "no-repeat",
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.45)", // 그림자 효과
                        border: "none", // 테두리 없음
                        cursor: "pointer", // 마우스 커서 변경
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 얼굴그리기 */}
              <div
                id="facedrawingContainer"
                style={{
                  position: "relative",
                  width: "100%", // 너비를 고정된 크기로 설정
                  aspectRatio: "800 / 586", // 가로 세로 비율을 이미지에 맞춤
                  overflow: "hidden", // 초과된 부분을 숨기기
                  background: selectedFaceColor, // 배경을 투명하게 설정
                  height: '238px',
                  // display: "flex",
                  // justifyContent: "center",
                  // alignItems: "center",
                }}
              >
                {/* 배경 이미지 */}
                <img
                  src="static/stockimages/facebackground.png"
                  alt="Face Background"
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "10%",
                    width: "100%", // 고정된 900px 너비
                    height: "80%", // 고정된 900px 높이
                    objectFit: "contain", // 이미지 크기를 커버로 설정
                    pointerEvents: "none", // 이미지에 클릭이 되지 않게 설정
                    zIndex: 4,
                  }}
                />

                {/* 표정 그리기용 캔버스 */}
                <canvas
                  ref={expressionCanvasRef}
                  width={900}  // 실제 캔버스의 고정된 해상도
                  height={380} // 실제 캔버스의 고정된 해상도
                  style={{
                    position: "relative",
                    background: selectedFaceColor, // 배경을 투명하게 설정clipPath: "inset(165px 550px 30px 80px)", // (80, 165)에서 (350, 350) 영역만 보이게 함
                    clipPath: "inset(165px 510px 30px 30px)", // (80, 165)에서 (350, 350) 영역만 보이게 함
                    // transform: "translate(0, 0)", // X축으로 -500px 이동하여 오른쪽을 보이게 함
                    zIndex: 2, // 캔버스가 이미지 위에 렌더링되도록 설정
                    // overflow: "hidden",
                    // transform: "scale(2)",
                    left: "calc(50% - 240px)",
                    top: "calc(50% - 230px)",
                    border: "10px solid red",
                  }}
                  // 마우스 이벤트
                  onMouseDown={startExpressionDrawing}
                  onMouseMove={drawExpression}
                  onMouseUp={finishExpressionDrawing}
                  // 터치 이벤트
                  onTouchStart={startExpressionDrawing}
                  onTouchMove={drawExpression}
                  onTouchEnd={finishExpressionDrawing}
                />
              </div>
            </>
          ) : (
<>
{activeCategory &&
  activeCategory.assets.map((asset, index) => {
    let isSelected = false;

    if (activeCategory.name === "ACCESSORY") {
      // Check if the accessory is selected in its specific group
      if (HATS.includes(index)) {
        isSelected = selectedAccessories.hat === index;
      } else if (GLASSES.includes(index)) {
        isSelected = selectedAccessories.glasses === index;
      } else if (OTHER_ACCESSORIES.includes(index)) {
        isSelected = selectedAccessories.other === index;
      }
    } else {
      // For non-accessory categories, use selectedIndices
      isSelected = selectedIndices[activeCategory.name] === index;
    }

    return (


      
      <div
        key={index}
        id="makemescrollhere"
        style={{
          overflowY: 'scroll !important',
          WebkitOverflowScrolling: 'touch !important',
        }}
      >

        <div
          className="pictures"
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "18px",
            backgroundColor: isSelected ? "#E9A7A7" : "#EDECE7",
          }}
          onClick={() => {
            const modelPath = activeCategory.useColor
              ? `/static/models/${asset}_${selectedColor || "Black"}.glb`
              : `/static/models/${asset}.glb`;
            handleAssetSelection(activeCategory.name, index, modelPath);
          }}
        >
          <img
            src={`/static/assetImages/${activeCategory.useColor ? `${asset}_${selectedColor}` : asset}.webp`}
            alt={`${asset}`}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "18px",
              boxSizing: "content-box",
            }}
          />
        </div>
      </div>
    );
  })}

</>

          )}
        </div>

        {activeCategory && activeCategory.useColor && (
          <div className="color-selection">
            {COLORS.map((color, index) => (
              <button
                key={color.name}
                onClick={() => {
                  selectColor(activeCategory.name, color.name);
                  setSelectedColor(color.name);
                }}
                className="color-button"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "none",
                  padding: "0",
                  width: "32px",
                  height: "32px",
                  position: "relative",
                  boxSizing: "border-box",
                  background: "none",
                  filter:
                    "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 35 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <mask
                    id={`mask-${index}`}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="35"
                    height="33"
                  >
                    <path
                      d="M31.732 24.906C31.3723 25.5071 29.9437 27.7978 27.161 29.7447C22.4124 33.067 17.3387 32.7323 15.527 32.6887C9.3294 32.5388 4.97102 28.6501 3.13725 25.9566C1.24676 23.18 -2.05667 18.3511 2.45184 9.31604C6.10884 1.98759 10.1052 1.45598 13.6287 0.508273C20.5745 -1.35954 28.416 1.9484 32.7435 9.97204C35.264 14.6458 34.2974 20.6183 31.732 24.9057V24.906Z"
                      fill="white"
                    />
                  </mask>
                  <g mask={`url(#mask-${index})`}>
                    <rect width="35" height="33" fill={color.bigCircle} />
                  </g>
                </svg>
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 28 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-58%, -50%)",
                  }}
                >
                  <mask
                    id={`small-mask-${index}`}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="28"
                    height="23"
                  >
                    <path
                      d="M8.99724 2.29525C9.37989 2.01516 10.8738 0.96221 13.1275 0.476599C16.9729 -0.352017 20.0668 1.17971 21.1914 1.67968C25.0386 3.38958 26.7561 6.94617 27.2027 9.10064C27.663 11.3215 28.4736 15.1879 23.2868 19.6336C19.0796 23.2398 16.435 22.5281 13.978 22.1984C9.13463 21.5487 5.08135 17.4449 4.46305 11.3235C4.10306 7.75802 6.26882 4.29377 8.99724 2.29525Z"
                      fill="white"
                    />
                  </mask>
                  <g mask={`url(#small-mask-${index})`}>
                    <rect width="28" height="23" fill={color.smallCircle} />
                  </g>
                </svg>

                {selectedColor === color.name && (
                  <img
                    src="/static/stockimages/check.webp"
                    alt="check"
                    style={{
                      position: "absolute",
                      width: "45%",
                      height: "auto",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

{activeCategory && activeCategory.name === "ACCESSORY" && (
  <div style={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems:"center",
    padding: "10px"

  }}>
    <img 
      src="/static/stockimages/accessoryinfo.png" 
      alt="Accessory Info" 
      style={{ width: "50%", maxWidth: "400px" }} 
    />
  </div>
)}

      </div>
    </div>
  </div>
</div>
        );
      };

export default CreateCharacter;