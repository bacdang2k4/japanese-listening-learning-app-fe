import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Search, Visibility, CheckCircle, Cancel, History } from '@mui/icons-material';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockTestResults, mockAudioTests, mockQuestions } from '../../data/mockData';

interface TestResultDetail {
  id: string;
  testName: string;
  mode: 'Practice' | 'Exam';
  score: number;
  passed: boolean;
  completedAt: Date;
  totalQuestions: number;
  correctAnswers: number;
}

const TestHistoryPage: React.FC = () => {
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<TestResultDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Transform mock data
  const testResults: TestResultDetail[] = mockTestResults
    .filter(r => r.learnerId === '1') // Current user
    .map(result => {
      const test = mockAudioTests.find(t => t.id === result.testId);
      const questions = mockQuestions.filter(q => q.testId === result.testId);
      return {
        id: result.id,
        testName: test?.name || 'Unknown Test',
        mode: result.mode,
        score: result.score,
        passed: result.passed,
        completedAt: result.completedAt,
        totalQuestions: questions.length || 10,
        correctAnswers: Math.round((result.score / 100) * (questions.length || 10)),
      };
    });

  const filteredResults = testResults.filter(result => {
    const matchesMode = modeFilter === 'all' || result.mode === modeFilter;
    const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMode && matchesSearch;
  });

  const handleViewDetail = (result: TestResultDetail) => {
    setSelectedResult(result);
    setDetailOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <LearnerLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <History sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Lịch sử làm bài
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xem lại kết quả các bài thi đã hoàn thành
            </Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm bài thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Chế độ</InputLabel>
                  <Select
                    value={modeFilter}
                    label="Chế độ"
                    onChange={(e) => setModeFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="Practice">Luyện tập</MenuItem>
                    <MenuItem value="Exam">Thi thật</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip
                    label={`Tổng: ${filteredResults.length} bài`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Đạt: ${filteredResults.filter(r => r.passed).length}`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`Chưa đạt: ${filteredResults.filter(r => !r.passed).length}`}
                    color="error"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Tên bài thi</TableCell>
                  <TableCell align="center">Chế độ</TableCell>
                  <TableCell align="center">Điểm</TableCell>
                  <TableCell align="center">Kết quả</TableCell>
                  <TableCell align="center">Thời gian</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Chưa có kết quả nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{result.testName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.correctAnswers}/{result.totalQuestions} câu đúng
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={result.mode === 'Practice' ? 'Luyện tập' : 'Thi thật'}
                          color={result.mode === 'Practice' ? 'info' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={result.passed ? 'success.main' : 'error.main'}
                        >
                          {result.score}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {result.passed ? (
                          <Chip
                            size="small"
                            icon={<CheckCircle />}
                            label="Đạt"
                            color="success"
                          />
                        ) : (
                          <Chip
                            size="small"
                            icon={<Cancel />}
                            label="Chưa đạt"
                            color="error"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDate(result.completedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetail(result)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Chi tiết kết quả
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            {selectedResult && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedResult.testName}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          color={selectedResult.passed ? 'success.main' : 'error.main'}
                        >
                          {selectedResult.score}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Điểm số
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary">
                          {selectedResult.correctAnswers}/{selectedResult.totalQuestions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Câu đúng
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Chế độ:</Typography>
                  <Chip
                    size="small"
                    label={selectedResult.mode === 'Practice' ? 'Luyện tập' : 'Thi thật'}
                    color={selectedResult.mode === 'Practice' ? 'info' : 'warning'}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Kết quả:</Typography>
                  {selectedResult.passed ? (
                    <Chip size="small" label="Đạt" color="success" />
                  ) : (
                    <Chip size="small" label="Chưa đạt" color="error" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Thời gian hoàn thành:</Typography>
                  <Typography>{formatDate(selectedResult.completedAt)}</Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LearnerLayout>
  );
};

export default TestHistoryPage;
