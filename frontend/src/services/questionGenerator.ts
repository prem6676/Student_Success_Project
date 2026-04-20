import { GEMINI_API_KEY, USE_GEMINI } from '../config/api';

export interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const generateQuestionsPrompt = (category: 'technical' | 'aptitude', count: number = 15): string => {
  if (category === 'technical') {
    return `Generate exactly ${count} multiple choice questions for technical interview preparation.
    Include topics like:
    - Data Structures and Algorithms
    - Object Oriented Programming
    - Database Concepts
    - Web Development
    - System Design basics

    IMPORTANT: Each question must have exactly 4 distinct answer options with actual meaningful answers. Do NOT use placeholder text like "Option 1", "Option 2", "Option A", "Option B", etc.

    Format each question as JSON object with this structure:
    {
      "id": number,
      "question": "question text",
      "options": ["first actual answer", "second actual answer", "third actual answer", "fourth actual answer"],
      "correctAnswer": 0
    }

    Example of GOOD options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"]
    Example of BAD options (DO NOT USE): ["Option 1", "Option 2", "Option 3", "Option 4"]

    Return only a JSON array of questions without any additional text or markdown.`;
  } else {
    return `Generate exactly ${count} multiple choice questions for aptitude and logical reasoning.
    Include topics like:
    - Number Series
    - Pattern Recognition
    - Logical Reasoning
    - Verbal Reasoning
    - Analytical Thinking
    - Puzzle Solving

    IMPORTANT: Each question must have exactly 4 distinct answer options with actual meaningful answers. Do NOT use placeholder text like "Option 1", "Option 2", "Option A", "Option B", etc.

    Format each question as JSON object with this structure:
    {
      "id": number,
      "question": "question text",
      "options": ["first actual answer", "second actual answer", "third actual answer", "fourth actual answer"],
      "correctAnswer": 0
    }

    Example of GOOD options: ["40", "42", "44", "46"]
    Example of BAD options (DO NOT USE): ["Option 1", "Option 2", "Option 3", "Option 4"]

    Return only a JSON array of questions without any additional text or markdown.`;
  }
};

const generateInterviewQuestionsPrompt = (jobRole: string): string => {
  return `Generate exactly 5 realistic interview questions for a ${jobRole} position.
  Make questions specific to this role and realistic for actual interviews.

  Format as a JSON array where each question is a simple string:
  ["question1", "question2", "question3", "question4", "question5"]

  Return only the JSON array without any additional text.`;
};

// ─── Groq ─────────────────────────────────────────────────────────────────────

const callGroq = async (prompt: string): Promise<string> => {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates JSON. Return only valid JSON with no markdown, no code fences, and no extra text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content from Groq API');
  return content;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractJsonArray = (raw: string): string | null => {
  const markdownMatch = raw.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (markdownMatch?.[1]) return markdownMatch[1];

  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch?.[0]) return arrayMatch[0];

  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) return objectMatch[0];

  if (raw.trim().startsWith('[') && raw.trim().endsWith(']')) return raw.trim();
  return null;
};

const normalizeGeneratedQuestions = (items: unknown): GeneratedQuestion[] | null => {
  if (!Array.isArray(items)) return null;

  const normalized: GeneratedQuestion[] = [];

  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;

    const q = item as Partial<GeneratedQuestion> & { options?: unknown; correctAnswer?: unknown };

    if (typeof q.question !== 'string' || !q.question.trim()) return;

    let optionsArray: string[] = [];

    if (Array.isArray(q.options) && q.options.length >= 2) {
      optionsArray = q.options.map(opt => String(opt).trim()).filter(opt => opt.length > 0);
      while (optionsArray.length < 4) optionsArray.push(`Option ${optionsArray.length + 1}`);
      if (optionsArray.length > 4) optionsArray = optionsArray.slice(0, 4);
    } else {
      optionsArray = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
    }

    let correctAnswer =
      typeof q.correctAnswer === 'number' && Number.isFinite(q.correctAnswer) ? q.correctAnswer : 0;
    if (correctAnswer < 0 || correctAnswer >= optionsArray.length) correctAnswer = 0;

    normalized.push({
      id: index + 1,
      question: q.question.trim(),
      options: optionsArray,
      correctAnswer,
    });
  });

  return normalized.length > 0 ? normalized : null;
};

