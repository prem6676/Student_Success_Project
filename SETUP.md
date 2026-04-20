# StudentSuccess - ML-Driven Student Success & Opportunity Mapping

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root with your AI configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
# Optional: local Ollama (preferred when available)
# VITE_OLLAMA_BASE_URL=http://localhost:11434
# VITE_OLLAMA_MODEL=llama3.1
```

### 2. Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Create API Key"
3. Select your project (create one if needed)
4. Copy the API key
5. Paste it in your `.env` file as `VITE_GEMINI_API_KEY`

### 3. How to Use the AI API Integration

The application uses Google's Gemini API to dynamically generate:

- **15 Technical Assessment Questions** - Covering DSA, OOP, Databases, Web Dev, and more
- **15 Aptitude & Reasoning Questions** - Including logical puzzles, series, pattern recognition
- **5 Mock Interview Questions** - Role-specific questions based on selected job role

#### Example Usage:

```typescript
import { generateSkillAssessmentQuestions, generateInterviewQuestions } from './services/questionGenerator';

// Generate technical questions
const questions = await generateSkillAssessmentQuestions('technical');

// Generate interview questions
const interviewQs = await generateInterviewQuestions('Software Engineer');
```

### 4. Features Overview

#### Dashboard
- Real-time progress tracking with animated charts
- Skill distribution pie chart
- Assessment scores bar chart
- Progress over time line chart
- Performance statistics

#### Skill Assessment
- Start with "Start Assessment" button
- 15 dynamically generated questions using Ollama (if configured) or Gemini AI
- Technical and Aptitude tabs
- Immediate scoring and feedback
- Retake functionality

#### Resources
- Java Programming
- Python Development
- Data Structures & Algorithms
- Web Development
- Database Management
- Data Science

Each with curated links to:
- GeeksforGeeks
- LeetCode
- YouTube Tutorials
- Striver Sheet
- And more

#### Placement Preparation
- PrepInsta
- GeeksforGeeks (GFG)
- Striver Sheet (TakeUForward)
- LeetCode
- InterviewBit
- HackerRank
- Scaler
- CodeChef

#### Job Portals
- Naukri.com
- LinkedIn
- Unstop
- AICTE Internships
- Internshala
- Indeed
- Glassdoor
- AngelList
- Monster
- FlexJobs

#### Resume Analyzer
- Upload PDF resume
- Job role selection or custom job description
- Structured feedback with:
  - Match score
  - Strengths
  - Areas for improvement
  - Detected keywords

#### Mock Interview
- Job role selection
- 5 AI-generated role-specific questions (Ollama preferred, Gemini fallback)
- Camera integration via WebRTC
- 2-minute timer per question
- Performance summary

### 5. Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

### 6. Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 7. API Integration with Backend

To connect with your FastAPI backend, update the endpoints in `src/config/api.ts`:

```typescript
export const API_ENDPOINTS = {
  dashboard: `${API_BASE_URL}/api/dashboard`,
  resumeAnalyze: `${API_BASE_URL}/api/resume/analyze`,
  skillAssessment: `${API_BASE_URL}/api/skill-assessment`,
  mockInterview: `${API_BASE_URL}/api/mock-interview`,
};
```

### 8. Troubleshooting

**Question Generation Not Working:**
- Ensure your Gemini API key is valid and has sufficient quota
- Check console for error messages
- The app will fall back to mock questions if API fails

**Camera Issues in Mock Interview:**
- Grant camera permissions when prompted
- Try in HTTPS or localhost environment
- Some browsers require user interaction to enable camera

**Layout Issues:**
- The sidebar automatically collapses on mobile (< 768px)
- All pages are responsive and adapt to screen size
- Use browser DevTools to test different screen sizes

### 9. Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **AI Integration**: Google Generative AI (Gemini API)
- **Styling**: Tailwind CSS with MUI
- **Build Tool**: Vite

### 10. File Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── GradientBackground.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── SkillAssessment.tsx
│   ├── Resources.tsx
│   ├── PlacementPreparation.tsx
│   ├── JobPortals.tsx
│   ├── ResumeAnalyzer.tsx
│   └── MockInterview.tsx
├── services/
│   └── questionGenerator.ts
├── contexts/
│   └── ThemeContext.tsx
├── config/
│   └── api.ts
├── theme/
│   └── theme.ts
├── App.tsx
└── main.tsx
```

## Support

For issues or questions, refer to:
- [Material-UI Documentation](https://mui.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Google Generative AI Docs](https://ai.google.dev)
- [Vite Documentation](https://vitejs.dev)
