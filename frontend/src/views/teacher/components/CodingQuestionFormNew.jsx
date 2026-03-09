import React, { useState } from 'react';
import { TextField, Box, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import axiosInstance from '../../../axios';

const CodingQuestionFormNew = ({ selectedExamId }) => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');

  const handleAddCodingQuestion = async () => {
    try {
      const response = await axiosInstance.post(
        '/api/coding/question',
        {
          question,
          description,
          examId: selectedExamId,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Coding question added successfully!');
        setQuestion('');
        setDescription('');
      } else {
        toast.error('Failed to add coding question');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add coding question');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add Coding Question
      </Typography>

      <TextField
        fullWidth
        label="Question Title"
        multiline
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Problem Description"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddCodingQuestion}
        disabled={!selectedExamId}
      >
        Add Coding Question
      </Button>
    </Box>
  );
};

export default CodingQuestionFormNew;