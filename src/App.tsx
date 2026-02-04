import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme/theme';

// Admin pages
import Dashboard from './pages/Dashboard';
import LevelsPage from './pages/LevelsPage';
import TopicsPage from './pages/TopicsPage';
import VocabulariesPage from './pages/VocabulariesPage';
import AudioTestsPage from './pages/AudioTestsPage';
import QuestionsPage from './pages/QuestionsPage';
import LearnersPage from './pages/LearnersPage';
import ProfilesPage from './pages/ProfilesPage';
import TestResultsPage from './pages/TestResultsPage';
import NotFound from './pages/NotFound';

// Learner pages
import LoginPage from './pages/learner/LoginPage';
import RegisterPage from './pages/learner/RegisterPage';
import LevelSelectionPage from './pages/learner/LevelSelectionPage';
import TopicSelectionPage from './pages/learner/TopicSelectionPage';
import VocabularyLearningPage from './pages/learner/VocabularyLearningPage';
import ProfilePage from './pages/learner/ProfilePage';
import TestHistoryPage from './pages/learner/TestHistoryPage';
import PracticeTestPage from './pages/learner/PracticeTestPage';
import ExamTestPage from './pages/learner/ExamTestPage';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/vocabularies" element={<VocabulariesPage />} />
        <Route path="/audio-tests" element={<AudioTestsPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/learners" element={<LearnersPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/test-results" element={<TestResultsPage />} />

        {/* Learner Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/learn" element={<LevelSelectionPage />} />
        <Route path="/learn/level/:levelId/topics" element={<TopicSelectionPage />} />
        <Route path="/learn/topic/:topicId" element={<VocabularyLearningPage />} />
        <Route path="/learn/topic/:topicId/practice" element={<PracticeTestPage />} />
        <Route path="/learn/topic/:topicId/exam" element={<ExamTestPage />} />
        <Route path="/learn/profile" element={<ProfilePage />} />
        <Route path="/learn/history" element={<TestHistoryPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
