import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import axiosInstance from '../../axios';
import Webcam from '../student/Components/WebCam';
import {
  Button,
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice'; // Adjust the import path
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router';
import { useCheatingLog } from 'src/context/CheatingLogContext';

export default function Coder() {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [questionId, setQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const { examId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { cheatingLog, updateCheatingLog } = useCheatingLog();
  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();

  useEffect(() => {
    if (userInfo) {
      updateCheatingLog((prevLog) => ({
        ...prevLog,
        username: userInfo.name,
        email: userInfo.email,
      }));
    }
  }, [userInfo]);

  // Fetch coding question when component mounts
  useEffect(() => {
    const fetchCodingQuestion = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/coding/questions/exam/${examId}`, {
          withCredentials: true,
        });
        if (response.data.success && response.data.data) {
          setQuestionId(response.data.data._id);
          setQuestion(response.data.data);
          // Set initial code if there's a template or description
          if (response.data.data.description) {
            setCode(`// ${response.data.data.description}\n\n// Write your code here...`);
          }
        } else {
          toast.error('No coding question found for this exam. Please contact your teacher.');
        }
      } catch (error) {
        console.error('Error fetching coding question:', error);
        toast.error(error?.response?.data?.message || 'Failed to load coding question');
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      fetchCodingQuestion();
    }
  }, [examId]);

  const runCode = async () => {
    let apiUrl;
    switch (language) {
      case 'python':
        apiUrl = '/run-python';
        break;
      case 'java':
        apiUrl = '/run-java';
        break;
      case 'javascript':
        apiUrl = '/run-javascript';
        break;
      default:
        return;
    }

    try {
      const response = await axiosInstance.post(apiUrl, { code }, { withCredentials: true });
      console.log('API Response:', response.data); // Log the response for debugging
      setOutput(response.data); // Adjust based on actual response structure
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error running code.'); // Display error message
    }
  };

  const handleSubmit = async () => {
    console.log('Starting submission with questionId:', questionId);
    console.log('Current code:', code);
    console.log('Selected language:', language);
    console.log('Current cheating log:', cheatingLog);

    if (!questionId) {
      toast.error('Question not loaded properly. Please try again.');
      return;
    }

    try {
      // First submit the code
      const codeSubmissionData = {
        code,
        language,
        questionId,
      };

      console.log('Submitting code with data:', codeSubmissionData);

      const response = await axiosInstance.post('/api/coding/submit', codeSubmissionData, {
        withCredentials: true,
      });
      console.log('Submission response:', response.data);

      if (response.data.success) {
        try {
          // Make sure we have the latest user info in the log
          const updatedLog = {
            ...cheatingLog,
            username: userInfo.name,
            email: userInfo.email,
            examId: examId,
            noFaceCount: parseInt(cheatingLog.noFaceCount) || 0,
            multipleFaceCount: parseInt(cheatingLog.multipleFaceCount) || 0,
            cellPhoneCount: parseInt(cheatingLog.cellPhoneCount) || 0,
            prohibitedObjectCount: parseInt(cheatingLog.prohibitedObjectCount) || 0,
            screenshots: cheatingLog.screenshots || [], // Ensure screenshots array exists
          };

          console.log('Saving cheating log with screenshots:', updatedLog);

          // Save the cheating log
          const logResult = await saveCheatingLogMutation(updatedLog).unwrap();
          console.log('Cheating log saved successfully:', logResult);

          toast.success('Test submitted successfully!');
          navigate('/success');
        } catch (cheatingLogError) {
          console.error('Error saving cheating log:', cheatingLogError);
          toast.error('Test submitted but failed to save monitoring logs');
          navigate('/success');
        }
      } else {
        console.error('Submission failed:', response.data);
        toast.error('Failed to submit code');
      }
    } catch (error) {
      console.error('Error during submission:', error.response?.data || error);
      toast.error(
        error?.response?.data?.message || error?.data?.message || 'Failed to submit test',
      );
    }
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isLoading ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>Loading question...</Box>
      ) : !question ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          No coding question found for this exam. Please contact your teacher.
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Question Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {question.question}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {question.description}
              </Typography>
            </Paper>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
            {/* Code Editor Section */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={language}
                    label="Language"
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <MenuItem value="javascript">JavaScript</MenuItem>
                    <MenuItem value="python">Python</MenuItem>
                    <MenuItem value="java">Java</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minHeight: 0, height: 'calc(100% - 200px)' }}>
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value)}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </Box>

              {/* Output Section */}
              <Paper sx={{ mt: 2, p: 2, height: '120px', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Output:
                </Typography>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={runCode} sx={{ minWidth: 120 }}>
                  Run Code
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  sx={{ minWidth: 120 }}
                >
                  Submit Test
                </Button>
              </Box>
            </Box>

            {/* Webcam Section */}
            <Box sx={{ width: '320px', height: '240px', flexShrink: 0 }}>
              <Paper sx={{ height: '100%', overflow: 'hidden' }}>
                <Webcam
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  cheatingLog={cheatingLog}
                  updateCheatingLog={updateCheatingLog}
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
