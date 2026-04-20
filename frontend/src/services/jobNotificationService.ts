import { getSkillData } from './dashboardService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;           // Remote / Full-time / Part-time
  salary: string;
  tags: string[];         // skills required
  url: string;
  postedAt: string;
  logo: string;
  isBookmarked: boolean;
  isSuggested: boolean;   // AI-suggested based on user skills
  matchScore: number;     // 0-100
}

// ─── Remotive API (free, no key) ─────────────────────────────────────────────

const REMOTIVE_URL = 'https://remotive.com/api/remote-jobs';

const CATEGORY_MAP: Record<string, string> = {
  'Technical Skills': 'software-dev',
  'Aptitude':         'software-dev',
  'Problem Solving':  'software-dev',
  'Communication':    'customer-support',
};

const fetchRemotiveJobs = async (category = 'software-dev', limit = 20): Promise<Job[]> => {
  try {
    const res = await fetch(`${REMOTIVE_URL}?category=${category}&limit=${limit}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('Remotive fetch failed');
    const data = await res.json();
    return (data.jobs || []).map((j: any): Job => ({
      id:          String(j.id),
      title:       j.title || 'Software Engineer',
      company:     j.company_name || 'Unknown Company',
      location:    j.candidate_required_location || 'Remote',
      type:        j.job_type || 'full_time',
      salary:      j.salary || 'Not specified',
      tags:        Array.isArray(j.tags) ? j.tags.slice(0, 5) : [],
      url:         j.url || '#',
      postedAt:    j.publication_date || new Date().toISOString(),
      logo:        j.company_logo || '',
      isBookmarked: false,
      isSuggested:  false,
      matchScore:   0,
    }));
  } catch {
    return [];
  }
};

// ─── Groq skill-based suggestions ────────────────────────────────────────────

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getGroqKey = (): string =>
  (import.meta as any).env?.VITE_GROQ_API_KEY || '';

const suggestJobsWithGroq = async (skills: { name: string; value: number }[]): Promise<Job[]> => {
  const key = getGroqKey();
  if (!key) return [];

  const topSkills = skills
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(s => `${s.name} (${s.value}%)`);

  if (!topSkills.length) return [];

  const prompt = `Based on these skill scores: ${topSkills.join(', ')}, suggest 4 real job roles.
Return ONLY a JSON array like this (no markdown):
[
  {
    "title": "Job Title",
    "company": "Company Name",
    "location": "Remote / City",
    "type": "Full-time",
    "salary": "$80,000 - $120,000",
    "tags": ["skill1", "skill2"],
    "url": "https://linkedin.com/jobs",
    "matchScore": 85,
    "reason": "One sentence why this matches their skills"
  }
]`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 600,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return parsed.map((j: any, i: number): Job => ({
      id:          `groq-${i}-${Date.now()}`,
      title:       j.title || 'Software Engineer',
      company:     j.company || 'Top Tech Company',
      location:    j.location || 'Remote',
      type:        j.type || 'Full-time',
      salary:      j.salary || 'Competitive',
      tags:        Array.isArray(j.tags) ? j.tags : [],
      url:         j.url || 'https://linkedin.com/jobs',
      postedAt:    new Date().toISOString(),
      logo:        '',
      isBookmarked: false,
      isSuggested:  true,
      matchScore:   Number(j.matchScore) || 80,
    }));
  } catch {
    return [];
  }
};

// ─── Compute match score against user skills ──────────────────────────────────

const computeMatchScore = (
  job: Job,
  skills: { name: string; value: number }[]
): number => {
  if (!job.tags.length || !skills.length) return 50;
  const skillNames = skills.map(s => s.name.toLowerCase());
  const matched = job.tags.filter(tag =>
    skillNames.some(s => s.includes(tag.toLowerCase()) || tag.toLowerCase().includes(s))
  ).length;
  const base = Math.round((matched / Math.max(job.tags.length, 1)) * 100);
  // Weighted by user's avg skill score
  const avg = skills.reduce((s, sk) => s + sk.value, 0) / skills.length;
  return Math.min(100, Math.round((base * 0.6) + (avg * 0.4)));
};

// ─── localStorage bookmark helpers ───────────────────────────────────────────

const BOOKMARK_KEY = 'job_bookmarks';

export const getBookmarks = (): string[] => {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]'); }
  catch { return []; }
};

export const toggleBookmark = (jobId: string): boolean => {
  const bookmarks = getBookmarks();
  const exists = bookmarks.includes(jobId);
  const updated = exists
    ? bookmarks.filter(id => id !== jobId)
    : [...bookmarks, jobId];
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
  return !exists; // returns new state
};

// ─── Main fetch function ──────────────────────────────────────────────────────

export const fetchJobNotifications = async (): Promise<Job[]> => {
  const bookmarks = getBookmarks();

  // Fetch user skills from dashboard
  let skills: { name: string; value: number }[] = [];
  try { skills = await getSkillData(); } catch {}

  // Determine best Remotive category based on top skill
  const topSkill = skills.sort((a, b) => b.value - a.value)[0];
  const category = topSkill ? (CATEGORY_MAP[topSkill.name] || 'software-dev') : 'software-dev';

  // Fetch real jobs + AI suggestions in parallel
  const [realJobs, suggestedJobs] = await Promise.all([
    fetchRemotiveJobs(category, 15),
    suggestJobsWithGroq(skills),
  ]);

  // Score and mark all real jobs
  const scored = realJobs.map(job => ({
    ...job,
    matchScore: computeMatchScore(job, skills),
    isBookmarked: bookmarks.includes(job.id),
  }));

  // Mark AI suggested jobs
  const markedSuggested = suggestedJobs.map(job => ({
    ...job,
    isBookmarked: bookmarks.includes(job.id),
  }));

  // Combine: suggested first, then real jobs sorted by match score
  const combined = [
    ...markedSuggested,
    ...scored.sort((a, b) => b.matchScore - a.matchScore),
  ];

  return combined;
};
