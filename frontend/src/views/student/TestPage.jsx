import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, CircularProgress } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import MultipleChoiceQuestion from './Components/MultipleChoiceQuestion';
import NumberOfQuestions from './Components/NumberOfQuestions';
import WebCam from './Components/WebCam';
import { useGetExamsQuery, useGetQuestionsQuery } from '../../slices/examApiSlice';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useCheatingLog } from 'src/context/CheatingLogContext';

/* ✅ ADDED IMPORTS (ONLY THESE) */
import useBackgroundVoiceDetection from './Components/useBackgroundVoiceDetection';
import useBrowserLock from './Components/useBrowserLock';


const TestPage = () => {
  const { examId, testId } = useParams();

  /* ✅ ADDED STATES (NO EXISTING STATE TOUCHED) */
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamTerminated, setIsExamTerminated] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);
  const [examDurationInSeconds, setExamDurationInSeconds] = useState(0);
  const { data: userExamdata, isLoading: isExamsLoading } = useGetExamsQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const { cheatingLog, updateCheatingLog, resetCheatingLog } = useCheatingLog();
  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMcqCompleted, setIsMcqCompleted] = useState(false);

  /* =====================================================
     ✅ CENTRAL VIOLATION HANDLER (ADDED)
     ===================================================== */
  const checkAndUpdateViolation = (type, value, message) => {
    console.log('🚨 Violation:', type, message);
    updateCheatingLog(type, value);
  };

  /* =====================================================
     ✅ ACTIVATE PROCTORING HOOKS (ADDED)
     ===================================================== */
  useBackgroundVoiceDetection({
    isExamStarted,
    isExamTerminated,
    checkAndUpdateViolation
  });

  useBrowserLock({
    isExamStarted,
    isExamTerminated,
    checkAndUpdateViolation
  });

  useEffect(() => {
    if (userExamdata) {
      const exam = userExamdata.find((exam) => exam.examId === examId);
      if (exam) {
        setSelectedExam(exam);
        setExamDurationInSeconds(exam.duration);
        console.log('Exam duration (minutes):', exam.duration);
      }
    }
  }, [userExamdata, examId]);

  const [questions, setQuestions] = useState([]);
  const { data, isLoading } = useGetQuestionsQuery(examId);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setQuestions(data);
    }
  }, [data]);

  const handleMcqCompletion = () => {
    setIsMcqCompleted(true);
    resetCheatingLog(examId);
    navigate(`/exam/${examId}/codedetails`);
  };

  const handleTestSubmission = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const examData = userExamdata?.find(e => e.examId === examId);
      if (!examData) return;

      const updatedLog = {
        ...cheatingLog,
        username: userInfo.name,
        email: userInfo.email,
        examId: examData._id,
        examUUID: examId,
      };

      await saveCheatingLogMutation(updatedLog).unwrap();
      toast.success('Test submitted successfully!');
      navigate('/Success');
    } catch (error) {
      toast.error('Failed to save test logs.');
    } finally {
      setIsSubmitting(false);
      setIsExamTerminated(true); // ✅ STOP ALL PROCTORING
    }
  };

  const saveUserTestScore = () => {
    setScore(score + 1);
  };

  if (isExamsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="TestPage" description="This is TestPage">
      <Box pt="3rem">
        {/* ✅ START EXAM BUTTON (ADDED – REQUIRED FOR FULLSCREEN) */}
        {!isExamStarted && (
          <Box textAlign="center" mb={2}>
            <button
              onClick={async () => {
                await document.documentElement.requestFullscreen();
                setIsExamStarted(true);
              }}
            >
              Start Exam
            </button>
          </Box>
        )}

        {isExamStarted && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7} lg={7}>
              <BlankCard>
                <Box minHeight="400px" display="flex" justifyContent="center">
                  {isLoading ? (
                    <CircularProgress />
                  ) : (
                    <MultipleChoiceQuestion
                      submitTest={isMcqCompleted ? handleTestSubmission : handleMcqCompletion}
                      questions={data}
                      saveUserTestScore={saveUserTestScore}
                    />
                  )}
                </Box>
              </BlankCard>
            </Grid>

            <Grid item xs={12} md={5} lg={5}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <BlankCard>
                    <NumberOfQuestions
                      questionLength={questions.length}
                      submitTest={isMcqCompleted ? handleTestSubmission : handleMcqCompletion}
                      examDurationInSeconds={examDurationInSeconds}
                    />
                  </BlankCard>
                </Grid>

                <Grid item xs={12}>
                  <BlankCard>
                    <WebCam
                      cheatingLog={cheatingLog}
                      updateCheatingLog={updateCheatingLog}
                    />
                  </BlankCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>
    </PageContainer>
  );
};

export default TestPage;
