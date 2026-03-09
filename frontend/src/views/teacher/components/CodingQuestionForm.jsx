import React from 'react';
import { TextField, Box, Typography } from '@mui/material';

const CodingQuestionForm = ({ formik }) => {
  const questionValue = formik.values?.codingQuestion?.question || '';
  const descriptionValue = formik.values?.codingQuestion?.description || '';
  const touchedQuestion = formik.touched?.codingQuestion?.question;
  const touchedDescription = formik.touched?.codingQuestion?.description;
  const errorQuestion = formik.errors?.codingQuestion?.question;
  const errorDescription = formik.errors?.codingQuestion?.description;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Coding Question
      </Typography>

      <TextField
        fullWidth
        id="codingQuestion.question"
        name="codingQuestion.question"
        label="Question"
        multiline
        rows={3}
        value={questionValue}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={touchedQuestion && Boolean(errorQuestion)}
        helperText={touchedQuestion && errorQuestion}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        id="codingQuestion.description"
        name="codingQuestion.description"
        label="Description/Instructions"
        multiline
        rows={4}
        value={descriptionValue}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={touchedDescription && Boolean(errorDescription)}
        helperText={touchedDescription && errorDescription}
        sx={{ mb: 3 }}
      />
    </Box>
  );
};

export default CodingQuestionForm;
