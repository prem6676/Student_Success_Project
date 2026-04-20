import { API_ENDPOINTS } from '../config/api';

export interface DashboardStats {
  overallScore: number;
  assessmentsCompleted: number;
  skillsMastered: number;
  resourcesAccessed: number;
  resumesAnalyzed: number;
  mockInterviewsTaken: number;
}

export interface SkillData {
  name: string;
  value: number;
}

export interface ProgressData {
  month: string;
  score: number;
}

export interface DashboardInsights {
  strengths: string[];
  weaknesses: string[];
  trend: string;
  recommendations: string[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const getDefaultStats = (): DashboardStats => ({
  overallScore: 0,
  assessmentsCompleted: 0,
  skillsMastered: 0,
  resourcesAccessed: 0,
  resumesAnalyzed: 0,
  mockInterviewsTaken: 0,
});

const getDefaultSkillData = (): SkillData[] => [
  { name: 'Technical Skills', value: 0 },
  { name: 'Aptitude', value: 0 },
  { name: 'Problem Solving', value: 0 },
  { name: 'Communication', value: 0 },
];

const getDefaultProgressData = (): ProgressData[] => [
  { month: 'Jan', score: 0 },
  { month: 'Feb', score: 0 },
  { month: 'Mar', score: 0 },
  { month: 'Apr', score: 0 },
  { month: 'May', score: 0 },
  { month: 'Jun', score: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserId = (): string | null => {
  const user = localStorage.getItem('ml_user');
  if (!user) return null;
  try {
    return JSON.parse(user)?.id ?? null;
  } catch {
    return null;
  }
};

// ─── Fetch functions ──────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const userId = getUserId();
  if (!userId) return getDefaultStats();
  try {
    const response = await fetch(API_ENDPOINTS.dashboardStats(userId));
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return getDefaultStats();
  }
};

export const getSkillData = async (): Promise<SkillData[]> => {
  const userId = getUserId();
  if (!userId) return getDefaultSkillData();
  try {
    const response = await fetch(API_ENDPOINTS.dashboardSkills(userId));
    if (!response.ok) throw new Error('Failed to fetch skill data');
    const data = await response.json();
    return Array.isArray(data) ? data : getDefaultSkillData();
  } catch (error) {
    console.error('Error fetching skill data:', error);
    return getDefaultSkillData();
  }
};

export const getProgressData = async (): Promise<ProgressData[]> => {
  const userId = getUserId();
  if (!userId) return getDefaultProgressData();
  try {
    const response = await fetch(API_ENDPOINTS.dashboardProgress(userId));
    if (!response.ok) throw new Error('Failed to fetch progress data');
    const data = await response.json();
    return Array.isArray(data) ? data : getDefaultProgressData();
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return getDefaultProgressData();
  }
};

export const getDashboardInsights = async (): Promise<DashboardInsights> => {
  const userId = getUserId();
  if (!userId) return { strengths: [], weaknesses: [], trend: 'stable', recommendations: [] };
  try {
    const response = await fetch(API_ENDPOINTS.dashboardInsights(userId));
    if (!response.ok) throw new Error('Failed to fetch insights');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard insights:', error);
    return { strengths: [], weaknesses: [], trend: 'stable', recommendations: [] };
  }
};

// ─── Save functions ───────────────────────────────────────────────────────────

export const saveAssessmentResult = async (
  category: string,
  totalQuestions: number,
  score: number
) => {
  const userId = getUserId();
  if (!userId) return;
  try {
    console.log('Saving assessment result:', { category, totalQuestions, score, userId });
    const response = await fetch(API_ENDPOINTS.saveAssessment, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        category,
        total_questions: totalQuestions,
        score,
        score_percentage: (score / totalQuestions) * 100,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving assessment result:', error);
  }
};

export const saveInterviewResult = async (payload: {
  jobRole: string;
  totalScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  grade: string;
  questionsAnswered: number;
}) => {
  const userId = getUserId();
  if (!userId) {
    console.warn('saveInterviewResult: no user logged in, skipping save');
    return;
  }
  try {
    console.log('Saving interview result:', { ...payload, userId });
    const response = await fetch(API_ENDPOINTS.saveInterview, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        job_role: payload.jobRole,
        total_score: payload.totalScore,
        communication_score: payload.communicationScore,
        technical_score: payload.technicalScore,
        confidence_score: payload.confidenceScore,
        grade: payload.grade,
        questions_answered: payload.questionsAnswered,
      }),
    });
    const result = await response.json();
    console.log('Interview save result:', result);
    return result;
  } catch (error) {
    console.error('Error saving interview result:', error);
  }
};