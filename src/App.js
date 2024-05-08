// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import { Button, IconButton, Box } from '@mui/material';
import { VolumeUp, VolumeOff, PlayArrow, Pause, Fullscreen } from '@mui/icons-material';

function App() {
 const webcamRef = useRef(null);
 const canvasRef = useRef(null);
 const [isPlaying, setIsPlaying] = useState(false);
 const [isMuted, setIsMuted] = useState(false);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [detectedObjects, setDetectedObjects] = useState([]);
 let detectionInterval;

 // Main function
 const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Handpose model loaded.");
    // Start the detection loop if isPlaying is true
    if (isPlaying) {
      detectionInterval = setInterval(() => {
        detect(net);
      }, 10);
    }
 };

 const handleFullscreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle();
    setIsFullscreen(!isFullscreen);
  }
};
//  useEffect(() => {
//     const video = webcamRef.current.video;
//     video.onloadeddata = () => {
//        // Video is ready, you can now play or pause it
//        setIsVideoReady(true);
//     };
//    }, []);
   

   const detect = async (net) => {
    if (
       typeof webcamRef.current !== "undefined" &&
       webcamRef.current !== null &&
       webcamRef.current.video.readyState === 4
    ) {
       const video = webcamRef.current.video;
       const videoWidth = webcamRef.current.video.videoWidth;
       const videoHeight = webcamRef.current.video.videoHeight;
   
       webcamRef.current.video.width = videoWidth;
       webcamRef.current.video.height = videoHeight;
   
       canvasRef.current.width = videoWidth;
       canvasRef.current.height = videoHeight;
   
       const obj = await net.detect(video);
       setDetectedObjects(obj); // Update the detected objects state
   
       const ctx = canvasRef.current.getContext("2d");
       drawRect(obj, ctx);
    }
   };

 const handlePlayPause = () => {
    if (webcamRef.current.video.paused) {
       // If the video is paused, play it
       webcamRef.current.video.play();
       setIsPlaying(true);
       runCoco()
    } else {
       // If the video is playing, pause it
       webcamRef.current.video.pause();
       setIsPlaying(false);
    }
   };
   

 const handleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      // Unmute the webcam
      webcamRef.current.video.muted = false;
    } else {
      // Mute the webcam
      webcamRef.current.video.muted = true;
    }
 };

 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <ReactPlayer
      url='your-video-url.mp4'
      playing={isPlaying}
      muted={isMuted}
      width='100%'
      height='100%'
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
    <Box sx={{ position: 'absolute', bottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <IconButton onClick={handlePlayPause}>
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>
      <IconButton onClick={handleMute}>
        {isMuted ? <VolumeOff /> : <VolumeUp />}
      </IconButton>
      <IconButton onClick={handleFullscreen}>
        <Fullscreen />
      </IconButton>
    </Box>
  </Box>
);

}

export default App;
