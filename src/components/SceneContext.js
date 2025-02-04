import React, { createContext, useContext, useState } from 'react';

const SceneContext = createContext();

export const SceneProvider = ({ children }) => {
  const [sceneData, setSceneData] = useState({
    scene: null,
    camera: null,
    renderer: null,
    mixer: [],
  });

  const updateSceneData = (newSceneData) => {
    setSceneData(newSceneData);

    // console.log('Scene:', newSceneData.scene);
    // console.log('Camera:',  newSceneData.camera);
    // console.log('Renderer:',  newSceneData.renderer);
    console.log('Mixer Added:',  newSceneData.mixer);

  };

  return (
    <SceneContext.Provider value={{ sceneData, updateSceneData }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};
