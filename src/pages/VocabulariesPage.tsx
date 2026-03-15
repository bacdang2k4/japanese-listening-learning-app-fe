import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { formatBackendDateTime } from '../lib/dateUtils';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { adminVocabularyApi, VocabularyResponse } from '../services/api';

const VocabulariesPage: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyResponse | null>(null);
  const [formData, setFormData] = useState({
    word: '',
    kana: '',
    romaji: '',
    meaning: '',
    exampleSentence: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);

  const fetchVocabularies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminVocabularyApi.getAll(
        page, 10,
        searchQuery || undefined
      );
      setVocabularies(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách từ vựng');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => { fetchVocabularies(); }, [fetchVocabularies]);

  const handleOpenDialog = (vocab?: VocabularyResponse) => {
    if (vocab) {
      setSelectedVocab(vocab);
      setFormData({
        word: vocab.word,
        kana: vocab.kana || '',
        romaji: vocab.romaji || '',
        meaning: vocab.meaning || '',
        exampleSentence: vocab.exampleSentence || '',
      });
    } else {
      setSelectedVocab(null);
      setFormData({ word: '', kana: '', romaji: '', meaning: '', exampleSentence: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVocab(null);
    setFormData({ word: '', kana: '', romaji: '', meaning: '', exampleSentence: '' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        word: formData.word,
        kana: formData.kana || undefined,
        romaji: formData.romaji || undefined,
        meaning: formData.meaning || undefined,
        exampleSentence: formData.exampleSentence || undefined,
      };
      if (selectedVocab) {
        await adminVocabularyApi.update(selectedVocab.id, payload);
      } else {
        await adminVocabularyApi.create(payload);
      }
      handleCloseDialog();
      fetchVocabularies();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVocab) return;
    setSubmitting(true);
    try {
      await adminVocabularyApi.delete(selectedVocab.id);
      setDeleteDialogOpen(false);
      setSelectedVocab(null);
      fetchVocabularies();
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    { id: 'word', label: 'Từ vựng', minWidth: 100 },
    { id: 'kana', label: 'Kana', minWidth: 100 },
    { id: 'romaji', label: 'Romaji', minWidth: 100 },
    { id: 'meaning', label: 'Nghĩa', minWidth: 150 },
    {
      id: 'exampleSentence',
      label: 'Ví dụ',
      minWidth: 200,
      format: (value: string | null) => value || '—',
    },
    { id: 'createdAt', label: 'Ngày tạo', minWidth: 150, format: (value: any) => formatBackendDateTime(value) },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: VocabularyResponse) => (
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm từ vựng
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={vocabularies}
          searchPlaceholder="Tìm kiếm từ vựng (word, kana, romaji, meaning)..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      <FormDialog
        open={dialogOpen}
        title={selectedVocab ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Từ vựng (Kanji/Kana)"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              fullWidth
              required
              placeholder="VD: 家族"
              disabled={submitting}
            />
            <TextField
              label="Kana (Hiragana)"
              value={formData.kana}
              onChange={(e) => setFormData({ ...formData, kana: e.target.value })}
              fullWidth
              placeholder="VD: かぞく"
              disabled={submitting}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Romaji"
              value={formData.romaji}
              onChange={(e) => setFormData({ ...formData, romaji: e.target.value })}
              fullWidth
              placeholder="VD: kazoku"
              disabled={submitting}
            />
            <TextField
              label="Nghĩa"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              fullWidth
              placeholder="VD: Gia đình"
              disabled={submitting}
            />
          </Box>
          <TextField
            label="Ví dụ"
            value={formData.exampleSentence}
            onChange={(e) => setFormData({ ...formData, exampleSentence: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="VD: 私の家族は四人です。"
            disabled={submitting}
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
