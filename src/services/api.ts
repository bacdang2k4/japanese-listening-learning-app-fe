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
    profileId: number;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
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
    adminId: number;
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
}

export interface TopicResponse {
    id: number;
    topicName: string;
    levelId: number;
    levelName: string;
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

// ─── Token helpers ─────────────────────────────────────────────

export const tokenStorage = {
    setLearnerToken: (token: string) => localStorage.setItem('learner_token', token),
    getLearnerToken: () => localStorage.getItem('learner_token'),
    removeLearnerToken: () => localStorage.removeItem('learner_token'),

    setAdminToken: (token: string) => localStorage.setItem('admin_token', token),
    getAdminToken: () => localStorage.getItem('admin_token'),
    removeAdminToken: () => localStorage.removeItem('admin_token'),
};
