import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import ExamKeyModal from './ExamKeyModal';
import { useDeleteExamMutation } from 'src/slices/examApiSlice';

const imgUrl =
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c';

export default function ExamCard({ exam }) {
  const { examName, duration, totalQuestions, examId } = exam;

  const { userInfo } = useSelector((state) => state.auth);
  const isTeacher = userInfo?.role === 'teacher';

  const navigate = useNavigate();
  const [deleteExam] = useDeleteExamMutation();

  // Modal state
  const [openKeyModal, setOpenKeyModal] = React.useState(false);
  const [actionType, setActionType] = React.useState(null); // "start" | "delete"

  /* ==========================
     STUDENT: START EXAM
  ========================== */
  const handleCardClick = () => {
    if (isTeacher) {
      toast.error('Teachers cannot take exams');
      return;
    }

    setActionType('start');
    setOpenKeyModal(true);
  };

  /* ==========================
     TEACHER: DELETE EXAM
  ========================== */
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // ❗ Prevent card click

    setActionType('delete');
    setOpenKeyModal(true);
  };

  /* ==========================
     AFTER KEY VERIFIED
  ========================== */
  const handleKeyVerified = async (verified) => {
    setOpenKeyModal(false);

    if (!verified) return;

    try {
      if (actionType === 'start') {
        navigate(`/exam/${examId}`);
      }

      if (actionType === 'delete') {
        await deleteExam(examId).unwrap();
        toast.success('Exam deleted successfully');
      }
    } catch (err) {
      toast.error('Action failed');
    }

    setActionType(null);
  };

  return (
    <>
      <Card>
        <CardActionArea onClick={handleCardClick}>
          <CardMedia component="img" height="140" image={imgUrl} />

          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5">
                {examName}
              </Typography>

              {/* 🧑‍🏫 TEACHER DELETE */}
              {isTeacher && (
                <IconButton onClick={handleDeleteClick}>
                  <DeleteIcon color="error" />
                </IconButton>
              )}
            </Stack>

            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography>
                {totalQuestions} ques
              </Typography>

              <Typography>
                {duration} mins
              </Typography>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>

      {/* 🔐 KEY MODAL (REUSED) */}
      <ExamKeyModal
        open={openKeyModal}
        examId={examId}
        onClose={handleKeyVerified}
        mode={actionType} // "start" | "delete"
      />
    </>
  );
}