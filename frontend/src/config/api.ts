const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

// Use 127.0.0.1 instead of localhost to avoid IPv6 (::1) resolution issues on some Windows setups
const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';
const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3.1';

export const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY || '';
const hasGeminiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
const rawUseGemini = env.VITE_USE_GEMINI;
// Default: disable Gemini unless explicitly enabled via VITE_USE_GEMINI=true and a real key is present.
export const USE_GEMINI = rawUseGemini === 'true' && Boolean(hasGeminiKey);

export const OLLAMA_BASE_URL = env.VITE_OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
export const OLLAMA_MODEL = env.VITE_OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

export const API_BASE_URL = env.VITE_API_URL || env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const API_ENDPOINTS = {
  
  dashboard: `${API_BASE_URL}/api/dashboard`,
  resumeAnalyze: `${API_BASE_URL}/api/resume/analyze`,
  skillAssessment: `${API_BASE_URL}/api/skill-assessment`,
  mockInterview: `${API_BASE_URL}/api/mock-interview`,
  googleAuth: `${API_BASE_URL}/api/auth/google`,
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  aiGenerate: `${API_BASE_URL}/api/ai/generate`,
  updateProfile: `${API_BASE_URL}/api/auth/update-profile`,
  dashboardInsights: (userId: string) => `${API_BASE_URL}/api/dashboard/insights/${userId}`,
  saveAssessment: `${API_BASE_URL}/api/assessments/save`,
  dashboardStats: (userId: string) => `${API_BASE_URL}/api/dashboard/stats/${userId}`,
  dashboardSkills: (userId: string) => `${API_BASE_URL}/api/dashboard/skills/${userId}`,
  dashboardProgress: (userId: string) => `${API_BASE_URL}/api/dashboard/progress/${userId}`,
};
