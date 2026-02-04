import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { mockVocabularies, mockTopics, mockLevels } from '../data/mockData';
import { Vocabulary } from '../types';

const VocabulariesPage: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>(mockVocabularies);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [formData, setFormData] = useState({
    topicId: '',
    word: '',
    reading: '',
    meaning: '',
    example: '',
    exampleMeaning: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredVocabs = vocabularies.filter((vocab) => {
    const matchesSearch =
      vocab.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.reading.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !filterTopic || vocab.topicId === filterTopic;
    return matchesSearch && matchesTopic;
  });

  const getTopicName = (topicId: string) => {
    const topic = mockTopics.find((t) => t.id === topicId);
    return topic?.name || 'N/A';
  };

  const handleOpenDialog = (vocab?: Vocabulary) => {
    if (vocab) {
      setSelectedVocab(vocab);
      setFormData({
        topicId: vocab.topicId,
        word: vocab.word,
        reading: vocab.reading,
        meaning: vocab.meaning,
        example: vocab.example,
        exampleMeaning: vocab.exampleMeaning,
      });
    } else {
      setSelectedVocab(null);
      setFormData({ topicId: '', word: '', reading: '', meaning: '', example: '', exampleMeaning: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVocab(null);
    setFormData({ topicId: '', word: '', reading: '', meaning: '', example: '', exampleMeaning: '' });
  };

  const handleSubmit = () => {
    if (selectedVocab) {
      setVocabularies(
        vocabularies.map((v) =>
          v.id === selectedVocab.id
            ? { ...v, ...formData, updatedAt: new Date() }
            : v
        )
      );
    } else {
      const newVocab: Vocabulary = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setVocabularies([...vocabularies, newVocab]);
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedVocab) {
      setVocabularies(vocabularies.filter((v) => v.id !== selectedVocab.id));
      setDeleteDialogOpen(false);
      setSelectedVocab(null);
    }
  };

  const handleExport = () => {
    const data = filteredVocabs.map((v) => ({
      Từ: v.word,
      'Cách đọc': v.reading,
      'Nghĩa': v.meaning,
      'Ví dụ': v.example,
      'Nghĩa ví dụ': v.exampleMeaning,
      'Chủ đề': getTopicName(v.topicId),
    }));
    const csv = [Object.keys(data[0]).join(','), ...data.map((row) => Object.values(row).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vocabularies.csv';
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle CSV import logic here
      alert('Tính năng import sẽ được xử lý. File: ' + file.name);
    }
  };

  const columns = [
    { id: 'word', label: 'Từ vựng', minWidth: 100 },
    { id: 'reading', label: 'Cách đọc', minWidth: 100 },
    { id: 'meaning', label: 'Nghĩa', minWidth: 150 },
    { id: 'example', label: 'Ví dụ', minWidth: 200 },
    {
      id: 'topicId',
      label: 'Chủ đề',
      minWidth: 100,
      format: (value: string) => getTopicName(value),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: Vocabulary) => (
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
                setSelectedVocab(row);
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
    <MainLayout title="Quản lý Từ vựng">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo Chủ đề</InputLabel>
          <Select
            value={filterTopic}
            label="Lọc theo Chủ đề"
            onChange={(e) => setFilterTopic(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {mockTopics.map((topic) => {
              const level = mockLevels.find((l) => l.id === topic.levelId);
              return (
                <MenuItem key={topic.id} value={topic.id}>
                  [{level?.name}] {topic.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleImportClick}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm từ vựng
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredVocabs}
        searchPlaceholder="Tìm kiếm từ vựng..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <FormDialog
        open={dialogOpen}
        title={selectedVocab ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Chủ đề</InputLabel>
            <Select
              value={formData.topicId}
              label="Chủ đề"
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
            >
              {mockTopics.map((topic) => {
                const level = mockLevels.find((l) => l.id === topic.levelId);
                return (
                  <MenuItem key={topic.id} value={topic.id}>
                    [{level?.name}] {topic.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Từ vựng (Kanji/Kana)"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              fullWidth
              required
              placeholder="VD: 家族"
            />
            <TextField
              label="Cách đọc (Hiragana)"
              value={formData.reading}
              onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
              fullWidth
              required
              placeholder="VD: かぞく"
            />
          </Box>
          <TextField
            label="Nghĩa tiếng Việt"
            value={formData.meaning}
            onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
            fullWidth
            required
            placeholder="VD: Gia đình"
          />
          <TextField
            label="Ví dụ (tiếng Nhật)"
            value={formData.example}
            onChange={(e) => setFormData({ ...formData, example: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="VD: 私の家族は四人です。"
          />
          <TextField
            label="Nghĩa ví dụ (tiếng Việt)"
            value={formData.exampleMeaning}
            onChange={(e) => setFormData({ ...formData, exampleMeaning: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="VD: Gia đình tôi có 4 người."
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa từ vựng "${selectedVocab?.word}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default VocabulariesPage;
