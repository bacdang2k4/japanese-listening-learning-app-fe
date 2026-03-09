import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme/theme';

// Admin pages
import Dashboard from './pages/Dashboard';
import LevelsPage from './pages/LevelsPage';
import TopicsPage from './pages/TopicsPage';
import VocabulariesPage from './pages/VocabulariesPage';
import VocabBanksPage from './pages/VocabBanksPage';
import AudioTestsPage from './pages/AudioTestsPage';
import LearnersPage from './pages/LearnersPage';
import ProfilesPage from './pages/ProfilesPage';
import TestResultsPage from './pages/TestResultsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import NotFound from './pages/NotFound';

// Admin auth guard
import AdminRouteGuard from './components/auth/AdminRouteGuard';

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
import Home from './pages/learner/Home';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Admin Login (public) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Routes (protected) */}
        <Route path="/admin">
          <Route index element={<AdminRouteGuard><Dashboard /></AdminRouteGuard>} />
          <Route path="levels" element={<AdminRouteGuard><LevelsPage /></AdminRouteGuard>} />
          <Route path="topics" element={<AdminRouteGuard><TopicsPage /></AdminRouteGuard>} />
          <Route path="vocabularies" element={<AdminRouteGuard><VocabulariesPage /></AdminRouteGuard>} />
          <Route path="vocab-banks" element={<AdminRouteGuard><VocabBanksPage /></AdminRouteGuard>} />
          <Route path="audio-tests" element={<AdminRouteGuard><AudioTestsPage /></AdminRouteGuard>} />
          <Route path="learners" element={<AdminRouteGuard><LearnersPage /></AdminRouteGuard>} />
          <Route path="profiles" element={<AdminRouteGuard><ProfilesPage /></AdminRouteGuard>} />
          <Route path="test-results" element={<AdminRouteGuard><TestResultsPage /></AdminRouteGuard>} />
        </Route>

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
