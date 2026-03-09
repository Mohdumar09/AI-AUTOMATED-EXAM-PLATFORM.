import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CodingQuestionForm from './CodingQuestionForm';

const CreateExam = ({ formik, title, subtitle, subtext }) => {
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = formik;

  // 🔹 Custom handler for Exam Key
  const handleExamKeyChange = (e) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    // If more than 6 digits → show alert
    if (value.length > 6) {
      alert('Exam Key cannot be more than 6 digits');
      return;
    }

    setFieldValue('examKey', value);
  };

  return (
    <Box>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Exam Name */}
          <CustomTextField
            id="examName"
            name="examName"
            label="Exam Name"
            fullWidth
            value={values.examName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.examName && Boolean(errors.examName)}
            helperText={touched.examName && errors.examName}
          />

          {/* Exam Key */}
          <CustomTextField
            id="examKey"
            name="examKey"
            label="Exam Key (6 digits)"
            fullWidth
            value={values.examKey}
            onChange={handleExamKeyChange}
            onBlur={handleBlur}
            error={touched.examKey && Boolean(errors.examKey)}
            helperText={touched.examKey && errors.examKey}
            inputProps={{
              inputMode: 'numeric',
            }}
          />

          <Typography variant="subtitle1">
            Exam Type: MCQ + Coding
          </Typography>

          {/* Total Questions */}
          <CustomTextField
            id="totalQuestions"
            name="totalQuestions"
            label="Total Number of Questions"
            fullWidth
            type="number"
            value={values.totalQuestions}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.totalQuestions && Boolean(errors.totalQuestions)}
            helperText={touched.totalQuestions && errors.totalQuestions}
          />

          {/* Duration */}
          <CustomTextField
            id="duration"
            name="duration"
            label="Exam Duration (minutes)"
            fullWidth
            type="number"
            value={values.duration}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.duration && Boolean(errors.duration)}
            helperText={touched.duration && errors.duration}
          />

          {/* Live Date */}
          <TextField
            id="liveDate"
            name="liveDate"
            label="Live Date and Time"
            type="datetime-local"
            fullWidth
            value={values.liveDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.liveDate && Boolean(errors.liveDate)}
            helperText={touched.liveDate && errors.liveDate}
            InputLabelProps={{ shrink: true }}
          />

          {/* Dead Date */}
          <TextField
            id="deadDate"
            name="deadDate"
            label="Dead Date and Time"
            type="datetime-local"
            fullWidth
            value={values.deadDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.deadDate && Boolean(errors.deadDate)}
            helperText={touched.deadDate && errors.deadDate}
            InputLabelProps={{ shrink: true }}
          />

          {/* Submit Button */}
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Create Exam'}
          </Button>
        </Stack>
      </Box>

      {subtitle}
    </Box>
  );
};

export default CreateExam;
