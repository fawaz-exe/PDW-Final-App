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
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
        <div className="button-container">
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={handleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
        </div>
        
        <div className="lyrics-box">
        <h2>Detected Objects:</h2>
            <ul>
            { detectedObjects.map((obj, index) => (
                <li key={index}>{obj.class}</li>
             ))}
            </ul>
        </div>

        
      </header>
    </div>
 );
}

export default App;
