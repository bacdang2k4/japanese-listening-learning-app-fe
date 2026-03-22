import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
 TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
} from '@mui/material';
import FormDialog from '../components/common/FormDialog';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  CheckBox as CheckBoxIcon,
  IndeterminateCheckBox as IndeterminateIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { formatBackendDateTime } from '../lib/dateUtils';
import {
  adminAudioTestApi,
  adminQuestionApi,
  adminTopicApi,
  AudioTestResponse,
  QuestionResponse,
  TopicResponse,
} from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 24 }}>
    {value === index && children}
  </div>
);

const AdminAudioTestDetailPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // Helper to strip SSML tags
  const stripSSML = (ssml: string): string => {
    if (!ssml) return '';
    return ssml
      .replace(/<[^>]*>/g, '') // Remove all tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();
  };

  const [test, setTest] = useState<AudioTestResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Form state for editing test metadata
  const [editForm, setEditForm] = useState({
    testName: '',
    topicId: '',
    transcript: '',
    audioUrl: '',
    duration: 60,
    passCondition: 70,
    testOrder: 1,
  });
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Audio player state
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Question management
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  // Confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Question dialog state
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    content: '',
    answers: [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ] as { content: string; isCorrect: boolean }[],
  });

  const fetchTopics = useCallback(async () => {
    setTopicsLoading(true);
    setTopicsError('');
    try {
      const result = await adminTopicApi.getAll(0, 100);
      setTopics(result.data.content);
    } catch (err: any) {
      setTopicsError(err.message || 'Không thể tải danh sách chủ đề');
      console.error('Failed to fetch topics:', err);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const fetchTestAndQuestions = useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    setError('');
    try {
      const [testRes, questionsRes] = await Promise.all([
        adminAudioTestApi.getById(Number(testId)),
        adminQuestionApi.getByTestId(Number(testId)),
      ]);
      setTest(testRes.data);
      setQuestions(questionsRes.data);
      // Initialize edit form
      setEditForm({
        testName: testRes.data.testName,
        topicId: String(testRes.data.topicId),
        transcript: testRes.data.transcript || '',
        audioUrl: testRes.data.audioUrl || '',
        duration: testRes.data.duration,
        passCondition: testRes.data.passCondition || 70,
        testOrder: testRes.data.testOrder || 1,
      });
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu bài test');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);
  useEffect(() => { fetchTestAndQuestions(); }, [fetchTestAndQuestions]);

  // Detect form changes
  useEffect(() => {
    if (!test) return;
    const changed =
      editForm.testName !== test.testName ||
      editForm.topicId !== String(test.topicId) ||
      editForm.transcript !== (test.transcript || '') ||
      editForm.audioUrl !== (test.audioUrl || '') ||
      editForm.duration !== test.duration ||
      editForm.passCondition !== (test.passCondition || 70);
    setHasChanges(changed);
  }, [editForm, test]);

  const handleEditChange = (field: string, value: string | number) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveTest = async () => {
    if (!test) return;
    setSaving(true);
    try {
      await adminAudioTestApi.update(test.testId, {
        testName: editForm.testName,
        topicId: Number(editForm.topicId),
        transcript: editForm.transcript || undefined,
        audioUrl: editForm.audioUrl || undefined,
        duration: editForm.duration,
        passCondition: editForm.passCondition,
        testOrder: editForm.testOrder,
      });
      setSuccessMsg('Đã lưu thay đổi');
      setHasChanges(false);
      fetchTestAndQuestions();
    } catch (err: any) {
      setError(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!test) return;
    setSaving(true);
    try {
      await adminAudioTestApi.publish(test.testId);
      setSuccessMsg('Đã xuất bản bài test');
      fetchTestAndQuestions();
      setPublishDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Xuất bản thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!test) return;
    setSaving(true);
    try {
      await adminAudioTestApi.reject(test.testId);
      setSuccessMsg('Đã từ chối bài test');
      fetchTestAndQuestions();
      setRejectDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Từ chối thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!test) return;
    setSaving(true);
    try {
      await adminAudioTestApi.delete(test.testId);
      navigate('/admin/audio-tests');
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Question selection
  const handleSelectQuestion = (questionId: number, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, questionId]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedQuestions(questions.map(q => q.questionId));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleDeleteSelectedQuestions = async () => {
    setSaving(true);
    try {
      await Promise.all(
        selectedQuestions.map(qId => adminQuestionApi.delete(qId))
      );
      setSelectedQuestions([]);
      fetchTestAndQuestions();
    } catch (err: any) {
      setError(err.message || 'Xóa câu hỏi thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    // Simple reorder by swapping positions (assuming question order is not persisted beyond display order)
    // For persistent reordering, you'd need a backend endpoint to handle ordering
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
    // Note: To persist reorder, you would need to implement an update endpoint that accepts question order
  };

  const handleOpenQuestionDialog = (question?: QuestionResponse) => {
    if (question) {
      setSelectedQuestion(question);
      const answers = question.answers.map(a => ({
        content: a.content,
        isCorrect: a.isCorrect,
      }));
      // Ensure 4 answers
      while (answers.length < 4) answers.push({ content: '', isCorrect: false });
      setQuestionFormData({
        content: question.content,
        answers,
      });
    } else {
      setSelectedQuestion(null);
      setQuestionFormData({
        content: '',
        answers: [
          { content: '', isCorrect: true },
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
        ],
      });
    }
    setQuestionDialogOpen(true);
  };

  const handleCloseQuestionDialog = () => {
    setQuestionDialogOpen(false);
    setSelectedQuestion(null);
  };

  const handleCorrectChange = (index: number) => {
    setQuestionFormData({
      ...questionFormData,
      answers: questionFormData.answers.map((a, i) => ({ ...a, isCorrect: i === index })),
    });
  };

  const handleAnswerContentChange = (index: number, value: string) => {
    const updated = [...questionFormData.answers];
    updated[index] = { ...updated[index], content: value };
    setQuestionFormData({ ...questionFormData, answers: updated });
  };

  const handleQuestionSubmit = async () => {
    if (!test) return;
    setSaving(true);
    try {
      const validAnswers = questionFormData.answers.filter(a => a.content.trim());
      if (validAnswers.length < 2) {
        setError('Phải có ít nhất 2 đáp án');
        setSaving(false);
        return;
      }
      const payload = {
        content: questionFormData.content,
        testId: test.testId,
        answers: validAnswers,
      };
      if (selectedQuestion) {
        await adminQuestionApi.update(selectedQuestion.questionId, payload);
      } else {
        await adminQuestionApi.create(payload);
      }
      setQuestionDialogOpen(false);
      fetchTestAndQuestions();
    } catch (err: any) {
      setError(err.message || 'Lưu câu hỏi thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    setSaving(true);
    try {
      await adminQuestionApi.delete(questionId);
      fetchTestAndQuestions();
    } catch (err: any) {
      setError(err.message || 'Xóa câu hỏi thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Audio player controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value as number;
      setCurrentTime(value as number);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <MainLayout title="Chi tiết Bài Test">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!test) {
    return (
      <MainLayout title="Không tìm thấy">
        <Alert severity="error">Không tìm thấy bài test</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/audio-tests')} variant="outlined" sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </MainLayout>
    );
  }

  const statusColorMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    DRAFT: 'default',
    PUBLISHED: 'success',
    PENDING_REVIEW: 'warning',
    REJECTED: 'error',
  };

  const statusLabelMap: Record<string, string> = {
    DRAFT: 'Nháp',
    PUBLISHED: 'Đã xuất bản',
    PENDING_REVIEW: 'Chờ duyệt',
    REJECTED: 'Đã từ chối',
  };

  return (
    <MainLayout title="Chi tiết Bài Test">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {test.testName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`ID: ${test.testId}`} size="small" variant="outlined" />
                <Chip
                  label={statusLabelMap[test.status] || test.status}
                  size="small"
                  color={statusColorMap[test.status] || 'default'}
                />
                <Chip label={test.topicName || 'N/A'} size="small" color="primary" variant="outlined" />
                {test.duration && <Chip label={`${test.duration} phút`} size="small" />}
                {test.passCondition && <Chip label={`Đạt: ${test.passCondition}%`} size="small" />}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {test.status === 'DRAFT' || test.status === 'PENDING_REVIEW' ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PublishIcon />}
                  onClick={() => setPublishDialogOpen(true)}
                  disabled={saving}
                >
                  Xuất bản
                </Button>
              ) : null}
              {test.status !== 'PUBLISHED' && test.status !== 'REJECTED' && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RejectIcon />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={saving}
                >
                  Từ chối
                </Button>
              )}
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={saving}
              >
                Xóa
              </Button>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => navigate('/admin/audio-tests')}
              >
                Quay lại
              </Button>
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="Thông tin & Transcript" />
              <Tab label={`Câu hỏi (${questions.length})`} />
              <Tab label="Nghe Audio" />
            </Tabs>
          </Box>
        </CardContent>
      </Card>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="Tên bài test"
                  value={editForm.testName}
                  onChange={(e) => handleEditChange('testName', e.target.value)}
                  fullWidth required
                  disabled={saving}
                />
                <FormControl fullWidth required disabled={saving || topicsLoading}>
                  <InputLabel>Chủ đề</InputLabel>
                  <Select
                    value={editForm.topicId}
                    label="Chủ đề"
                    onChange={(e) => handleEditChange('topicId', e.target.value)}
                  >
                    {topicsError ? (
                      <MenuItem value="" disabled>
                        {topicsError}
                      </MenuItem>
                    ) : topics.map((t) => (
                      <MenuItem key={t.id} value={String(t.id)}>{t.topicName} ({t.levelName})</MenuItem>
                    ))}
                  </Select>
                  {topicsLoading && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Đang tải chủ đề...
                    </Typography>
                  )}
                  {topicsError && !topicsLoading && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {topicsError}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Thứ tự bài test</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Tăng thứ tự">
                      <IconButton
                        size="small"
                        onClick={() => handleEditChange('testOrder', editForm.testOrder - 1)}
                        disabled={saving || editForm.testOrder <= 1}
                      >
                        <ArrowUpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <TextField
                      label=""
                      type="number"
                      value={editForm.testOrder}
                      onChange={(e) => handleEditChange('testOrder', Number(e.target.value))}
                      inputProps={{ min: 1 }}
                      sx={{ width: 80 }}
                      disabled={saving}
                      size="small"
                    />
                    <Tooltip title="Giảm thứ tự">
                      <IconButton
                        size="small"
                        onClick={() => handleEditChange('testOrder', editForm.testOrder + 1)}
                        disabled={saving}
                      >
                        <ArrowDownIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <TextField
                  label="Thời lượng (phút)"
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => handleEditChange('duration', Number(e.target.value))}
                  fullWidth inputProps={{ min: 1 }}
                  disabled={saving}
                />
                <TextField
                  label="Điểm đạt (%)"
                  type="number"
                  value={editForm.passCondition}
                  onChange={(e) => handleEditChange('passCondition', Number(e.target.value))}
                  fullWidth inputProps={{ min: 0, max: 100 }}
                  disabled={saving}
                />
              </Box>
              <TextField
                label="Transcript (SSML)"
                value={editForm.transcript}
                onChange={(e) => handleEditChange('transcript', e.target.value)}
                fullWidth multiline rows={6}
                disabled={saving}
                helperText="Nội dung transcript với SSML markup (dành cho AWS Polly)"
              />
              {test?.plainTranscript && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Transcript (đã parse, không SSML)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: '#f5f5f5',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                    >
                      {test.plainTranscript}
                    </Typography>
                  </Paper>
                </Box>
              )}
              <TextField
                label="Audio URL"
                value={editForm.audioUrl}
                onChange={(e) => handleEditChange('audioUrl', e.target.value)}
                fullWidth
                disabled={saving}
                placeholder="https://s3.amazonaws.com/..."
                helperText="URL đến file audio (mp3, wav, etc.)"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveTest}
                  disabled={saving || !hasChanges}
                >
                  Lưu thay đổi
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Quản lý Câu hỏi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedQuestions.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteSelectedQuestions}
                    disabled={saving}
                  >
                    Xóa ({selectedQuestions.length})
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenQuestionDialog()}
                  disabled={saving}
                >
                  Thêm câu hỏi
                </Button>
              </Box>
            </Box>

            {questions.length === 0 ? (
              <Alert severity="info">Chưa có câu hỏi nào cho bài test này.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < questions.length}
                          checked={questions.length > 0 && selectedQuestions.length === questions.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>#</TableCell>
                      <TableCell>Nội dung câu hỏi</TableCell>
                      <TableCell>Đáp án</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={question.questionId} selected={selectedQuestions.includes(question.questionId)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedQuestions.includes(question.questionId)}
                            onChange={(e) => handleSelectQuestion(question.questionId, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{question.content}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {question.answers.map((ans) => (
                              <Chip
                                key={ans.answerId}
                                label={ans.content}
                                size="small"
                                color={ans.isCorrect ? 'success' : 'default'}
                                variant={ans.isCorrect ? 'filled' : 'outlined'}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Di chuyển lên">
                              <IconButton size="small" onClick={() => handleMoveQuestion(index, 'up')} disabled={index === 0}>
                                <ArrowUpIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Di chuyển xuống">
                              <IconButton size="small" onClick={() => handleMoveQuestion(index, 'down')} disabled={index === questions.length - 1}>
                                <ArrowDownIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton size="small" onClick={() => handleOpenQuestionDialog(question)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(question.questionId)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            {test.audioUrl ? (
              <Box>
                <audio
                  ref={audioRef}
                  src={test.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  style={{ display: 'none' }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {test.testName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {test.topicName ? `${test.topicName} • ` : ''}{test.duration} phút
                  </Typography>
                </Box>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <Slider
                    value={currentTime}
                    max={duration || 100}
                    onChange={handleSeek}
                    sx={{
                      color: 'white',
                      '& .MuiSlider-thumb': { width: 16, height: 16, bgcolor: 'white' },
                      '& .MuiSlider-track': { bgcolor: 'white' },
                      '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' },
                      mb: 2,
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="body2">{formatTime(currentTime)}</Typography>
                    <Typography variant="body2">{formatTime(duration)}</Typography>
                  </Box>
                  <IconButton
                    onClick={togglePlay}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                      width: 80,
                      height: 80,
                    }}
                  >
                    {isPlaying ? <PauseIcon sx={{ fontSize: 48 }} /> : <PlayIcon sx={{ fontSize: 48 }} />}
                  </IconButton>
                </Paper>
                {test.transcript && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      📝 Transcript (plain text):
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, mt: 1, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {test.plainTranscript || stripSSML(test.transcript)}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            ) : (
              <Alert severity="warning">Bài test này chưa có file audio.</Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Confirmation Dialogs */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa bài test</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa bài test "{test.testName}"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteTest} color="error" variant="contained" disabled={saving}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
        <DialogTitle>Xác nhận xuất bản</DialogTitle>
        <DialogContent>
          <Typography>
            Xuất bản bài test "{test.testName}"? Sau khi xuất bản, bài test sẽ có thể được học viên sử dụng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Hủy</Button>
          <Button onClick={handlePublish} color="success" variant="contained" disabled={saving}>
            Xuất bản
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Xác nhận từ chối</DialogTitle>
        <DialogContent>
          <Typography>
            Từ chối bài test "{test.testName}"? Bài test sẽ chuyển sang trạng thái "Đã từ chối".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleReject} color="warning" variant="contained" disabled={saving}>
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Add/Edit Dialog */}
      <FormDialog
        open={questionDialogOpen}
        title={selectedQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        onClose={handleCloseQuestionDialog}
        onSubmit={handleQuestionSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nội dung câu hỏi"
            value={questionFormData.content}
            onChange={(e) => setQuestionFormData({ ...questionFormData, content: e.target.value })}
            fullWidth required multiline rows={2} disabled={saving}
          />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Đáp án (chọn đáp án đúng):
          </Typography>
          <RadioGroup>
            {questionFormData.answers.map((answer, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FormControlLabel
                  value={String(index)}
                  control={
                    <Radio
                      checked={answer.isCorrect}
                      onChange={() => handleCorrectChange(index)}
                      disabled={saving}
                    />
                  }
                  label=""
                  sx={{ mr: 0 }}
                />
                <TextField
                  size="small"
                  fullWidth
                  placeholder={`Đáp án ${index + 1}`}
                  value={answer.content}
                  onChange={(e) => handleAnswerContentChange(index, e.target.value)}
                  disabled={saving}
                />
              </Box>
            ))}
          </RadioGroup>
          <Typography variant="caption" color="text.secondary">
            Lưu ý: Chỉ đánh dấu một đáp án là đúng. Ít nhất 2 đáp án có nội dung.
          </Typography>
        </Box>
      </FormDialog>
    </MainLayout>
  );
};

export default AdminAudioTestDetailPage;
