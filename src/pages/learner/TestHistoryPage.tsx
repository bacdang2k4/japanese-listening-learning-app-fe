import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, Eye, CheckCircle2, XCircle, Filter, CalendarCheck, HelpCircle, BarChart3, Loader2 } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, TestHistoryResponse, TestResultDetailResponse, QuestionResultResponse } from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const TestHistoryPage: React.FC = () => {
  const profileId = getActiveProfileId();

  const [results, setResults] = useState<TestHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<TestResultDetailResponse | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestHistoryResponse | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await learnerApi.getTestHistory(profileId, page, 20);
      setResults(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load test history', err);
    } finally {
      setLoading(false);
    }
  }, [profileId, page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filteredResults = results.filter(r => {
    const matchesMode = modeFilter === 'all' || r.mode === modeFilter;
    const matchesSearch = r.testName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMode && matchesSearch;
  });

  const handleViewDetail = async (result: TestHistoryResponse) => {
    if (!profileId) return;
    setSelectedResult(result);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await learnerApi.getTestResult(result.resultId, profileId);
      setSelectedDetail(res.data);
    } catch (err) {
      console.error('Failed to load detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
    } catch { return dateStr; }
  };

  return (
    <LearnerLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-4">
          <div className="w-14 h-14 bg-gradient-to-br from-elsa-indigo-500 to-elsa-purple-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-elsa-indigo-500/20">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Lịch sử làm bài</h1>
            <p className="text-muted-foreground mt-1">Xem lại kết quả các bài thi đã hoàn thành</p>
          </div>
        </div>

        <Card className="mb-6 border-none shadow-elsa-sm rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-4 space-y-2">
                <label className="text-sm font-medium leading-none">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Tên bài thi..." className="pl-9 h-11" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Chế độ</label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="PRACTICE">Luyện tập</SelectItem>
                    <SelectItem value="EXAM">Thi thật</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-5 pb-0.5">
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge variant="secondary" className="px-3 py-1.5 text-sm font-normal bg-muted">
                    Tổng: <span className="font-bold ml-1">{filteredResults.length}</span>
                  </Badge>
                  <Badge className="px-3 py-1.5 text-sm font-normal bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                    Đạt: <span className="font-bold ml-1">{filteredResults.filter(r => r.isPassed).length}</span>
                  </Badge>
                  <Badge className="px-3 py-1.5 text-sm font-normal bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200">
                    Chưa đạt: <span className="font-bold ml-1">{filteredResults.filter(r => !r.isPassed).length}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-elsa-sm overflow-hidden animate-in fade-in duration-700 rounded-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-elsa-indigo-50/50">
                  <TableRow className="hover:bg-transparent border-elsa-indigo-100">
                    <TableHead className="font-bold">Tên bài thi</TableHead>
                    <TableHead className="font-bold text-center">Chế độ</TableHead>
                    <TableHead className="font-bold text-center">Điểm</TableHead>
                    <TableHead className="font-bold text-center">Kết quả</TableHead>
                    <TableHead className="font-bold text-center">Thời gian</TableHead>
                    <TableHead className="font-bold text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Không tìm thấy kết quả nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map(result => (
                      <TableRow key={result.resultId} className="cursor-default hover:bg-elsa-indigo-50/30 transition-colors">
                        <TableCell className="font-medium">{result.testName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-medium text-blue-600 border-blue-200 bg-blue-50">
                            Luyện tập
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-lg font-bold ${result.isPassed ? 'text-green-500' : 'text-red-500'}`}>{result.score}%</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {result.isPassed ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Đạt</Badge>
                          ) : (
                            <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Chưa đạt</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(result.createdAt)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(result)} className="text-elsa-indigo-600 hover:text-elsa-indigo-700 hover:bg-elsa-indigo-50 rounded-lg">
                            <Eye className="w-4 h-4 mr-1.5" /> Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Trước</Button>
            <span className="flex items-center text-sm text-muted-foreground px-3">Trang {page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Tiếp</Button>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[80vh] overflow-y-auto rounded-2xl">
            {selectedResult && (
              <>
                <div className={`h-2 w-full ${selectedResult.isPassed ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} />
                <div className="p-6">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-elsa-indigo-500" /> Chi tiết kết quả
                    </DialogTitle>
                  </DialogHeader>

                  {detailLoading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : selectedDetail ? (
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">{selectedDetail.testName}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-elsa-indigo-50/50 rounded-2xl p-4 text-center border border-elsa-indigo-100">
                          <div className={`text-4xl font-black mb-1 ${selectedDetail.isPassed ? 'text-green-500' : 'text-red-500'}`}>{selectedDetail.score}%</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Điểm số</div>
                        </div>
                        <div className="bg-elsa-indigo-50/50 rounded-2xl p-4 text-center border border-elsa-indigo-100">
                          <div className="text-4xl font-black text-elsa-indigo-600 mb-1">
                            {selectedDetail.questionResults.filter(q => q.isCorrect).length}
                            <span className="text-2xl text-muted-foreground font-medium">/{selectedDetail.questionResults.length}</span>
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Câu đúng</div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center py-3 border-b">
                          <span className="text-muted-foreground flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Kết quả:</span>
                          {selectedDetail.isPassed ? (
                            <div className="flex items-center text-green-600 font-bold"><CheckCircle2 className="w-5 h-5 mr-1" /> Đạt</div>
                          ) : (
                            <div className="flex items-center text-red-600 font-bold"><XCircle className="w-5 h-5 mr-1" /> Chưa đạt</div>
                          )}
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                          <span className="text-muted-foreground flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Thời gian làm bài:</span>
                          <span className="font-medium">{selectedDetail.totalTime ? `${Math.floor(selectedDetail.totalTime / 60)} phút ${selectedDetail.totalTime % 60}s` : 'N/A'}</span>
                        </div>
                      </div>

                      {selectedDetail.questionResults.length > 0 && (
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Chi tiết câu hỏi</h4>
                          <div className="space-y-2">
                            {selectedDetail.questionResults.map((qr, i) => (
                              <div key={qr.questionId} className={`p-3.5 rounded-xl border text-sm ${qr.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="font-medium mb-1">{i + 1}. {qr.questionContent}</p>
                                <div className="flex flex-col gap-1 text-xs">
                                  <span>Bạn chọn: <span className="font-semibold">{qr.selectedAnswer || '(bỏ trống)'}</span></span>
                                  {!qr.isCorrect && <span>Đáp án: <span className="font-semibold text-green-700">{qr.correctAnswer}</span></span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button className="w-full h-12 text-base mt-6 rounded-xl bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700" onClick={() => setDetailOpen(false)}>Đóng</Button>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

export default TestHistoryPage;
