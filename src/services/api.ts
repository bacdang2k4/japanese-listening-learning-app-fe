// API service for JPLearning Backend
// Base URL is proxied via Vite dev server config → /api → http://localhost:8080/api

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// ─── Generic Types ────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

export interface PaginationResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

// ─── Auth Types ───────────────────────────────────────────────

export interface LearnerLoginRequest {
    username: string;
    password: string;
}

export interface LearnerRegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface LearnerAuthResponse {
    accessToken: string;
    tokenType: string;
    learnerId: number;
    /** First profile ID if exists; null nếu chưa có profile (cần onboarding) */
    profileId: number | null;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    /** Danh sách profiles - FE: empty → onboarding, có data → chọn profile */
    profiles?: ProfileResponse[];
}

export interface RegisterResponse {
    learnerId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export interface AdminLoginRequest {
    username: string;
    password: string;
}

export interface AdminAuthResponse {
    accessToken: string;
    tokenType: string;
    adminId: number;
    username: string;
    role: string;
}

// ─── Level Types ──────────────────────────────────────────────

export interface LevelRequest {
    levelName: string;
}

export interface LevelResponse {
    id: number;
    levelName: string;
    adminId: number;
    adminName: string;
    createdAt: string;
}

// ─── Topic Types ──────────────────────────────────────────────

export interface TopicRequest {
    topicName: string;
    levelId: number;
    topicOrder?: number;
}

export interface TopicResponse {
    id: number;
    topicName: string;
    levelId: number;
    levelName: string;
    topicOrder: number;
    isUnlocked?: boolean | null;
    createdAt: string;
}

// ─── AudioTest Types ──────────────────────────────────────────

export interface AudioTestRequest {
    testName: string;
    topicId: number;
    transcript?: string;
    audioUrl?: string;
    duration: number;
    passCondition?: number;
}

export interface AudioTestResponse {
    testId: number;
    testName: string;
    topicId: number;
    topicName: string;
    transcript: string;
    audioUrl: string;
    duration: number;
    passCondition: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Question / Answer Types ──────────────────────────────────

export interface AnswerRequest {
    content: string;
    isCorrect: boolean;
}

export interface AnswerResponse {
    answerId: number;
    content: string;
    isCorrect: boolean;
}

export interface QuestionRequest {
    content: string;
    testId: number;
    answers: AnswerRequest[];
}

export interface QuestionResponse {
    questionId: number;
    content: string;
    testId: number;
    answers: AnswerResponse[];
}

// ─── Vocabulary Types ─────────────────────────────────────────

export interface VocabularyRequest {
    word: string;
    kana?: string;
    romaji?: string;
    meaning?: string;
    exampleSentence?: string;
}

export interface VocabularyResponse {
    id: number;
    word: string;
    kana: string | null;
    romaji: string | null;
    meaning: string | null;
    exampleSentence: string | null;
    createdAt: string;
}

// ─── VocabBank Types ──────────────────────────────────────────

export interface VocabBankRequest {
    title: string;
    description?: string;
    topicId: number;
}

export interface VocabBankVocabularyResponse {
    vocabId: number;
    word: string;
    kana: string | null;
    romaji: string | null;
    meaning: string | null;
    exampleSentence: string | null;
    vocabOrder: number;
}

export interface VocabBankResponse {
    id: number;
    title: string;
    description: string | null;
    topicId: number;
    topicName: string | null;
    vocabularies: VocabBankVocabularyResponse[] | null;
    createdAt: string;
}

export interface VocabBankVocabularyRequest {
    vocabId: number;
    vocabOrder: number;
}

// ─── Learner Types ───────────────────────────────────────────

export interface LearnerResponse {
    id: number;
    username: string;
    email: string | null;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    status: 'ACTIVE' | 'LOCKED';
    createdAt: string;
}

// ─── Admin Profile / Test Result Types ────────────────────────

export interface AdminProfileResponse {
    profileId: number;
    learnerId: number;
    learnerName: string;
    learnerEmail: string | null;
    learnerUsername: string;
    status: string;
    completedLevels: number;
    completedTopics: number;
    totalScore: number;
    startDate: string;
}

export interface AdminTestResultResponse {
    resultId: number;
    learnerId: number;
    learnerName: string;
    learnerEmail: string | null;
    testName: string;
    levelName: string | null;
    topicName: string | null;
    mode: string;
    score: number;
    isPassed: boolean;
    totalTime: number;
    completedAt: string | null;
}

// ─── AI Test Types ────────────────────────────────────────────

export interface AiGenerateRequest {
    topicId: number;
    testName: string;
    difficulty?: string;
    questionCount: number;
    duration: number;
}

export interface AiRejectRequest {
    comment: string;
}

export interface AiTestResponse {
    testId: number;
    testName: string;
    transcript: string;
    topicId: number;
    status: string;
    audioUrl: string;
    questions: QuestionResponse[];
}

export interface AiGenerationLogResponse {
    id: number;
    testId: number | null;
    testName: string | null;
    model: string | null;
    status: string | null;
    generatedAt: string;
}

// ─── Learner Test Flow Types ─────────────────────────────────

export interface StartTestRequest {
    profileId: number;
    mode: string;
}

export interface StartTestResponse {
    resultId: number;
    profileId: number;
    testId: number;
    testName: string;
    audioUrl: string | null;
    duration: number | null;
    passCondition: number | null;
    totalQuestions: number | null;
    mode: string;
    status: string;
    startedAt: string;
}

export interface LearnerAnswerRequest {
    questionId: number;
    selectedAnswerId: number | null;
}

export interface SubmitTestRequest {
    profileId: number;
    answers: LearnerAnswerRequest[];
}

export interface SubmitTestResponse {
    resultId: number;
    score: number;
    isPassed: boolean;
    status: string;
}

export interface TestSummaryResponse {
    testId: number;
    testName: string;
    duration: number | null;
    passCondition: number | null;
}

export interface LearnerAnswerOption {
    answerId: number;
    content: string;
    answerOrder: number | null;
    isCorrect: boolean | null;
}

export interface LearnerQuestionResponse {
    questionId: number;
    content: string;
    questionOrder: number | null;
    answers: LearnerAnswerOption[];
}

export interface TestHistoryResponse {
    resultId: number;
    testName: string;
    mode: string;
    score: number;
    isPassed: boolean;
    createdAt: string;
}

export interface QuestionResultResponse {
    questionId: number;
    questionContent: string;
    selectedAnswer: string | null;
    correctAnswer: string | null;
    isCorrect: boolean;
}

export interface TestResultDetailResponse {
    resultId: number;
    testName: string;
    score: number;
    isPassed: boolean;
    totalTime: number;
    questionResults: QuestionResultResponse[];
}

// ─── Learner Profile Types ──────────────────────────────────

export interface CreateProfileRequest {
    levelId: number;
    name?: string | null;
}

export interface ProfileResponse {
    profileId: number;
    status: string;
    startDate: string;
    currentLevelName: string | null;
    currentLevelId: number | null;
    avatarUrl?: string | null;
    name?: string | null;
}

export interface UpdateProfileRequest {
    avatarUrl?: string | null;
    name?: string | null;
}

export interface TopicProgressItem {
    topicId: number;
    topicName: string;
    status: string;
    testCount: number;
    passedTestCount: number;
}

export interface LevelProgressItem {
    levelId: number;
    levelName: string;
    levelOrder: number;
    status: string;
    topics: TopicProgressItem[];
}

export interface LearnerAccountResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    status: string | null;
    createdAt: string;
}

export interface UpdateLearnerInfoRequest {
    firstName: string;
    lastName: string;
    email: string;
}

export interface ProfileProgressResponse {
    profileId: number;
    profileStatus: string;
    levels: LevelProgressItem[];
}

// ─── Helper ────────────────────────────────────────────────────

function getAdminHeaders(): Record<string, string> {
    const token = tokenStorage.getAdminToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function getLearnerHeaders(): Record<string, string> {
    const token = tokenStorage.getLearnerToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const body = await response.json();

    if (!response.ok) {
        throw new Error(body.message || `Request failed with status ${response.status}`);
    }

    return body as ApiResponse<T>;
}

// ─── Auth Service ──────────────────────────────────────────────

export const authApi = {
    learnerLogin: (data: LearnerLoginRequest) =>
        request<LearnerAuthResponse>(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    learnerRegister: (data: LearnerRegisterRequest) =>
        request<RegisterResponse>(`${API_BASE}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    adminLogin: (data: AdminLoginRequest) =>
        request<AdminAuthResponse>(`${API_BASE}/admin/auth/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ─── Admin Level API ───────────────────────────────────────────

export const adminLevelApi = {
    getAll: (page = 0, size = 10) =>
        request<PaginationResponse<LevelResponse>>(`${API_BASE}/admin/levels?page=${page}&size=${size}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    getById: (id: number) =>
        request<LevelResponse>(`${API_BASE}/admin/levels/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    create: (data: LevelRequest) =>
        request<LevelResponse>(`${API_BASE}/admin/levels`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    update: (id: number, data: LevelRequest) =>
        request<LevelResponse>(`${API_BASE}/admin/levels/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`${API_BASE}/admin/levels/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),
};

// ─── Admin Topic API ───────────────────────────────────────────

export const adminTopicApi = {
    getAll: (page = 0, size = 10, levelId?: number, keyword?: string, sort = 'createdAt,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (levelId) params.append('levelId', String(levelId));
        if (keyword) params.append('keyword', keyword);
        return request<PaginationResponse<TopicResponse>>(`${API_BASE}/admin/topics?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },

    getById: (id: number) =>
        request<TopicResponse>(`${API_BASE}/admin/topics/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    create: (data: TopicRequest) =>
        request<TopicResponse>(`${API_BASE}/admin/topics`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    update: (id: number, data: TopicRequest) =>
        request<TopicResponse>(`${API_BASE}/admin/topics/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`${API_BASE}/admin/topics/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),
};

// ─── Admin AudioTest API ───────────────────────────────────────

export const adminAudioTestApi = {
    getAll: (page = 0, size = 10, topicId?: number, status?: string, keyword?: string, sort = 'createdAt,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (topicId) params.append('topicId', String(topicId));
        if (status) params.append('status', status);
        if (keyword) params.append('keyword', keyword);
        return request<PaginationResponse<AudioTestResponse>>(`${API_BASE}/admin/audio-tests?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },

    getById: (id: number) =>
        request<AudioTestResponse>(`${API_BASE}/admin/audio-tests/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    create: (data: AudioTestRequest) =>
        request<AudioTestResponse>(`${API_BASE}/admin/audio-tests`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    update: (id: number, data: AudioTestRequest) =>
        request<AudioTestResponse>(`${API_BASE}/admin/audio-tests/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`${API_BASE}/admin/audio-tests/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),

    publish: (id: number) =>
        request<void>(`${API_BASE}/admin/audio-tests/${id}/publish`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
        }),

    reject: (id: number) =>
        request<void>(`${API_BASE}/admin/audio-tests/${id}/reject`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
        }),
};

// ─── Admin Question API ────────────────────────────────────────

export const adminQuestionApi = {
    getByTestId: (testId: number) =>
        request<QuestionResponse[]>(`${API_BASE}/admin/questions/test/${testId}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    create: (data: QuestionRequest) =>
        request<QuestionResponse>(`${API_BASE}/admin/questions`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    update: (id: number, data: QuestionRequest) =>
        request<QuestionResponse>(`${API_BASE}/admin/questions/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`${API_BASE}/admin/questions/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),
};

// ─── Admin AI Test API ─────────────────────────────────────────

export const adminAiTestApi = {
    generate: (data: AiGenerateRequest) =>
        request<AiTestResponse>(`${API_BASE}/admin/ai-tests/generate`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    getById: (id: number) =>
        request<AiTestResponse>(`${API_BASE}/admin/ai-tests/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    approve: (id: number) =>
        request<void>(`${API_BASE}/admin/ai-tests/${id}/approve`, {
            method: 'POST',
            headers: getAdminHeaders(),
        }),

    reject: (id: number, data: AiRejectRequest) =>
        request<void>(`${API_BASE}/admin/ai-tests/${id}/reject`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    getLogs: (page = 0, size = 20) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        return request<PaginationResponse<AiGenerationLogResponse>>(`${API_BASE}/admin/ai-tests/logs?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },
};

// ─── Admin Vocabulary API ──────────────────────────────────────

export const adminVocabularyApi = {
    getAll: (page = 0, size = 10, keyword?: string, sort = 'createdAt,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (keyword) params.append('keyword', keyword);
        return request<PaginationResponse<VocabularyResponse>>(`${API_BASE}/admin/vocabularies?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },

    getById: (id: number) =>
        request<VocabularyResponse>(`${API_BASE}/admin/vocabularies/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    create: (data: VocabularyRequest) =>
        request<VocabularyResponse>(`${API_BASE}/admin/vocabularies`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    update: (id: number, data: VocabularyRequest) =>
        request<VocabularyResponse>(`${API_BASE}/admin/vocabularies/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`${API_BASE}/admin/vocabularies/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),
};

// ─── Admin VocabBank API ──────────────────────────────────────

export const adminVocabBankApi = {
    getAll: (page = 0, size = 10, topicId?: number, keyword?: string, sort = 'createdAt,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (topicId) params.append('topicId', String(topicId));
        if (keyword) params.append('keyword', keyword);
        return request<PaginationResponse<VocabBankResponse>>(`${API_BASE}/admin/vocab-banks?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },

    getById: (id: number) =>
        request<VocabBankResponse>(`${API_BASE}/admin/vocab-banks/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    create: (data: VocabBankRequest) =>
        request<VocabBankResponse>(`${API_BASE}/admin/vocab-banks`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    update: (id: number, data: VocabBankRequest) =>
        request<VocabBankResponse>(`${API_BASE}/admin/vocab-banks/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`${API_BASE}/admin/vocab-banks/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),

    addVocabularies: (bankId: number, items: VocabBankVocabularyRequest[]) =>
        request<VocabBankResponse>(`${API_BASE}/admin/vocab-banks/${bankId}/vocabularies`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(items),
        }),

    removeVocabulary: (bankId: number, vocabId: number) =>
        request<void>(`${API_BASE}/admin/vocab-banks/${bankId}/vocabularies/${vocabId}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
        }),

    reorderVocabularies: (bankId: number, items: VocabBankVocabularyRequest[]) =>
        request<VocabBankResponse>(`${API_BASE}/admin/vocab-banks/${bankId}/vocabularies/reorder`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(items),
        }),
};

// ─── Admin Profile API (Learner Progress) ─────────────────────

export const adminProfileApi = {
    getAll: (page = 0, size = 10, keyword?: string, sort = 'startDate,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (keyword) params.append('keyword', keyword);
        return request<PaginationResponse<AdminProfileResponse>>(`${API_BASE}/admin/profiles?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },
};

// ─── Admin Test Result API ────────────────────────────────────

export const adminTestResultApi = {
    getAll: (page = 0, size = 10, keyword?: string, mode?: string, passed?: boolean, sort = 'createdAt,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (keyword) params.append('keyword', keyword);
        if (mode) params.append('mode', mode);
        if (passed !== undefined) params.append('passed', String(passed));
        return request<PaginationResponse<AdminTestResultResponse>>(`${API_BASE}/admin/test-results?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },
};

// ─── Admin Learner API ────────────────────────────────────────

export const adminLearnerApi = {
    getAll: (page = 0, size = 10, keyword?: string, status?: string, sort = 'createdAt,desc') => {
        const params = new URLSearchParams({ page: String(page), size: String(size), sort });
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        return request<PaginationResponse<LearnerResponse>>(`${API_BASE}/admin/learners?${params}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        });
    },

    getById: (id: number) =>
        request<LearnerResponse>(`${API_BASE}/admin/learners/${id}`, {
            method: 'GET',
            headers: getAdminHeaders(),
        }),

    lock: (id: number) =>
        request<LearnerResponse>(`${API_BASE}/admin/learners/${id}/lock`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
        }),

    unlock: (id: number) =>
        request<LearnerResponse>(`${API_BASE}/admin/learners/${id}/unlock`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
        }),
};

// ─── Learner API ──────────────────────────────────────────────

export const learnerApi = {
    // Levels & Topics & Vocabulary
    getLevels: () =>
        request<LevelResponse[]>(`${API_BASE}/levels`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    getTopicsByLevel: (levelId: number, profileId?: number | null) =>
        request<TopicResponse[]>(`${API_BASE}/levels/${levelId}/topics${profileId ? `?profileId=${profileId}` : ''}`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    getVocabulariesByTopic: (topicId: number) =>
        request<VocabularyResponse[]>(`${API_BASE}/topics/${topicId}/vocabularies`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    // Test flow
    getTestsByTopic: (topicId: number, page = 0, size = 20) =>
        request<PaginationResponse<TestSummaryResponse>>(`${API_BASE}/topics/${topicId}/tests?page=${page}&size=${size}`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    startTest: (testId: number, data: StartTestRequest) =>
        request<StartTestResponse>(`${API_BASE}/tests/${testId}/start`, {
            method: 'POST',
            headers: getLearnerHeaders(),
            body: JSON.stringify(data),
        }),

    getTestQuestions: (testId: number, attemptId: number) =>
        request<LearnerQuestionResponse[]>(`${API_BASE}/tests/${testId}/questions?attemptId=${attemptId}`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    submitTest: (resultId: number, data: SubmitTestRequest) =>
        request<SubmitTestResponse>(`${API_BASE}/test-results/${resultId}/submit`, {
            method: 'POST',
            headers: getLearnerHeaders(),
            body: JSON.stringify(data),
        }),

    getTestResult: (resultId: number, profileId: number) =>
        request<TestResultDetailResponse>(`${API_BASE}/test-results/${resultId}?profileId=${profileId}`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    getTestHistory: (profileId: number, page = 0, size = 20) =>
        request<PaginationResponse<TestHistoryResponse>>(`${API_BASE}/profiles/${profileId}/test-results?page=${page}&size=${size}`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    // Account
    getMyAccount: () =>
        request<LearnerAccountResponse>(`${API_BASE}/learners/me`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    updateMyInfo: (data: UpdateLearnerInfoRequest) =>
        request<LearnerAccountResponse>(`${API_BASE}/learners/me`, {
            method: 'PUT',
            headers: getLearnerHeaders(),
            body: JSON.stringify(data),
        }),

    // Profile management
    getMyProfiles: () =>
        request<ProfileResponse[]>(`${API_BASE}/learners/me/profiles`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    createProfile: (data: CreateProfileRequest) =>
        request<ProfileResponse>(`${API_BASE}/learners/me/profiles`, {
            method: 'POST',
            headers: getLearnerHeaders(),
            body: JSON.stringify(data),
        }),

    getProfileProgress: (profileId: number) =>
        request<ProfileProgressResponse>(`${API_BASE}/learners/me/profiles/${profileId}/progress`, {
            method: 'GET',
            headers: getLearnerHeaders(),
        }),

    updateProfile: (profileId: number, data: UpdateProfileRequest) =>
        request<ProfileResponse>(`${API_BASE}/learners/me/profiles/${profileId}`, {
            method: 'PATCH',
            headers: getLearnerHeaders(),
            body: JSON.stringify(data),
        }),

    uploadProfileAvatar: async (profileId: number, file: File) => {
        const token = tokenStorage.getLearnerToken();
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/learners/me/profiles/${profileId}/avatar`, {
            method: 'POST',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: formData,
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Upload failed');
        return body as ApiResponse<{ avatarUrl: string }>;
    },

    // Avatar
    uploadAvatar: async (file: File) => {
        const token = tokenStorage.getLearnerToken();
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/learners/me/avatar`, {
            method: 'POST',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: formData,
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Upload failed');
        return body as ApiResponse<string>;
    },

    deleteAvatar: () =>
        request<void>(`${API_BASE}/learners/me/avatar`, {
            method: 'DELETE',
            headers: getLearnerHeaders(),
        }),
};

// ─── Token helpers ─────────────────────────────────────────────

export const tokenStorage = {
    setLearnerToken: (token: string) => localStorage.setItem('learner_token', token),
    getLearnerToken: () => localStorage.getItem('learner_token'),
    removeLearnerToken: () => localStorage.removeItem('learner_token'),

    setAdminToken: (token: string) => localStorage.setItem('admin_token', token),
    getAdminToken: () => localStorage.getItem('admin_token'),
    removeAdminToken: () => localStorage.removeItem('admin_token'),
};
