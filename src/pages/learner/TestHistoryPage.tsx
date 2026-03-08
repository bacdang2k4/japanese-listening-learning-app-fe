import React, { useState } from 'react';
import { History, Search, Eye, CheckCircle2, XCircle, Filter, CalendarCheck, HelpCircle, BarChart3 } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockTestResults, mockAudioTests, mockQuestions } from '../../data/mockData';
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
    .filter(r => r.learnerId === '1') // Current user mock id
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
      <div className="max-w-6xl mx-auto py-8">

        {/* Header content */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Lịch sử làm bài</h1>
            <p className="text-muted-foreground mt-1">Xem lại kết quả các bài thi đã hoàn thành</p>
          </div>
        </div>

        {/* Filters and Stats */}
        <Card className="mb-6 border-none shadow-md animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

              <div className="md:col-span-4 space-y-2">
                <label className="text-sm font-medium leading-none">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tên bài thi..."
                    className="pl-9 h-11"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Chế độ</label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Practice">Luyện tập</SelectItem>
                    <SelectItem value="Exam">Thi thật</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-5 pb-0.5">
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge variant="secondary" className="px-3 py-1.5 text-sm font-normal bg-muted">
                    Tổng: <span className="font-bold ml-1">{filteredResults.length}</span>
                  </Badge>
                  <Badge className="px-3 py-1.5 text-sm font-normal bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                    Đạt: <span className="font-bold ml-1">{filteredResults.filter(r => r.passed).length}</span>
                  </Badge>
                  <Badge className="px-3 py-1.5 text-sm font-normal bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200">
                    Chưa đạt: <span className="font-bold ml-1">{filteredResults.filter(r => !r.passed).length}</span>
                  </Badge>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="border-none shadow-md overflow-hidden animate-in fade-in duration-700">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
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
                      Không tìm thấy kết quả nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id} className="cursor-default hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-base">{result.testName}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{result.correctAnswers}/{result.totalQuestions} câu đúng</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`font-medium ${result.mode === 'Practice'
                            ? 'text-blue-600 border-blue-200 bg-blue-50'
                            : 'text-orange-600 border-orange-200 bg-orange-50'
                          }`}>
                          {result.mode === 'Practice' ? 'Luyện tập' : 'Thi thật'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-lg font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                          {result.score}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.passed ? (
                          <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Đạt</Badge>
                        ) : (
                          <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Chưa đạt</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(result.completedAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(result)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            {selectedResult && (
              <>
                <div className={`h-2 w-full ${selectedResult.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="p-6">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      Chi tiết kết quả
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {selectedResult.testName}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-2xl p-4 text-center border">
                        <div className={`text-4xl font-black mb-1 ${selectedResult.passed ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedResult.score}%
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Điểm số</div>
                      </div>
                      <div className="bg-muted/50 rounded-2xl p-4 text-center border">
                        <div className="text-4xl font-black text-primary mb-1">
                          {selectedResult.correctAnswers}
                          <span className="text-2xl text-muted-foreground font-medium">/{selectedResult.totalQuestions}</span>
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Câu đúng</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Chế độ thi:</span>
                      <Badge variant="outline" className={`font-medium ${selectedResult.mode === 'Practice'
                          ? 'text-blue-600 border-blue-200 bg-blue-50'
                          : 'text-orange-600 border-orange-200 bg-orange-50'
                        }`}>
                        {selectedResult.mode === 'Practice' ? 'Luyện tập' : 'Thi thật'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Kết quả:</span>
                      {selectedResult.passed ? (
                        <div className="flex items-center text-green-600 font-bold"><CheckCircle2 className="w-5 h-5 mr-1" /> Đạt</div>
                      ) : (
                        <div className="flex items-center text-red-600 font-bold"><XCircle className="w-5 h-5 mr-1" /> Chưa đạt</div>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <span className="text-muted-foreground flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Hoàn thành lúc:</span>
                      <span className="font-medium text-foreground">{formatDate(selectedResult.completedAt)}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button className="w-full h-12 text-base" onClick={() => setDetailOpen(false)}>Đóng</Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

// Simple wrapper icon to avoid import issues
const SettingsIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

export default TestHistoryPage;