const parseAndNormalize = (content: string): GeneratedQuestion[] | null => {
  const extracted = extractJsonArray(content);
  if (!extracted) return null;
  try {
    const parsed = JSON.parse(extracted);
    const items = Array.isArray(parsed)
      ? parsed
      : parsed?.questions ?? parsed?.data ?? (
          Object.values(parsed).every((v: unknown) => typeof v === 'object' && v !== null && 'question' in (v as object))
            ? Object.values(parsed)
            : null
        );
    return items ? normalizeGeneratedQuestions(items) : null;
  } catch {
    return null;
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const generateSkillAssessmentQuestions = async (
  category: 'technical' | 'aptitude'
): Promise<GeneratedQuestion[]> => {
  // 1. Try Groq
  if (GROQ_API_KEY) {
    try {
      console.log('Generating questions via Groq...');
      const content = await callGroq(generateQuestionsPrompt(category, 15));
      const normalized = parseAndNormalize(content);
      if (normalized && normalized.length > 0) {
        console.log(`Generated ${normalized.length} questions from Groq`);
        return normalized;
      }
      console.warn('Groq returned unusable format, falling back to mock');
    } catch (err) {
      console.warn('Groq failed, falling back to mock:', err);
    }
  } else {
    console.warn('VITE_GROQ_API_KEY not set');
  }

  // 2. Try Gemini (legacy fallback)
  const canUseGemini = USE_GEMINI && GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  if (canUseGemini) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: generateQuestionsPrompt(category, 15) }] }],
          }),
        }
      );
      if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const normalized = parseAndNormalize(content);
        if (normalized) return normalized;
      }
    } catch (err) {
      console.warn('Gemini failed, returning mock:', err);
    }
  }

  // 3. Mock fallback
  return getMockQuestions(category);
};

