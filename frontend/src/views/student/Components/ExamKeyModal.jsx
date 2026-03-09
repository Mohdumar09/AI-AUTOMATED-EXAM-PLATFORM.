import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useValidateExamKeyMutation } from 'src/slices/examApiSlice';

export default function ExamKeyModal({
  open,
  onClose,
  examId,
  mode, // "start" | "delete"
}) {
  const [examKey, setExamKey] = useState('');
  const [validateExamKey, { isLoading }] =
    useValidateExamKeyMutation();

  /* ==========================
     RESET ON OPEN
  ========================== */
  useEffect(() => {
    if (open) {
      setExamKey('');
    }
  }, [open]);

  /* ==========================
     SUBMIT
  ========================== */
  const handleSubmit = async () => {
    if (examKey.length !== 6) {
      toast.error('Exam key must be 6 digits');
      return;
    }

    try {
      await validateExamKey({ examId, examKey }).unwrap();

      // Save for exam page protection
      sessionStorage.setItem(
        `examKeyVerified-${examId}`,
        'true'
      );

      toast.success('Exam key verified');

      // ✅ Tell parent success
      onClose(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid exam key');
      onClose(false);
    }
  };

  /* ==========================
     CLOSE HANDLER
  ========================== */
  const handleClose = () => {
    onClose(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle align="center">
        {mode === 'delete'
          ? 'Confirm Exam Deletion'
          : 'Enter Exam Key'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={2}>
          {mode === 'delete' && (
            <Typography color="error" align="center">
              ⚠ This action cannot be undone
            </Typography>
          )}

          <TextField
            label="Exam Key"
            value={examKey}
            onChange={(e) => {
              if (e.target.value.length <= 6) {
                setExamKey(
                  e.target.value.replace(/\D/g, '')
                );
              }
            }}
            inputProps={{ maxLength: 6 }}
            fullWidth
            autoFocus
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            color={mode === 'delete' ? 'error' : 'primary'}
          >
            {isLoading
              ? 'Verifying...'
              : mode === 'delete'
              ? 'Verify & Delete'
              : 'Verify & Start'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}