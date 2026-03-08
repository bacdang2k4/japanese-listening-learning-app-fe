import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Slider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as PublishIcon,
  Cancel as RejectIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeMuteIcon,
  Headphones as HeadphonesIcon,
  AutoAwesome as AiIcon,
  Quiz as QuizIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import Backdrop from '@mui/material/Backdrop';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  adminAudioTestApi,
  adminTopicApi,
  adminAiTestApi,
  adminQuestionApi,
  AudioTestResponse,
  TopicResponse,
  QuestionResponse,
  AnswerRequest,
} from '../services/api';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  PENDING_REVIEW: 'warning',
  REJECTED: 'error',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã xuất bản',
  PENDING_REVIEW: 'Chờ duyệt',
  REJECTED: 'Đã từ chối',
};

// ─── SSML Parser ───────────────────────────────────────────────

/**
 * Parse AWS Polly SSML transcript into human-readable text.
 * Strips <speak>, <prosody>, <break> tags and formats as dialogue lines.
 */
const parseSsmlTranscript = (ssml: string): string => {
  if (!ssml) return '';

  let text = ssml;

  // Remove <speak> wrapper
  text = text.replace(/<\/?speak>/g, '');

  // Replace <break .../> with newline
  text = text.replace(/<break[^/]*\/>/g, '\n');

  // Extract text from <prosody ...>text</prosody>
  text = text.replace(/<prosody[^>]*>(.*?)<\/prosody>/g, '$1');

  // Remove any remaining XML tags
  text = text.replace(/<[^>]+>/g, '');

  // Clean up multiple newlines and trim
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
};

// ─── Audio Player Component ────────────────────────────────────

interface AudioPlayerDialogProps {
  open: boolean;
  test: AudioTestResponse | null;
  onClose: () => void;
}

