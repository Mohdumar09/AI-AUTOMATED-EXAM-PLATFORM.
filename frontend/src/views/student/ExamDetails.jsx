import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  List,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { uniqueId } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetQuestionsQuery } from 'src/slices/examApiSlice';

/* =========================
   COPYRIGHT
========================= */
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

/* =========================
   DESCRIPTION & INSTRUCTIONS
========================= */
const DescriptionAndInstructions = () => {
  const navigate = useNavigate();
  const { examId } = useParams();

  /* 🔐 BLOCK DIRECT ACCESS */
  useEffect(() => {
    const verified = sessionStorage.getItem(`examKeyVerified-${examId}`);
    if (!verified) {
      toast.error('Please enter exam key first');
      navigate('/');
    }
  }, [examId, navigate]);

  // Fetch questions
  const { data: questions, isLoading } = useGetQuestionsQuery(examId);

  const testId = uniqueId();
  const [certify, setCertify] = useState(false);

  const handleCertifyChange = () => {
    setCertify(!certify);
  };

  const handleTest = () => {
    const isValid = true; // you can add date validation here

    if (isValid) {
      navigate(`/exam/${examId}/${testId}`);
    } else {
      toast.error('Test date is not valid.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h2" mb={3}>
          Description
        </Typography>

        <Typography>
          This practice test will allow you to measure your Python skills at the
          beginner level by the way of various multiple choice questions.
        </Typography>

        <Typography mt={1}>
          #Python #Coding #Software #MCQ #Beginner #Programming
        </Typography>

        <Typography variant="h3" mb={3} mt={3}>
          Test Instructions
        </Typography>

        <List>
          <ol>
            <li>
              <ListItemText>
                <Typography>This test contains only MCQ questions.</Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  Total questions: <strong>40</strong> | Duration:{' '}
                  <strong>30 minutes</strong>
                </Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  <strong>Negative marking</strong> is applicable.
                </Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  <strong>Do not switch tabs.</strong> Switching tabs will end
                  the test.
                </Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  Test must be taken in <strong>full screen mode</strong>.
                </Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  Clicking next/back saves your answer.
                </Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  You can reattempt questions while the test is running.
                </Typography>
              </ListItemText>
            </li>
            <li>
              <ListItemText>
                <Typography>
                  Scores will be shown after test completion.
                </Typography>
              </ListItemText>
            </li>
          </ol>
        </List>

        <Typography variant="h3" mb={3} mt={3}>
          Confirmation
        </Typography>

        <Typography mb={3}>
          Your actions are monitored. Any malpractice may result in
          disqualification.
        </Typography>

        <Stack direction="column" alignItems="center" spacing={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={certify}
                onChange={handleCertifyChange}
                color="primary"
              />
            }
            label="I have read and agree to all the instructions"
          />

          <Button
            variant="contained"
            color="primary"
            disabled={!certify}
            onClick={handleTest}
          >
            Start Test
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

/* =========================
   MAIN PAGE LAYOUT
========================= */

const imgUrl =
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713';

export default function ExamDetails() {
  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${imgUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <DescriptionAndInstructions />
      </Grid>
    </Grid>
  );
}
