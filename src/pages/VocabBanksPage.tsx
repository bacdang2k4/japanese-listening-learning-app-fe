import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  PlaylistAdd as PlaylistAddIcon,
  RemoveCircleOutline as RemoveIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  adminVocabBankApi,
  adminVocabularyApi,
  adminTopicApi,
  VocabBankResponse,
  VocabBankVocabularyResponse,
  TopicResponse,
  VocabularyResponse,
} from '../services/api';

const VocabBanksPage: React.FC = () => {
  const [vocabBanks, setVocabBanks] = useState<VocabBankResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<number | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<VocabBankResponse | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', topicId: '' as string });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);

  // Detail view state
  const [detailBank, setDetailBank] = useState<VocabBankResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add vocab dialog state
  const [addVocabDialogOpen, setAddVocabDialogOpen] = useState(false);
  const [allVocabularies, setAllVocabularies] = useState<VocabularyResponse[]>([]);
  const [vocabSearchQuery, setVocabSearchQuery] = useState('');
  const [selectedVocabIds, setSelectedVocabIds] = useState<Set<number>>(new Set());
  const [vocabLoading, setVocabLoading] = useState(false);

  // Remove vocab confirm
  const [removeVocabConfirmOpen, setRemoveVocabConfirmOpen] = useState(false);
  const [vocabToRemove, setVocabToRemove] = useState<VocabBankVocabularyResponse | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      const result = await adminTopicApi.getAll(0, 100);
      setTopics(result.data.content);
    } catch { /* silent */ }
  }, []);

  const fetchVocabBanks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminVocabBankApi.getAll(
        page, 10,
        filterTopic || undefined,
        searchQuery || undefined
      );
      setVocabBanks(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách ngân hàng từ vựng');
    } finally {
      setLoading(false);
    }
  }, [page, filterTopic, searchQuery]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);
  useEffect(() => { fetchVocabBanks(); }, [fetchVocabBanks]);

  const fetchBankDetail = useCallback(async (bankId: number) => {
    setDetailLoading(true);
    try {
      const result = await adminVocabBankApi.getById(bankId);
      setDetailBank(result.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết ngân hàng từ vựng');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ─── CRUD Handlers ───────────────────────────────────────────

  const handleOpenDialog = (bank?: VocabBankResponse) => {
    if (bank) {
      setSelectedBank(bank);
      setFormData({
        title: bank.title,
        description: bank.description || '',
        topicId: String(bank.topicId),
      });
    } else {
      setSelectedBank(null);
      setFormData({ title: '', description: '', topicId: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBank(null);
    setFormData({ title: '', description: '', topicId: '' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        topicId: Number(formData.topicId),
      };
      if (selectedBank) {
        await adminVocabBankApi.update(selectedBank.id, payload);
      } else {
        await adminVocabBankApi.create(payload);
      }
      handleCloseDialog();
      fetchVocabBanks();
      if (detailBank && selectedBank && selectedBank.id === detailBank.id) {
        fetchBankDetail(detailBank.id);
      }
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBank) return;
    setSubmitting(true);
    try {
      await adminVocabBankApi.delete(selectedBank.id);
      setDeleteDialogOpen(false);
      if (detailBank && detailBank.id === selectedBank.id) {
        setDetailBank(null);
      }
      setSelectedBank(null);
      fetchVocabBanks();
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Detail View Handlers ─────────────────────────────────────

  const handleViewDetail = (bank: VocabBankResponse) => {
    fetchBankDetail(bank.id);
  };

  const handleBackToList = () => {
    setDetailBank(null);
  };

  // ─── Add Vocab to Bank ────────────────────────────────────────

  const handleOpenAddVocabDialog = async () => {
    setAddVocabDialogOpen(true);
    setVocabLoading(true);
    setSelectedVocabIds(new Set());
    setVocabSearchQuery('');
    try {
      const result = await adminVocabularyApi.getAll(0, 100);
      const existingIds = new Set(
        (detailBank?.vocabularies || []).map((v) => v.vocabId)
      );
      setAllVocabularies(result.data.content.filter((v) => !existingIds.has(v.id)));
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách từ vựng');
    } finally {
      setVocabLoading(false);
    }
  };

  const handleToggleVocab = (vocabId: number) => {
    setSelectedVocabIds((prev) => {
      const next = new Set(prev);
      if (next.has(vocabId)) next.delete(vocabId);
      else next.add(vocabId);
      return next;
    });
  };

  const handleAddVocabsToBank = async () => {
    if (!detailBank || selectedVocabIds.size === 0) return;
    setSubmitting(true);
    try {
      const currentMax = (detailBank.vocabularies || []).reduce(
        (max, v) => Math.max(max, v.vocabOrder), 0
      );
      const items = Array.from(selectedVocabIds).map((vocabId, index) => ({
        vocabId,
        vocabOrder: currentMax + index + 1,
      }));
      await adminVocabBankApi.addVocabularies(detailBank.id, items);
      setAddVocabDialogOpen(false);
      fetchBankDetail(detailBank.id);
    } catch (err: any) {
      setError(err.message || 'Thêm từ vựng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Remove Vocab from Bank ───────────────────────────────────

  const handleRemoveVocab = async () => {
    if (!detailBank || !vocabToRemove) return;
    setSubmitting(true);
    try {
      await adminVocabBankApi.removeVocabulary(detailBank.id, vocabToRemove.vocabId);
      setRemoveVocabConfirmOpen(false);
      setVocabToRemove(null);
      fetchBankDetail(detailBank.id);
    } catch (err: any) {
      setError(err.message || 'Xóa từ vựng khỏi bank thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Filtered vocabs for add dialog ───────────────────────────

  const filteredAddVocabs = allVocabularies.filter((v) => {
    if (!vocabSearchQuery) return true;
    const q = vocabSearchQuery.toLowerCase();
    return (
      v.word.toLowerCase().includes(q) ||
      (v.kana || '').toLowerCase().includes(q) ||
      (v.romaji || '').toLowerCase().includes(q) ||
      (v.meaning || '').toLowerCase().includes(q)
    );
  });

  // ─── Table Columns ────────────────────────────────────────────

  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    { id: 'title', label: 'Tiêu đề', minWidth: 150 },
    {
      id: 'description',
      label: 'Mô tả',
      minWidth: 200,
      format: (value: string | null) => value || '—',
    },
    {
      id: 'topicName',
      label: 'Chủ đề',
      minWidth: 100,
      format: (value: string | null) => (
        <Chip label={value || 'N/A'} size="small" color="primary" variant="outlined" />
      ),
    },
    { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 140,
      align: 'center' as const,
      format: (_: any, row: VocabBankResponse) => (
        <Box>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={() => handleViewDetail(row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
                setSelectedBank(row);
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

  // ─── Detail View ──────────────────────────────────────────────

  if (detailBank) {
    const vocabs = detailBank.vocabularies || [];
    return (
      <MainLayout title={`Ngân hàng từ vựng: ${detailBank.title}`}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
            Quay lại danh sách
          </Button>
          <Button
            variant="contained"
            startIcon={<PlaylistAddIcon />}
            onClick={handleOpenAddVocabDialog}
          >
            Thêm từ vựng vào bank
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Chủ đề</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {detailBank.topicName || 'N/A'}
          </Typography>
          {detailBank.description && (
            <>
              <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
              <Typography variant="body1">{detailBank.description}</Typography>
            </>
          )}
        </Paper>

        {detailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : vocabs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Chưa có từ vựng trong ngân hàng này. Nhấn "Thêm từ vựng vào bank" để bắt đầu.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Từ vựng</TableCell>
                  <TableCell>Kana</TableCell>
                  <TableCell>Romaji</TableCell>
                  <TableCell>Nghĩa</TableCell>
                  <TableCell>Ví dụ</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vocabs.map((v) => (
                  <TableRow key={v.vocabId} hover>
                    <TableCell>{v.vocabOrder}</TableCell>
                    <TableCell><strong>{v.word}</strong></TableCell>
                    <TableCell>{v.kana || '—'}</TableCell>
                    <TableCell>{v.romaji || '—'}</TableCell>
                    <TableCell>{v.meaning || '—'}</TableCell>
                    <TableCell>{v.exampleSentence || '—'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xóa khỏi bank">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setVocabToRemove(v);
                            setRemoveVocabConfirmOpen(true);
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Vocab Dialog */}
        <Dialog
          open={addVocabDialogOpen}
          onClose={() => setAddVocabDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Thêm từ vựng vào ngân hàng</DialogTitle>
          <DialogContent>
            <TextField
              size="small"
              placeholder="Tìm kiếm từ vựng..."
              value={vocabSearchQuery}
              onChange={(e) => setVocabSearchQuery(e.target.value)}
              fullWidth
              sx={{ my: 2 }}
            />
            {vocabLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredAddVocabs.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Không tìm thấy từ vựng nào để thêm.
              </Typography>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Từ vựng</TableCell>
                      <TableCell>Kana</TableCell>
                      <TableCell>Romaji</TableCell>
                      <TableCell>Nghĩa</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAddVocabs.map((v) => (
                      <TableRow
                        key={v.id}
                        hover
                        onClick={() => handleToggleVocab(v.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedVocabIds.has(v.id)} />
                        </TableCell>
                        <TableCell><strong>{v.word}</strong></TableCell>
                        <TableCell>{v.kana || '—'}</TableCell>
                        <TableCell>{v.romaji || '—'}</TableCell>
                        <TableCell>{v.meaning || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {selectedVocabIds.size > 0 && (
              <Typography sx={{ mt: 1 }} variant="body2" color="primary">
                Đã chọn {selectedVocabIds.size} từ vựng
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAddVocabDialogOpen(false)} variant="outlined" color="inherit">
              Hủy
            </Button>
            <Button
              onClick={handleAddVocabsToBank}
              variant="contained"
              disabled={selectedVocabIds.size === 0 || submitting}
            >
              Thêm vào bank
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Vocab Confirm */}
        <ConfirmDialog
          open={removeVocabConfirmOpen}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa từ "${vocabToRemove?.word}" khỏi ngân hàng này?`}
          onConfirm={handleRemoveVocab}
          onCancel={() => {
            setRemoveVocabConfirmOpen(false);
            setVocabToRemove(null);
          }}
        />
      </MainLayout>
    );
  }

  // ─── List View ────────────────────────────────────────────────

  return (
    <MainLayout title="Quản lý Ngân hàng Từ vựng">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo Chủ đề</InputLabel>
          <Select
            value={filterTopic}
            label="Lọc theo Chủ đề"
            onChange={(e) => setFilterTopic(e.target.value as number | '')}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.topicName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm ngân hàng
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={vocabBanks}
          searchPlaceholder="Tìm kiếm ngân hàng từ vựng..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      {/* Create/Edit Dialog */}
      <FormDialog
        open={dialogOpen}
        title={selectedBank ? 'Chỉnh sửa ngân hàng từ vựng' : 'Thêm ngân hàng từ vựng mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Chủ đề</InputLabel>
            <Select
              value={formData.topicId}
              label="Chủ đề"
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              disabled={submitting}
            >
              {topics.map((topic) => (
                <MenuItem key={topic.id} value={String(topic.id)}>
                  {topic.topicName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            placeholder="VD: Từ vựng N5 - Gia đình"
            disabled={submitting}
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            placeholder="Mô tả ngắn về ngân hàng từ vựng..."
            disabled={submitting}
          />
        </Box>
      </FormDialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa ngân hàng "${selectedBank?.title}"? Tất cả liên kết từ vựng sẽ bị xóa.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default VocabBanksPage;
