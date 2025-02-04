import React, { createContext, useState, useContext } from 'react';

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videoFiles, setVideoFiles] = useState([]);

  const addVideoFile = (file) => {
    // console.log('Adding new video file:', file);  
    setVideoFiles(prevFiles => [...prevFiles, file]);
    // console.log('new Video files:', videoFiles);
  };

  return (
    <VideoContext.Provider value={{ videoFiles, addVideoFile }}>
      {children}
    </VideoContext.Provider>
  );
};

export const UseVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};