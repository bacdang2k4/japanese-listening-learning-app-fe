import React, { useState } from 'react';
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
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { mockQuestions, mockAudioTests, mockLevels } from '../data/mockData';
import { Question } from '../types';

const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTest, setFilterTest] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    testId: '',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    order: 1,
  });

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTest = !filterTest || q.testId === filterTest;
    return matchesSearch && matchesTest;
  });

  const getTestName = (testId: string) => {
    const test = mockAudioTests.find((t) => t.id === testId);
    return test?.name || 'N/A';
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setSelectedQuestion(question);
      setFormData({
        testId: question.testId,
        content: question.content,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        order: question.order,
      });
    } else {
      setSelectedQuestion(null);
      setFormData({
        testId: '',
        content: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        order: questions.length + 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedQuestion(null);
    setFormData({ testId: '', content: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', order: 1 });
  };

  const handleSubmit = () => {
    if (selectedQuestion) {
      setQuestions(
        questions.map((q) =>
          q.id === selectedQuestion.id ? { ...q, ...formData } : q
        )
      );
    } else {
      const newQuestion: Question = {
        id: String(Date.now()),
        ...formData,
      };
      setQuestions([...questions, newQuestion]);
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedQuestion) {
      setQuestions(questions.filter((q) => q.id !== selectedQuestion.id));
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const columns = [
    { id: 'order', label: 'STT', minWidth: 60 },
    {
      id: 'testId',
      label: 'Bài test',
      minWidth: 150,
      format: (value: string) => getTestName(value),
    },
    { id: 'content', label: 'Nội dung câu hỏi', minWidth: 300 },
    {
      id: 'correctAnswer',
      label: 'Đáp án đúng',
      minWidth: 120,
      format: (value: number, row: Question) => (
        <Chip
          label={row.options[value]}
          size="small"
          variant="outlined"
          sx={{ color: '#3da258', borderColor: '#298d44', fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: Question) => (
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => handleOpenDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedQuestion(row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title="Quản lý Câu hỏi">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Lọc theo Bài test</InputLabel>
          <Select
            value={filterTest}
            label="Lọc theo Bài test"
            onChange={(e) => setFilterTest(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {mockAudioTests.map((test) => {
              const level = mockLevels.find((l) => l.id === test.levelId);
              return (
                <MenuItem key={test.id} value={test.id}>
                  [{level?.name}] {test.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm câu hỏi
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredQuestions}
        searchPlaceholder="Tìm kiếm câu hỏi..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <FormDialog
        open={dialogOpen}
        title={selectedQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Bài test</InputLabel>
            <Select
              value={formData.testId}
              label="Bài test"
              onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
            >
              {mockAudioTests.map((test) => {
                const level = mockLevels.find((l) => l.id === test.levelId);
                return (
                  <MenuItem key={test.id} value={test.id}>
                    [{level?.name}] {test.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            label="Nội dung câu hỏi"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
            placeholder="VD: Người đàn ông nói gì về thời tiết?"
          />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Các phương án trả lời:
          </Typography>
          <RadioGroup
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
          >
            {formData.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FormControlLabel
                  value={index}
                  control={<Radio />}
                  label=""
                  sx={{ mr: 0 }}
                />
                <TextField
                  label={`Phương án ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  fullWidth
                  size="small"
                  required
                  placeholder={`Nhập phương án ${index + 1}`}
                />
              </Box>
            ))}
          </RadioGroup>
          <Typography variant="caption" color="text.secondary">
            * Chọn radio để đánh dấu đáp án đúng
          </Typography>
          <TextField
            label="Giải thích đáp án"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Giải thích tại sao đáp án này đúng..."
          />
          <TextField
            label="Thứ tự câu hỏi"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            sx={{ width: 150 }}
            inputProps={{ min: 1 }}
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default QuestionsPage;