export const generateInterviewQuestions = async (jobRole: string): Promise<string[]> => {
  // 1. Try Groq
  if (GROQ_API_KEY) {
    try {
      console.log('Generating interview questions via Groq...');
      const content = await callGroq(generateInterviewQuestionsPrompt(jobRole));
      const extracted = extractJsonArray(content);
      if (extracted) {
        const parsed = JSON.parse(extracted);
        let questions: string[] | null = null;
        if (Array.isArray(parsed)) {
          questions = parsed.map(q => String(q));
        } else if (typeof parsed === 'object' && parsed !== null) {
          const wrapped = parsed as Record<string, unknown>;
          if (Array.isArray(wrapped.questions)) questions = wrapped.questions.map(q => String(q));
        }
        if (questions && questions.length > 0) {
          console.log(`Generated ${questions.length} interview questions from Groq`);
          return questions;
        }
      }
      console.warn('Groq returned unusable format for interview questions');
    } catch (err) {
      console.warn('Groq interview generation failed:', err);
    }
  }

  // 2. Try Gemini (legacy fallback)
  const canUseGemini = USE_GEMINI && GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  if (canUseGemini) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: generateInterviewQuestionsPrompt(jobRole) }] }],
          }),
        }
      );
      if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const extracted = extractJsonArray(content);
        if (extracted) return JSON.parse(extracted);
      }
    } catch (err) {
      console.warn('Gemini interview generation failed:', err);
    }
  }

  // 3. Mock fallback
  return getMockInterviewQuestions(jobRole);
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const getMockQuestions = (category: 'technical' | 'aptitude'): GeneratedQuestion[] => {
  if (category === 'technical') {
    return [
      { id: 1, question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 1 },
      { id: 2, question: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Tree', 'Graph'], correctAnswer: 1 },
      { id: 3, question: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2 },
      { id: 4, question: 'Which data structure is used for implementing DFS?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctAnswer: 1 },
      { id: 5, question: 'What does OOP stand for?', options: ['Object Oriented Programming', 'Open Operation Protocol', 'Optimal Order Processing', 'None'], correctAnswer: 0 },
      { id: 6, question: 'In SQL, what does JOIN do?', options: ['Merges tables', 'Combines columns', 'Sorts data', 'Creates new database'], correctAnswer: 0 },
      { id: 7, question: 'What is the primary key in a database?', options: ['A key used for encryption', 'A unique identifier for a record', 'A key for sorting', 'None'], correctAnswer: 1 },
      { id: 8, question: 'Which of these is not a programming paradigm?', options: ['Functional', 'Procedural', 'Object-Oriented', 'Circular'], correctAnswer: 3 },
      { id: 9, question: 'What is polymorphism?', options: ['Many forms', 'Single form', 'Multiple types', 'Type conversion'], correctAnswer: 0 },
      { id: 10, question: 'What is the purpose of an index in a database?', options: ['To encrypt data', 'To speed up queries', 'To validate data', 'To compress data'], correctAnswer: 1 },
      { id: 11, question: 'Which sorting algorithm has best average case complexity?', options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'], correctAnswer: 1 },
      { id: 12, question: 'What is a hash function?', options: ['A function to encrypt', 'Maps input to fixed size output', 'Sorts arrays', 'Validates JSON'], correctAnswer: 1 },
      { id: 13, question: 'What is the purpose of normalization in databases?', options: ['Optimize queries', 'Reduce redundancy', 'Encrypt data', 'Validate data'], correctAnswer: 1 },
      { id: 14, question: 'What is a deadlock in concurrent programming?', options: ['Program crash', 'Two processes waiting for each other', 'Memory leak', 'Type error'], correctAnswer: 1 },
      { id: 15, question: 'What is REST API?', options: ['Type of database', 'Architecture for web services', 'Programming language', 'Design pattern'], correctAnswer: 1 },
    ];
  } else {
    return [
      { id: 1, question: 'If A = 1, B = 2, C = 3... then HELLO = ?', options: ['52', '62', '72', '82'], correctAnswer: 0 },
      { id: 2, question: 'Complete the series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctAnswer: 1 },
      { id: 3, question: 'If CODE is written as FRGH, how is BEST written?', options: ['CFTU', 'EHVW', 'DGUV', 'ADRQ'], correctAnswer: 1 },
      { id: 4, question: 'What comes next? 1, 1, 2, 3, 5, 8, 13, ?', options: ['19', '20', '21', '22'], correctAnswer: 2 },
      { id: 5, question: 'A is the father of B, B is the father of C, what is C to A?', options: ['Son', 'Grandson', 'Father', 'Brother'], correctAnswer: 1 },
      { id: 6, question: 'If all roses are flowers and some flowers are red, then?', options: ['All roses are red', 'Some roses are red', 'No roses are red', 'Cannot be determined'], correctAnswer: 3 },
      { id: 7, question: 'Complete: 5, 10, 20, 40, ?', options: ['50', '60', '80', '100'], correctAnswer: 2 },
      { id: 8, question: 'What is the odd one out? 2, 3, 5, 7, 9, 11', options: ['2', '3', '9', '11'], correctAnswer: 2 },
      { id: 9, question: 'If TRAIN is coded as USBJO, then BRAIN is coded as?', options: ['AQDLM', 'CSBNJ', 'BSBNJ', 'CSBNM'], correctAnswer: 2 },
      { id: 10, question: 'A, B, C, D, E are arranged in a circle. A is between B and D. Who is between C and E?', options: ['A', 'B', 'D', 'Cannot be determined'], correctAnswer: 3 },
      { id: 11, question: 'What is the next number? 121, 144, 169, 196, ?', options: ['215', '220', '225', '230'], correctAnswer: 2 },
      { id: 12, question: 'If 2 + 2 = 4, 3 + 3 = 9, then 4 + 4 = ?', options: ['12', '14', '16', '20'], correctAnswer: 2 },
      { id: 13, question: 'Complete: 1, 4, 9, 16, 25, 36, ?', options: ['46', '48', '49', '52'], correctAnswer: 2 },
      { id: 14, question: 'If BOOK = 4-15-15-11, then LOOK = ?', options: ['12-15-15-11', '12-14-14-11', '11-15-15-11', '12-15-14-11'], correctAnswer: 0 },
      { id: 15, question: 'What comes next in the pattern? 1, 2, 4, 7, 11, 16, ?', options: ['20', '21', '22', '23'], correctAnswer: 2 },
    ];
  }
};

const getMockInterviewQuestions = (jobRole: string): string[] => {
  const questionSets: Record<string, string[]> = {
    'Software Engineer': [
      'Tell me about yourself and your experience in software development.',
      'Explain the difference between procedural and object-oriented programming.',
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'How do you ensure code quality and maintainability in your projects?',
      'What is your approach to debugging complex issues?',
    ],
    'Data Analyst': [
      'Tell me about your experience with data analysis and business intelligence.',
      'How do you handle missing or inconsistent data in your analysis?',
      'Explain a time when you used data to drive business decisions.',
      'What data visualization tools are you proficient in and why?',
      'How do you ensure data accuracy and quality in your reports?',
    ],
    'Web Developer': [
      'Tell me about your web development experience and technologies.',
      'Explain the difference between frontend and backend development.',
      'How do you ensure website performance and optimize load times?',
      'Describe your experience with responsive design and mobile optimization.',
      'What is your approach to handling cross-browser compatibility?',
    ],
    'Full Stack Developer': [
      'Describe your full stack development experience with frontend and backend.',
      'How do you approach system design for scalable applications?',
      'Explain your experience with databases and API design.',
      'Tell me about your experience with DevOps and deployment.',
      'How do you handle authentication and security in web applications?',
    ],
    'Associate Software Engineer': [
      'Tell me about yourself and your technical background.',
      'What programming languages are you most comfortable with?',
      'Describe a project where you learned something new.',
      'How do you approach learning new technologies and frameworks?',
      'What are your career goals in software development?',
    ],
  };

  return questionSets[jobRole] || questionSets['Software Engineer'];
};