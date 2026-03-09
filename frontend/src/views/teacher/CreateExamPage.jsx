import React from 'react';
import { Grid, Box, Card, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ExamForm from './components/ExamForm';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useCreateExamMutation } from '../../slices/examApiSlice.js';
import axiosInstance from '../../axios';

const examValidationSchema = yup.object({
  examName: yup
    .string()
    .trim()
    .min(3, 'Exam Name must be at least 3 characters')
    .max(100, 'Exam Name must be less than 100 characters')
    .required('Exam Name is required'),
  examType: yup
    .string()
    .oneOf(['mcq+coding'], 'Invalid exam type')
    .required('Exam Type is required'),
  totalQuestions: yup
    .number()
    .typeError('Total Number of Questions must be a number')
    .integer('Total Number of Questions must be an integer')
    .min(1, 'Total Number of Questions must be at least 1')
    .max(100, 'Total Number of Questions cannot exceed 100')
    .required('Total Number of Questions is required'),
  duration: yup
    .number()
    .typeError('Exam Duration must be a number')
    .integer('Exam Duration must be an integer')
    .min(1, 'Exam Duration must be at least 1 minute')
    .max(480, 'Exam Duration cannot exceed 480 minutes (8 hours)')
    .required('Exam Duration is required'),
  liveDate: yup
    .date()
    .min(new Date(), 'Live Date must be in the future')
    .required('Live Date and Time is required'),
  deadDate: yup
    .date()
    .min(
      yup.ref('liveDate'),
      'Dead Date must be after Live Date'
    )
    .required('Dead Date and Time is required'),
});

const CreateExamPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [createExam, { isLoading }] = useCreateExamMutation();

  // Helper function to get tomorrow's date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().slice(0, 16);
  };

  // Helper function to get day after tomorrow
  const getDayAfterTomorrow = () => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setMinutes(dayAfter.getMinutes() - dayAfter.getTimezoneOffset());
    return dayAfter.toISOString().slice(0, 16);
  };

  const initialExamValues = {
    examName: '',
    examType: 'mcq+coding',
    totalQuestions: '',
    duration: '',
    liveDate: getTomorrowDate(),
    deadDate: getDayAfterTomorrow(),

  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      // Create the exam
      const examResponse = await createExam(values).unwrap();
      
      if (!examResponse) {
        throw new Error('Failed to create exam');
      }

      // Get exam ID from response
      const examId = examResponse.examId || examResponse._id || examResponse.id;
      if (!examId) {
        throw new Error('No exam ID received from server');
      }

            // Navigate to add questions page after successful exam creation
      navigate(`/add-questions/${examId}`);
      resetForm();
    } catch (error) {
      console.error('Creation Error:', error);
      toast.error(
        error.response?.data?.message || 
        error.data?.message || 
        error.message || 
        'Failed to process exam creation'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: initialExamValues,
    validationSchema: examValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <PageContainer title="Create Exam" description="Create a new exam">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            xl={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '800px' }}>
              <ExamForm
                formik={formik}
                title={
                  <Typography variant="h3" textAlign="center" color="textPrimary" mb={1}>
                    Create Exam
                  </Typography>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default CreateExamPage;
