import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Code, Visibility, VisibilityOff, Search, CheckCircle } from '@mui/icons-material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import axiosInstance from '../../axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ResultPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]); // backup

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedResult, setSelectedResult] = useState(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [exams, setExams] = useState([]);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const examsResponse = await axiosInstance.get('/api/exam', {
          withCredentials: true,
        });

        setExams(examsResponse.data || []);

        if (userInfo?.role === 'teacher') {
          const res = await axiosInstance.get('/api/users/results/all', {
            withCredentials: true,
          });

          const data = res.data?.data || [];

          setResults(data);
          setAllResults(data); // save backup
        } else {
          const res = await axiosInstance.get('/api/users/results/user', {
            withCredentials: true,
          });

          const data = res.data?.data || [];

          setResults(data);
          setAllResults(data); // save backup
        }
      } catch (err) {
        setError('Failed to fetch data');
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  /* ================= TOGGLE ================= */

  const handleToggleVisibility = async (resultId) => {
    try {
      await axiosInstance.put(
        `/api/users/results/${resultId}/toggle-visibility`,
        {},
        { withCredentials: true },
      );

      toast.success('Visibility updated');

      const res = await axiosInstance.get('/api/users/results/all', {
        withCredentials: true,
      });

      const data = res.data?.data || [];

      setResults(data);
      setAllResults(data); // refresh backup
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  /* ================= VIEW CODE ================= */

  const handleViewCode = (result) => {
    setSelectedResult(result);
    setCodeDialogOpen(true);
  };

  /* ================= EXAM FILTER ================= */

  const handleExamChange = (examId) => {
    setSelectedExam(examId);

    // All exams → restore
    if (examId === 'all') {
      setResults(allResults);
      return;
    }

    // Filter from backup
    const filtered = allResults.filter(
      (r) => r.examId === examId
    );

    setResults(filtered);
  };

  /* ================= SEARCH ================= */

  const filteredResults = results.filter((result) => {
    const search = searchTerm.toLowerCase();

    const name =
      result.userId?.name?.toLowerCase() || '';

    const email =
      result.userId?.email?.toLowerCase() || '';

    return (
      search === '' ||
      name.includes(search) ||
      email.includes(search)
    );
  });

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  /* ================= STUDENT ================= */

  if (userInfo?.role === 'student') {
    return (
      <PageContainer title="My Exam Results">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DashboardCard title="My Results">
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Exam</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Code</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>
                          {exams.find((e) => e.examId === r.examId)?.examName || r.examId}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={`${r.percentage.toFixed(1)}%`}
                            color={r.percentage >= 70 ? 'success' : 'warning'}
                          />
                        </TableCell>

                        <TableCell>{r.totalMarks}</TableCell>

                        <TableCell>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          {r.codingSubmissions?.length > 0 && (
                            <IconButton onClick={() => handleViewCode(r)}>
                              <Code />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DashboardCard>
          </Grid>
        </Grid>
      </PageContainer>
    );
  }

  /* ================= TEACHER ================= */

  return (
    <PageContainer title="Results Dashboard" description="View and manage exam results">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DashboardCard title="Exam Results">
            {/* Filters */}

            <Box mb={3} display="flex" gap={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Exam</InputLabel>

                <Select
                  value={selectedExam}
                  onChange={(e) => handleExamChange(e.target.value)}
                  label="Select Exam"
                >
                  <MenuItem value="all">All Exams</MenuItem>

                  {exams.map((exam) => (
                    <MenuItem key={exam._id} value={exam.examId}>
                      {exam.examName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Search Students"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Tabs */}

            <Tabs
              value={selectedTab}
              onChange={(e, v) => setSelectedTab(v)}
              sx={{ mb: 2 }}
            >
              <Tab label="All Results" value={0} />
              <Tab label="MCQ Results" value={1} />
              <Tab label="Coding Results" value={2} />
            </Tabs>

            {/* Table */}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Exam</TableCell>
                    <TableCell>MCQ Score</TableCell>
                    <TableCell>Coding Submissions</TableCell>
                    <TableCell>Total Score</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredResults.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.userId?.name}</TableCell>
                      <TableCell>{r.userId?.email}</TableCell>

                      <TableCell>
                        {exams.find((e) => e.examId === r.examId)?.examName || r.examId}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${r.percentage.toFixed(1)}%`}
                          color={r.percentage >= 70 ? 'success' : 'warning'}
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircle color="success" fontSize="small" />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          Total: {r.totalMarks}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => handleToggleVisibility(r._id)}
                          color={r.showToStudent ? 'success' : 'default'}
                        >
                          {r.showToStudent ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ResultPage;