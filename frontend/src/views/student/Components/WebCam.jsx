import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as cocossd from '@tensorflow-models/coco-ssd';
import Webcam from 'react-webcam';
import { drawRect } from './utilities';
import { Box, Card } from '@mui/material';
import swal from 'sweetalert';
import useBackgroundVoiceDetection from './useBackgroundVoiceDetection';
import useBrowserLock from './useBrowserLock';
import * as faceMesh from '@mediapipe/face_mesh';

export default function Home({
  cheatingLog,
  updateCheatingLog,
  isExamStarted
}) {
  const navigate = useNavigate();

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const faceMeshRef = useRef(null);
  const gazeStartRef = useRef(null);
  const lastGazeViolationRef = useRef(0);
  const animationFrameRef = useRef(null);

  const [lastDetectionTime, setLastDetectionTime] = useState({});
  const [isExamTerminated, setIsExamTerminated] = useState(false);

  // ======================================================
  // CENTRAL COUNTERS
  // ======================================================
  const countsRef = useRef({
    noFaceCount: 0,
    multipleFaceCount: 0,
    cellPhoneCount: 0,
    prohibitedObjectCount: 0,
    backgroundVoiceCount: 0,
    gazeAwayCount: 0,

    tabSwitchCount: 0,
    windowBlurCount: 0,
    shortcutKeyCount: 0,
    fullscreenExitCount: 0
  });

  // ======================================================
  // SINGLE VIOLATION ENGINE
  // ======================================================
  const checkAndUpdateViolation = async (type, condition, message) => {
    const now = Date.now();
    if (isExamTerminated) return;

    if (condition && now - (lastDetectionTime[type] || 0) >= 5000) {
      setLastDetectionTime(prev => ({ ...prev, [type]: now }));
      countsRef.current[`${type}Count`]++;

      const totalViolations = Object.values(countsRef.current)
        .reduce((a, b) => a + b, 0);

      updateCheatingLog({
        ...cheatingLog,
        ...countsRef.current
      });

      if (totalViolations >= 5) {
        setIsExamTerminated(true);
        await swal({
          title: 'Exam Terminated',
          text: 'You reached 5 violations.',
          icon: 'error'
        });
        navigate('/');
        return;
      }

      swal(
        message,
        `Violation ${countsRef.current[`${type}Count`]} (Total ${totalViolations}/5)`,
        'warning'
      );
    }
  };

  // ======================================================
  // BACKGROUND VOICE + BROWSER LOCK
  // ======================================================
  useBackgroundVoiceDetection({
    checkAndUpdateViolation,
    isExamTerminated,
    isExamStarted
  });

  useBrowserLock({
    isExamStarted,
    isExamTerminated,
    checkAndUpdateViolation
  });

  // ======================================================
  // 👁️ EYE TRACKING INITIALIZATION
  // ======================================================
  useEffect(() => {
    faceMeshRef.current = new faceMesh.FaceMesh({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMeshRef.current.onResults(handleEyeResults);
    startEyeTrackingLoop();

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  // ======================================================
  // 👁️ EYE TRACKING LOGIC (STABLE + FAIR)
  // ======================================================
  const handleEyeResults = results => {
    if (!results.multiFaceLandmarks?.length) {
      gazeStartRef.current = null;
      return;
    }

    const lm = results.multiFaceLandmarks[0];

    const left = lm[33];
    const right = lm[133];

    const eyeWidth = Math.abs(right.x - left.x);
    if (eyeWidth === 0) return;

    const movementRatio = Math.abs(left.x - right.x) / eyeWidth;
    const now = Date.now();

    const SOFT_IGNORE = 0.55;
    const HARD_SUSPICIOUS = 0.75;

    if (movementRatio > HARD_SUSPICIOUS) {
      if (!gazeStartRef.current) gazeStartRef.current = now;

      if (
        now - gazeStartRef.current > 3000 &&       // must hold 3s
        now - lastGazeViolationRef.current > 10000 // 10s cooldown
      ) {
        lastGazeViolationRef.current = now;

        checkAndUpdateViolation(
          'gazeAway',
          true,
          'Sustained Eye Movement Detected'
        );
      }
    } else if (movementRatio < SOFT_IGNORE) {
      gazeStartRef.current = null;
    }
  };

  // ======================================================
  // 👁️ CONTINUOUS FACEMESH LOOP
  // ======================================================
  const startEyeTrackingLoop = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      await faceMeshRef.current.send({
        image: webcamRef.current.video
      });
    }
    animationFrameRef.current = requestAnimationFrame(startEyeTrackingLoop);
  };

  // ======================================================
  // 🎥 COCO-SSD OBJECT DETECTION (UNCHANGED)
  // ======================================================
  const runCoco = async () => {
    const net = await cocossd.load();
    setInterval(() => detect(net), 1000);
  };

  const detect = async net => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      canvasRef.current.width = vw;
      canvasRef.current.height = vh;

      const objects = await net.detect(video);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, vw, vh);
      drawRect(objects, ctx);

      let personCount = 0;
      let faceDetected = false;

      objects.forEach(obj => {
        if (obj.class === 'person') {
          personCount++;
          faceDetected = true;
        }

        if (obj.class === 'cell phone') {
          checkAndUpdateViolation('cellPhone', true, 'Cell Phone Detected');
        }

        if (obj.class === 'book' || obj.class === 'laptop') {
          checkAndUpdateViolation(
            'prohibitedObject',
            true,
            'Prohibited Object Detected'
          );
        }
      });

      if (personCount > 1) {
        checkAndUpdateViolation(
          'multipleFace',
          true,
          'Multiple Faces Detected'
        );
      }

      if (!faceDetected) {
        checkAndUpdateViolation('noFace', true, 'Face Not Visible');
      }
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  // ======================================================
  // UI
  // ======================================================
  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <Webcam
          ref={webcamRef}
          audio
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user'
          }}
          style={{ width: '100%', height: '100%' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10
          }}
        />
      </Card>
    </Box>
  );
}