const AudioPlayerDialog: React.FC<AudioPlayerDialogProps> = ({ open, test, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [open]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const vol = value as number;
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const handleEnded = () => setIsPlaying(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HeadphonesIcon color="primary" />
        Nghe Audio: {test?.testName}
      </DialogTitle>
      <DialogContent>
        {test?.audioUrl ? (
          <Box sx={{ mt: 2 }}>
            <audio
              ref={audioRef}
              src={test.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />

            {/* Player UI */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
              }}
            >
              {/* Test info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {test.testName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {test.topicName} • {test.duration} phút
                </Typography>
              </Box>

              {/* Progress */}
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                sx={{
                  color: 'white',
                  '& .MuiSlider-thumb': { width: 12, height: 12, bgcolor: 'white' },
                  '& .MuiSlider-track': { bgcolor: 'white' },
                  '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1, mb: 2 }}>
                <Typography variant="caption">{formatTime(currentTime)}</Typography>
                <Typography variant="caption">{formatTime(duration)}</Typography>
              </Box>

              {/* Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <IconButton onClick={togglePlay} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, width: 56, height: 56 }}>
                  {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayIcon sx={{ fontSize: 32 }} />}
                </IconButton>
              </Box>

              {/* Volume */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <IconButton size="small" onClick={toggleMute} sx={{ color: 'white' }}>
                  {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                </IconButton>
                <Slider
                  value={isMuted ? 0 : volume}
                  max={1}
                  step={0.05}
                  onChange={handleVolumeChange}
                  sx={{
                    flex: 1, color: 'white',
                    '& .MuiSlider-thumb': { width: 10, height: 10 },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Box>
            </Paper>

            {/* Transcript */}
            {test.transcript && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📝 Transcript:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {parseSsmlTranscript(test.transcript)}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Bài test này chưa có file audio.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ─────────────────────────────────────────────────

const AudioTestsPage: React.FC = () => {
  const [tests, setTests] = useState<AudioTestResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'publish' | 'reject'; test: AudioTestResponse } | null>(null);
  const [selectedTest, setSelectedTest] = useState<AudioTestResponse | null>(null);
  const [playerTest, setPlayerTest] = useState<AudioTestResponse | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [formData, setFormData] = useState({
    testName: '',
    topicId: '',
    transcript: '',
    audioUrl: '',
    duration: 60,
    passCondition: 70,
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false); // Added AI dialog state
  const [aiFormData, setAiFormData] = useState({ // Added AI form data state
    testName: '',
    topicId: '',
    difficulty: 'MEDIUM',
    questionCount: 5,
    duration: 10,
  });
  const [page] = useState(0);

  const [viewMode, setViewMode] = useState<'tests' | 'questions'>('tests');
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [questionDelOpen, setQuestionDelOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    content: '',
    answers: [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ] as AnswerRequest[],
  });

  const fetchTopics = useCallback(async () => {
    try {
      const result = await adminTopicApi.getAll(0, 100);
      setTopics(result.data.content);
    } catch { /* silent */ }
  }, []);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminAudioTestApi.getAll(
        page, 10, undefined,
        filterStatus || undefined,
        searchQuery || undefined
      );
      setTests(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách bài test');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, searchQuery]);

  const fetchQuestions = useCallback(async () => {
    if (!selectedTest) return;
    setLoadingQuestions(true);
    try {
      const result = await adminQuestionApi.getByTestId(selectedTest.testId);
      setQuestions(result.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách câu hỏi');
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedTest]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);
  useEffect(() => { fetchTests(); }, [fetchTests]);
  useEffect(() => {
    if (viewMode === 'questions' && selectedTest) {
      fetchQuestions();
    }
  }, [viewMode, selectedTest, fetchQuestions]);

  const handleOpenDialog = (test?: AudioTestResponse) => {
    if (test) {
      setSelectedTest(test);
      setFormData({
        testName: test.testName,
        topicId: String(test.topicId),
        transcript: test.transcript || '',
        audioUrl: test.audioUrl || '',
        duration: test.duration,
        passCondition: test.passCondition || 70,
      });
    } else {
      setSelectedTest(null);
      setFormData({ testName: '', topicId: '', transcript: '', audioUrl: '', duration: 60, passCondition: 70 });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTest(null);
  };

  const handleOpenQuestionDialog = (question?: QuestionResponse) => {
    if (question) {
      setSelectedQuestion(question);
      const answers: AnswerRequest[] = question.answers.map(a => ({
        content: a.content,
        isCorrect: a.isCorrect,
      }));
      while (answers.length < 4) answers.push({ content: '', isCorrect: false });
      setQuestionFormData({ content: question.content, answers });
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
    if (!selectedTest) return;
    setSubmitting(true);
    try {
      const validAnswers = questionFormData.answers.filter(a => a.content.trim());
      const payload = {
        content: questionFormData.content,
        testId: selectedTest.testId,
        answers: validAnswers,
      };
      if (selectedQuestion) {
        await adminQuestionApi.update(selectedQuestion.questionId, payload);
      } else {
        await adminQuestionApi.create(payload);
      }
      setQuestionDialogOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Thao tác câu hỏi thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionDelete = async () => {
    if (!selectedQuestion) return;
    setSubmitting(true);
    try {
      await adminQuestionApi.delete(selectedQuestion.questionId);
      setQuestionDelOpen(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Xóa câu hỏi thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        testName: formData.testName,
        topicId: Number(formData.topicId),
        transcript: formData.transcript || undefined,
        audioUrl: formData.audioUrl || undefined,
        duration: formData.duration,
        passCondition: formData.passCondition,
      };
      if (selectedTest) {
        await adminAudioTestApi.update(selectedTest.testId, payload);
      } else {
        await adminAudioTestApi.create(payload);
      }
      handleCloseDialog();
      fetchTests();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTest) return;
    setSubmitting(true);
    try {
      await adminAudioTestApi.delete(selectedTest.testId);
      setDeleteDialogOpen(false);
      setSelectedTest(null);
      fetchTests();
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishReject = async () => {
    if (!confirmAction) return;
    setSubmitting(true);
    try {
      if (confirmAction.type === 'publish') {
        await adminAudioTestApi.publish(confirmAction.test.testId);
      } else {
        await adminAudioTestApi.reject(confirmAction.test.testId);
      }
      setConfirmAction(null);
      fetchTests();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    setSubmitting(true);
    try {
      await adminAiTestApi.generate({
        testName: aiFormData.testName,
        topicId: Number(aiFormData.topicId),
        difficulty: aiFormData.difficulty,
        questionCount: aiFormData.questionCount,
        duration: aiFormData.duration,
      });
      setAiDialogOpen(false);
      fetchTests();
    } catch (err: any) {
      setError(err.message || 'Tạo bài test AI thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const questionColumns = [
    { id: 'questionId', label: 'ID', minWidth: 60 },
    { id: 'content', label: 'Nội dung câu hỏi', minWidth: 250 },
    {
      id: 'answers',
      label: 'Đáp án',
      minWidth: 200,
      format: (value: any[]) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value?.map((a: any, i: number) => (
            <Chip
              key={i}
              size="small"
              label={a.content}
              color={a.isCorrect ? 'success' : 'default'}
              variant={a.isCorrect ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: QuestionResponse) => (
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => handleOpenQuestionDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={() => {
              setSelectedQuestion(row);
              setQuestionDelOpen(true);
            }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const columns = [
    { id: 'testId', label: 'ID', minWidth: 60 },
    { id: 'testName', label: 'Tên bài test', minWidth: 150 },
    {
      id: 'topicName',
      label: 'Chủ đề',
      minWidth: 100,
      format: (value: string) => (
        <Chip label={value || 'N/A'} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'duration',
      label: 'Thời lượng',
      minWidth: 80,
      format: (value: number) => `${value} phút`,
    },
    {
      id: 'passCondition',
      label: 'Đạt',
      minWidth: 60,
      format: (value: number) => `${value}%`,
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      format: (value: string) => (
        <Chip
          label={statusLabels[value] || value}
          size="small"
          color={statusColors[value] || 'default'}
        />
      ),
    },
    { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 220,
      align: 'center' as const,
      format: (_: any, row: AudioTestResponse) => (
        <Box>
          {/* Audio Player Button */}
          {row.audioUrl && (
            <Tooltip title="Nghe audio">
              <IconButton
                size="small"
                color="info"
                onClick={() => { setPlayerTest(row); setPlayerOpen(true); }}
              >
                <HeadphonesIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Quản lý câu hỏi">
            <IconButton
              size="small"
              color="primary"
              onClick={() => { setSelectedTest(row); setViewMode('questions'); }}
            >
              <QuizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => handleOpenDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {(row.status === 'DRAFT' || row.status === 'PENDING_REVIEW') && (
            <Tooltip title="Xuất bản">
              <IconButton size="small" color="success" onClick={() => setConfirmAction({ type: 'publish', test: row })}>
                <PublishIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {row.status !== 'REJECTED' && row.status !== 'PUBLISHED' && (
            <Tooltip title="Từ chối">
              <IconButton size="small" color="warning" onClick={() => setConfirmAction({ type: 'reject', test: row })}>
                <RejectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => { setSelectedTest(row); setDeleteDialogOpen(true); }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title={viewMode === 'tests' ? "Quản lý Bài Test Nghe" : "Quản lý Câu hỏi"}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      {viewMode === 'tests' ? (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="DRAFT">Nháp</MenuItem>
                <MenuItem value="PENDING_REVIEW">Chờ duyệt</MenuItem>
                <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
                <MenuItem value="REJECTED">Đã từ chối</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AiIcon />}
                color="secondary"
                onClick={() => setAiDialogOpen(true)}
              >
                Tạo bằng AI
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Thêm bài test
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              rows={tests}
              searchPlaceholder="Tìm kiếm bài test..."
              onSearch={setSearchQuery}
              searchValue={searchQuery}
            />
          )}
        </>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<BackIcon />}
                onClick={() => setViewMode('tests')}
              >
                Trở về danh sách
              </Button>
              <Typography variant="h6" fontWeight={600}>
                Bài test: {selectedTest?.testName}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenQuestionDialog()}
            >
              Thêm câu hỏi
            </Button>
          </Box>

          {loadingQuestions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={questionColumns}
              rows={questions}
              searchPlaceholder="Tìm kiếm câu hỏi..."
              onSearch={() => { }}
              searchValue=""
            />
          )}
        </>
      )}

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999, flexDirection: 'column', gap: 2 }}
        open={submitting && aiDialogOpen}
      >
        <CircularProgress color="inherit" />
        <Typography>AI đang khởi tạo nội dung và âm thanh, vui lòng chờ trong giây lát...</Typography>
      </Backdrop>

      {/* Audio Player Dialog */}
      <AudioPlayerDialog
        open={playerOpen}
        test={playerTest}
        onClose={() => { setPlayerOpen(false); setPlayerTest(null); }}
      />

      <FormDialog
        open={dialogOpen}
        title={selectedTest ? 'Chỉnh sửa bài test' : 'Thêm bài test mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Tên bài test"
            value={formData.testName}
            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
            fullWidth required disabled={submitting}
          />
          <FormControl fullWidth required>
            <InputLabel>Chủ đề</InputLabel>
            <Select
              value={formData.topicId}
              label="Chủ đề"
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              disabled={submitting}
            >
              {topics.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.topicName} ({t.levelName})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Transcript"
            value={formData.transcript}
            onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
            fullWidth multiline rows={3} disabled={submitting}
          />
          <TextField
            label="Audio URL"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            fullWidth disabled={submitting}
            placeholder="https://s3.amazonaws.com/..."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Thời lượng (phút)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              fullWidth inputProps={{ min: 1 }} disabled={submitting}
            />
            <TextField
              label="Điểm đạt (%)"
              type="number"
              value={formData.passCondition}
              onChange={(e) => setFormData({ ...formData, passCondition: Number(e.target.value) })}
              fullWidth inputProps={{ min: 0, max: 100 }} disabled={submitting}
            />
          </Box>
        </Box>
      </FormDialog>

      <FormDialog
        open={aiDialogOpen}
        title="Tạo bài test bằng AI (AWS Poly + OpenAI)"
        onClose={() => setAiDialogOpen(false)}
        onSubmit={handleAiGenerate}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            AI sẽ tự động tạo Transcript, Câu hỏi và chuyển đổi sang Audio bằng giọng đọc tự nhiên.
          </Typography>
          <TextField
            label="Tên bài test"
            value={aiFormData.testName}
            onChange={(e) => setAiFormData({ ...aiFormData, testName: e.target.value })}
            fullWidth required disabled={submitting}
            placeholder="VD: Hội thoại đi chợ"
          />
          <FormControl fullWidth required>
            <InputLabel>Chủ đề</InputLabel>
            <Select
              value={aiFormData.topicId}
              label="Chủ đề"
              onChange={(e) => setAiFormData({ ...aiFormData, topicId: e.target.value })}
              disabled={submitting}
            >
              {topics.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.topicName} ({t.levelName})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Mức độ</InputLabel>
            <Select
              value={aiFormData.difficulty}
              label="Mức độ"
              onChange={(e) => setAiFormData({ ...aiFormData, difficulty: e.target.value })}
              disabled={submitting}
            >
              <MenuItem value="EASY">Dễ</MenuItem>
              <MenuItem value="MEDIUM">Trung bình</MenuItem>
              <MenuItem value="HARD">Khó</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Số câu hỏi"
              type="number"
              value={aiFormData.questionCount}
              onChange={(e) => setAiFormData({ ...aiFormData, questionCount: Number(e.target.value) })}
              fullWidth inputProps={{ min: 1, max: 10 }} disabled={submitting}
            />
            <TextField
              label="Độ dài (giây)"
              type="number"
              value={aiFormData.duration}
              onChange={(e) => setAiFormData({ ...aiFormData, duration: Number(e.target.value) })}
              fullWidth inputProps={{ min: 10, max: 180 }} disabled={submitting}
            />
          </Box>
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bài test "${selectedTest?.testName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'publish' ? 'Xác nhận xuất bản' : 'Xác nhận từ chối'}
        message={
          confirmAction?.type === 'publish'
            ? `Xuất bản bài test "${confirmAction?.test.testName}"?`
            : `Từ chối bài test "${confirmAction?.test.testName}"?`
        }
        onConfirm={handlePublishReject}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Question Form Dialog */}
      <FormDialog
        open={questionDialogOpen}
        title={selectedQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        onClose={() => setQuestionDialogOpen(false)}
        onSubmit={handleQuestionSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nội dung câu hỏi"
            value={questionFormData.content}
            onChange={(e) => setQuestionFormData({ ...questionFormData, content: e.target.value })}
            fullWidth required multiline rows={2} disabled={submitting}
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
                      disabled={submitting}
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
                  disabled={submitting}
                />
              </Box>
            ))}
          </RadioGroup>
        </Box>
      </FormDialog>

      {/* Question Delete Confirm Dialog */}
      <ConfirmDialog
        open={questionDelOpen}
        title="Xác nhận xóa câu hỏi"
        message={`Bạn có chắc chắn muốn xóa câu hỏi này?`}
        onConfirm={handleQuestionDelete}
        onCancel={() => setQuestionDelOpen(false)}
      />
    </MainLayout>
  );
};

export default AudioTestsPage;
