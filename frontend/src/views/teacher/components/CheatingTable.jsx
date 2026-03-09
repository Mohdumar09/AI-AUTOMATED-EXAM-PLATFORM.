import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import WarningIcon from '@mui/icons-material/Warning';

import { useGetExamsQuery } from 'src/slices/examApiSlice';
import { useGetCheatingLogsQuery } from 'src/slices/cheatingLogApiSlice';

export default function CheatingTable() {

  /* ================= STATE ================= */

  const [filter, setFilter] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [cheatingLogs, setCheatingLogs] = useState([]);

  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  /* ================= FETCH EXAMS ================= */

  const {
    data: examsData,
    isLoading: examsLoading,
    error: examsError,
  } = useGetExamsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  /* ================= FETCH LOGS ================= */

  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
  } = useGetCheatingLogsQuery(selectedExam, {
    skip: !selectedExam,
  });

  /* ================= SET DEFAULT EXAM ================= */

  useEffect(() => {
    if (examsData?.length && !selectedExam) {
      // Use UUID examId
      setSelectedExam(examsData[0].examId);
    }
  }, [examsData, selectedExam]);

  /* ================= PROCESS LOGS (FIXED) ================= */

  useEffect(() => {
    if (logsLoading) return;

    if (!logsData) {
      setCheatingLogs([]);
      return;
    }

    let logs = [];

    if (Array.isArray(logsData)) {
      logs = logsData;
    } else if (typeof logsData === 'object') {
      logs = logsData.logs || logsData.data || [];
    }

    console.log('SETTING LOGS STATE:', logs);

    setCheatingLogs(logs);

  }, [logsData, logsLoading]);

  /* ================= SEARCH FILTER ================= */

  const filteredUsers = useMemo(() => {
    return cheatingLogs.filter((log) => {

      const search = filter.toLowerCase();

      const username =
        log.username?.toLowerCase() || '';

      const email =
        log.email?.toLowerCase() || '';

      return (
        username.includes(search) ||
        email.includes(search)
      );
    });
  }, [cheatingLogs, filter]);

  /* ================= HANDLERS ================= */

  const handleViewScreenshots = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLog(null);
  };

  const getViolationColor = (count) => {
    if (count > 5) return 'error';
    if (count > 2) return 'warning';
    return 'success';
  };

  const getViolationIcon = (count) => {
    if (count > 5) return <WarningIcon color="error" />;
    if (count > 2) return <WarningIcon color="warning" />;
    return null;
  };

  /* ================= LOADING ================= */

  if (examsLoading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (examsError) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error loading exams
        </Typography>
      </Box>
    );
  }

  /* ================= UI ================= */

  return (
    <Box>

      {/* FILTER BAR */}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">

          {/* EXAM SELECT */}

          <Grid item xs={12} md={4}>
            <Select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              fullWidth
            >
              {examsData.map((exam) => (
                <MenuItem
                  key={exam._id}
                  value={exam.examId}   // UUID
                >
                  {exam.examName}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* SEARCH */}

          <Grid item xs={12} md={4}>
            <TextField
              label="Filter by Name or Email"
              fullWidth
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            />
          </Grid>

        </Grid>
      </Paper>

      {/* TABLE */}

      {logsLoading ? (
        <Box display="flex" justifyContent="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : logsError ? (
        <Box p={2}>
          <Typography color="error">
            Error loading logs
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>

            <TableHead>
              <TableRow>
                <TableCell>Sno</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>No Face</TableCell>
                <TableCell>Multiple Face</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Prohibited</TableCell>
                <TableCell>Screenshots</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((log, i) => (
                  <TableRow key={i}>

                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.email}</TableCell>

                    <TableCell>
                      <Chip
                        icon={getViolationIcon(log.noFaceCount)}
                        label={log.noFaceCount}
                        color={getViolationColor(log.noFaceCount)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={getViolationIcon(log.multipleFaceCount)}
                        label={log.multipleFaceCount}
                        color={getViolationColor(log.multipleFaceCount)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={getViolationIcon(log.cellPhoneCount)}
                        label={log.cellPhoneCount}
                        color={getViolationColor(log.cellPhoneCount)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={getViolationIcon(log.prohibitedObjectCount)}
                        label={log.prohibitedObjectCount}
                        color={getViolationColor(log.prohibitedObjectCount)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Tooltip title="View Screenshots">
                        <span>
                          <IconButton
                            onClick={() =>
                              handleViewScreenshots(log)
                            }
                            disabled={!log.screenshots?.length}
                          >
                            <ImageIcon
                              color={
                                log.screenshots?.length
                                  ? 'primary'
                                  : 'disabled'
                              }
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>

                  </TableRow>
                ))
              )}

            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* SCREENSHOT DIALOG */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between">
            <Typography>
              Screenshots - {selectedLog?.username}
            </Typography>

            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {selectedLog?.screenshots?.map((s, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={s.url}
                    sx={{ objectFit: 'cover' }}
                  />

                  <CardContent>
                    <Typography variant="subtitle2">
                      {s.type}
                    </Typography>

                    <Typography variant="caption">
                      {new Date(
                        s.detectedAt,
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

    </Box>
  );
}