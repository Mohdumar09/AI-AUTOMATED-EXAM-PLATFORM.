import { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const YAMNET_MODEL_URL =
  'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1';

const SAMPLE_RATE = 16000;
const FRAME_SIZE = 15600; // required by YAMNet
const SPEECH_SCORE_THRESHOLD = 0.6;
const SPEECH_DURATION_MS = 1500;

export default function useBackgroundVoiceDetection({
  checkAndUpdateViolation,
  isExamStarted,
  isExamTerminated
}) {
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);

  const bufferRef = useRef([]);
  const speechStartRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!isExamStarted || isExamTerminated) return;

    cancelledRef.current = false;

    const init = async () => {
      try {
        // ✅ Ensure TF is ready
        await tf.ready();

        console.log('🔄 Loading YAMNet model...');
        modelRef.current = await tf.loadGraphModel(
          YAMNET_MODEL_URL,
          { fromTFHub: true }
        );
        console.log('✅ YAMNet voice model loaded');

        // 🎤 Mic access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
        audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = async (event) => {
          if (
            cancelledRef.current ||
            !modelRef.current ||
            isExamTerminated
          ) return;

          const input = event.inputBuffer.getChannelData(0);
          bufferRef.current.push(...input);

          if (bufferRef.current.length < FRAME_SIZE) return;

          const audioSlice = bufferRef.current.slice(0, FRAME_SIZE);
          bufferRef.current = bufferRef.current.slice(FRAME_SIZE);

          // ✅ FIX 1: YAMNet expects 1D tensor (NO reshape)
          const waveform = tf.tensor1d(audioSlice);

          const outputs = modelRef.current.predict(waveform);
          const scores = await outputs[0].data();

          tf.dispose([waveform, ...outputs]);

          const speechScore = Math.max(scores[0], scores[1]);

          if (speechScore > SPEECH_SCORE_THRESHOLD) {
            if (!speechStartRef.current) {
              speechStartRef.current = Date.now();
            }

            if (Date.now() - speechStartRef.current >= SPEECH_DURATION_MS) {
              checkAndUpdateViolation(
                'backgroundVoice',
                true,
                'Background voice detected'
              );
              speechStartRef.current = null;
            }
          } else {
            speechStartRef.current = null;
          }
        };
      } catch (err) {
        console.error('❌ Voice detection init failed:', err);
      }
    };

    init();

    // ================= CLEANUP =================
    return () => {
      cancelledRef.current = true;

      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      bufferRef.current = [];
      speechStartRef.current = null;
    };
  }, [isExamStarted, isExamTerminated, checkAndUpdateViolation]);
}
