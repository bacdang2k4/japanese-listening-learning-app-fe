import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import NotFound from './pages/NotFound';

// Auth guards
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import LearnerRouteGuard from './components/auth/LearnerRouteGuard';

// Learner pages
import LoginPage from './pages/learner/LoginPage';
import RegisterPage from './pages/learner/RegisterPage';
import ProfileManagementPage from './pages/learner/ProfileManagementPage';
import OnboardingPage from './pages/learner/OnboardingPage';
import RoadmapPage from './pages/learner/RoadmapPage';
import VocabularyLearningPage from './pages/learner/VocabularyLearningPage';
import ProfilePage from './pages/learner/ProfilePage';
import TestHistoryPage from './pages/learner/TestHistoryPage';
import PracticeTestPage from './pages/learner/PracticeTestPage';
import Home from './pages/learner/Home';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Login redirects to unified login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

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

        {/* Learner Routes (protected) */}
        <Route path="/learn/onboarding" element={<LearnerRouteGuard><OnboardingPage /></LearnerRouteGuard>} />
        <Route path="/learn/profiles" element={<LearnerRouteGuard><ProfileManagementPage /></LearnerRouteGuard>} />
        <Route path="/learn" element={<LearnerRouteGuard><RoadmapPage /></LearnerRouteGuard>} />
        <Route path="/learn/topic/:topicId" element={<LearnerRouteGuard><VocabularyLearningPage /></LearnerRouteGuard>} />
        <Route path="/learn/topic/:topicId/practice" element={<LearnerRouteGuard><PracticeTestPage /></LearnerRouteGuard>} />
        <Route path="/learn/profile" element={<LearnerRouteGuard><ProfilePage /></LearnerRouteGuard>} />
        <Route path="/learn/history" element={<LearnerRouteGuard><TestHistoryPage /></LearnerRouteGuard>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
