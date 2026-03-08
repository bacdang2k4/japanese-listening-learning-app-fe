import { Level, Topic, Vocabulary, AudioTest, Question, Learner, LearnerProfile, TestResult } from '../types';

export const mockLevels: Level[] = [
  { id: '1', name: 'N5', description: 'Trình độ cơ bản - Có thể hiểu tiếng Nhật cơ bản', order: 1, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '2', name: 'N4', description: 'Trình độ sơ cấp - Có thể hiểu tiếng Nhật cơ bản trong cuộc sống hàng ngày', order: 2, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '3', name: 'N3', description: 'Trình độ trung cấp - Có thể hiểu tiếng Nhật trong các tình huống hàng ngày', order: 3, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '4', name: 'N2', description: 'Trình độ trên trung cấp - Có thể hiểu tiếng Nhật trong nhiều tình huống', order: 4, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '5', name: 'N1', description: 'Trình độ cao cấp - Có thể hiểu tiếng Nhật trong mọi tình huống', order: 5, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
];

export const mockTopics: Topic[] = [
  { id: '1', levelId: '1', name: 'Gia đình', description: 'Từ vựng về các thành viên trong gia đình', order: 1, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '2', levelId: '1', name: 'Số đếm', description: 'Các số và cách đếm trong tiếng Nhật', order: 2, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '3', levelId: '1', name: 'Màu sắc', description: 'Từ vựng về các màu sắc', order: 3, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '4', levelId: '1', name: 'Thời gian', description: 'Cách diễn đạt thời gian', order: 4, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '5', levelId: '2', name: 'Công việc', description: 'Từ vựng về công việc và nghề nghiệp', order: 1, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '6', levelId: '2', name: 'Mua sắm', description: 'Từ vựng liên quan đến mua sắm', order: 2, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
];

export const mockVocabularies: Vocabulary[] = [
  { id: '1', topicId: '1', word: '家族', reading: 'かぞく', meaning: 'Gia đình', example: '私の家族は四人です。', exampleMeaning: 'Gia đình tôi có 4 người.', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '2', topicId: '1', word: '父', reading: 'ちち', meaning: 'Bố (của mình)', example: '父は会社員です。', exampleMeaning: 'Bố tôi là nhân viên công ty.', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '3', topicId: '1', word: '母', reading: 'はは', meaning: 'Mẹ (của mình)', example: '母は料理が上手です。', exampleMeaning: 'Mẹ tôi nấu ăn giỏi.', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '4', topicId: '1', word: '兄', reading: 'あに', meaning: 'Anh trai (của mình)', example: '兄は東京に住んでいます。', exampleMeaning: 'Anh trai tôi sống ở Tokyo.', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '5', topicId: '2', word: '一', reading: 'いち', meaning: 'Một', example: '一つください。', exampleMeaning: 'Cho tôi một cái.', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '6', topicId: '2', word: '二', reading: 'に', meaning: 'Hai', example: '二人で行きます。', exampleMeaning: 'Hai người đi.', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
];

export const mockAudioTests: AudioTest[] = [
  { id: '1', levelId: '1', name: 'Bài nghe N5 - Số 1', audioUrl: 'https://example.com/audio1.mp3', passCondition: 60, duration: 30, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '2', levelId: '1', name: 'Bài nghe N5 - Số 2', audioUrl: 'https://example.com/audio2.mp3', passCondition: 60, duration: 35, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '3', levelId: '2', name: 'Bài nghe N4 - Số 1', audioUrl: 'https://example.com/audio3.mp3', passCondition: 65, duration: 40, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
];

export const mockQuestions: Question[] = [
  { id: '1', testId: '1', content: 'Người đàn ông nói gì về thời tiết?', options: ['Trời đẹp', 'Trời mưa', 'Trời lạnh', 'Trời nóng'], correctAnswer: 0, explanation: 'Người đàn ông nói "いい天気ですね" nghĩa là trời đẹp.', order: 1 },
  { id: '2', testId: '1', content: 'Cô gái sẽ đi đâu?', options: ['Trường học', 'Công ty', 'Siêu thị', 'Nhà ga'], correctAnswer: 2, explanation: 'Cô gái nói sẽ đi スーパー (siêu thị).', order: 2 },
  { id: '3', testId: '1', content: 'Mấy giờ cuộc họp bắt đầu?', options: ['9 giờ', '10 giờ', '11 giờ', '12 giờ'], correctAnswer: 1, explanation: 'Cuộc họp bắt đầu lúc 10時 (10 giờ).', order: 3 },
];

export const mockLearners: Learner[] = [
  { id: '1', email: 'nguyen.van.a@email.com', username: 'nguyenvana', fullName: 'Nguyễn Văn A', status: 'active', createdAt: new Date('2024-01-15'), lastLogin: new Date('2024-06-20') },
  { id: '2', email: 'tran.thi.b@email.com', username: 'tranthib', fullName: 'Trần Thị B', status: 'active', createdAt: new Date('2024-02-10'), lastLogin: new Date('2024-06-19') },
  { id: '3', email: 'le.van.c@email.com', username: 'levanc', fullName: 'Lê Văn C', status: 'locked', createdAt: new Date('2024-03-05'), lastLogin: new Date('2024-05-01') },
  { id: '4', email: 'pham.thi.d@email.com', username: 'phamthid', fullName: 'Phạm Thị D', status: 'active', createdAt: new Date('2024-04-20'), lastLogin: new Date('2024-06-18') },
];

export const mockProfiles: LearnerProfile[] = [
  { id: '1', learnerId: '1', status: 'Learning', completedLevels: 1, completedTopics: 4, totalScore: 850 },
  { id: '2', learnerId: '2', status: 'Pass', completedLevels: 2, completedTopics: 10, totalScore: 1500 },
  { id: '3', learnerId: '3', status: 'Not Pass', completedLevels: 0, completedTopics: 2, totalScore: 200 },
  { id: '4', learnerId: '4', status: 'Learning', completedLevels: 1, completedTopics: 6, totalScore: 950 },
];

export const mockTestResults: TestResult[] = [
  { id: '1', learnerId: '1', testId: '1', mode: 'Practice', score: 80, passed: true, completedAt: new Date('2024-06-15'), answers: [] },
  { id: '2', learnerId: '1', testId: '2', mode: 'Exam', score: 70, passed: true, completedAt: new Date('2024-06-18'), answers: [] },
  { id: '3', learnerId: '2', testId: '1', mode: 'Exam', score: 90, passed: true, completedAt: new Date('2024-06-10'), answers: [] },
  { id: '4', learnerId: '3', testId: '1', mode: 'Practice', score: 45, passed: false, completedAt: new Date('2024-05-01'), answers: [] },
];
