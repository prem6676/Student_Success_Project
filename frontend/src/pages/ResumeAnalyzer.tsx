import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Select, MenuItem,
  FormControl, InputLabel, TextField, Paper, Chip, CircularProgress,
  Alert, Tab, Tabs, LinearProgress, Divider, Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Sparkles, CheckCircle, AlertCircle,
  BookOpen, Award, Map, TrendingUp, ExternalLink, Zap, Target, ArrowRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const jobRoles = [
  'Software Engineer',
  'Associate Software Engineer',
  'Data Analyst',
  'Web Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Machine Learning Engineer',
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#4caf50',
  intermediate: '#2196f3',
  advanced: '#9c27b0',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// ─── Animated Score Ring ────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? '#4caf50' : score >= 55 ? '#2196f3' : score >= 35 ? '#ff9800' : '#f44336';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color, lineHeight: 1 }}>
          {Math.round(score)}
        </Typography>
        <Typography variant="caption" color="text.secondary">/ 100</Typography>
      </Box>
    </Box>
  );
};

// ─── Score Breakdown Bar ────────────────────────────────────────────────────
const SkillBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2" fontWeight={500}>{label}</Typography>
      <Typography variant="body2" color="text.secondary">{Math.round(value)}%</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={Math.min(value, 100)}
      sx={{
        height: 7, borderRadius: 4,
        '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: color },
        backgroundColor: 'rgba(0,0,0,0.06)'
      }}
    />
  </Box>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export const ResumeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [customJobDescription, setCustomJobDescription] = useState('');
  const [useCustomDescription, setUseCustomDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [roadmapLevel, setRoadmapLevel] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
      setAnalysis(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (useCustomDescription) {
        formData.append('job_description', customJobDescription);
      } else {
        formData.append('job_role', jobRole);
      }
      const user = localStorage.getItem('ml_user');
      if (user) {
        const u = JSON.parse(user);
        if (u.id) formData.append('user_id', u.id);
      }
      const response = await fetch(API_ENDPOINTS.resumeAnalyze, { method: 'POST', body: formData });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.detail || errBody?.error || `Resume analyze failed (${response.status})`);
      }
      const data = await response.json();
      setAnalysis(data);
      setRoadmapLevel(data.roadmap?.current_level || 'beginner');
      setActiveTab(0);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume. Please ensure the backend server is running.');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze =
    !!selectedFile &&
    !loading &&
    (!useCustomDescription ? !!jobRole : customJobDescription.trim().length > 20);

  const breakdownEntries = analysis?.breakdown
    ? [
        { label: 'Required Skills',  value: analysis.breakdown.required_skills  ?? 0, color: '#2196f3' },
        { label: 'Technical Skills', value: analysis.breakdown.technical_skills ?? 0, color: '#9c27b0' },
        { label: 'Experience',       value: analysis.breakdown.experience        ?? 0, color: '#ff9800' },
        { label: 'Soft Skills',      value: analysis.breakdown.soft_skills       ?? 0, color: '#4caf50' },
        { label: 'Education',        value: analysis.breakdown.education         ?? 0, color: '#f44336' },
      ]
    : [];

  const roadmapData = analysis?.roadmap;
  const allLevels = ['beginner', 'intermediate', 'advanced'] as const;
  const currentRoadmapSteps =
    roadmapData && roadmapLevel
      ? analysis?.roadmap?.[`focus_steps`] ?? []   // fallback handled below
      : [];

  // Build full roadmap from job_roles_dataset via the analysis response
  // The backend sends focus_steps for current level; we store all levels per role
  // by including them in roadmap object. Since backend only sends current + next,
  // we show what we have.
  const getRoadmapSteps = (): string[] => {
    if (!roadmapData) return [];
    if (roadmapLevel === roadmapData.current_level) return roadmapData.focus_steps || [];
    if (roadmapLevel !== roadmapData.current_level) return roadmapData.next_steps || [];
    return roadmapData.focus_steps || [];
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FileText size={32} color="#2196f3" />
        <Box>
          <Typography variant="h4" fontWeight="bold">Resume Analyzer</Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered skill gap analysis · Personalized roadmaps · Courses & certifications
          </Typography>
        </Box>
      </Box>

      {/* ── Upload Card ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Upload Your Resume</Typography>

          <Button
            variant="outlined" component="label" startIcon={<Upload size={20} />}
            fullWidth
            sx={{
              py: 3, mb: 3, borderStyle: 'dashed', borderWidth: 2,
              borderColor: selectedFile ? 'success.main' : undefined,
              '&:hover': { borderStyle: 'dashed', borderWidth: 2 },
            }}
          >
            {selectedFile ? selectedFile.name : 'Click to Upload PDF Resume'}
            <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
          </Button>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Analysis Type</InputLabel>
            <Select
              value={useCustomDescription ? 'custom' : 'preset'}
              onChange={(e) => setUseCustomDescription(e.target.value === 'custom')}
              label="Analysis Type"
            >
              <MenuItem value="preset">Select Job Role</MenuItem>
              <MenuItem value="custom">Custom Job Description</MenuItem>
            </Select>
          </FormControl>

          {!useCustomDescription ? (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Job Role</InputLabel>
              <Select value={jobRole} onChange={(e) => setJobRole(e.target.value)} label="Job Role">
                {jobRoles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth multiline rows={4} label="Custom Job Description"
              value={customJobDescription}
              onChange={(e) => setCustomJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              sx={{ mb: 3 }}
            />
          )}

          <Button
            variant="contained" fullWidth
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
            disabled={!canAnalyze}
            onClick={handleAnalyze}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
              '&:hover': { background: 'linear-gradient(135deg, #1976d2, #7b1fa2)' },
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {/* ── Results ── */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
          >
            {/* Score Overview Card */}
            <Card sx={{
              mb: 3,
              background: (t) => t.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(156,39,176,0.1))'
                : 'linear-gradient(135deg, rgba(33,150,243,0.05), rgba(156,39,176,0.05))'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <ScoreRing score={typeof analysis.score === 'number' ? analysis.score : 0} />
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    {analysis.level && (
                      <Chip
                        label={`Level: ${LEVEL_LABELS[analysis.level] ?? analysis.level}`}
                        size="small"
                        sx={{
                          mb: 1, fontWeight: 'bold',
                          backgroundColor: LEVEL_COLORS[analysis.level] ?? '#888',
                          color: '#fff'
                        }}
                      />
                    )}
                    <Typography variant="body1" sx={{ mb: 1 }}>{analysis.feedback}</Typography>
                    {analysis.similarity > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Semantic Similarity: {analysis.similarity}%
                      </Typography>
                    )}
                  </Box>
                </Box>

                {breakdownEntries.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Score Breakdown</Typography>
                    {breakdownEntries.map((item) => (
                      <SkillBar key={item.label} {...item} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Tabs Card */}
            <Card>
              <Tabs
                value={activeTab} onChange={(_, v) => setActiveTab(v)}
                variant="scrollable" scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<Target size={15} />} iconPosition="start" label="Skills & Gaps" />
                <Tab icon={<Zap size={15} />} iconPosition="start" label="Improvements" />
                {analysis.roadmap && (
                  <Tab icon={<Map size={15} />} iconPosition="start" label="Roadmap" />
                )}
                {analysis.courses?.length > 0 && (
                  <Tab icon={<BookOpen size={15} />} iconPosition="start" label="Courses" />
                )}
                {analysis.certifications?.length > 0 && (
                  <Tab icon={<Award size={15} />} iconPosition="start" label="Certifications" />
                )}
              </Tabs>

              <CardContent>

                {/* ── Tab 0: Skills & Gaps ── */}
                {activeTab === 0 && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircle size={20} color="#4caf50" />
                        <Typography variant="h6" fontWeight="bold">Strengths</Typography>
                      </Box>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 2 }}>
                        {analysis.strengths.map((s: string, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                            <Typography variant="body2" sx={{ mb: 0.75, display: 'flex', gap: 1 }}>
                              <span style={{ color: '#4caf50' }}>✓</span>
                              <span>{s}</span>
                            </Typography>
                          </motion.div>
                        ))}
                      </Paper>
                    </Box>

                    {analysis.keywords?.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>Matched Skills</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {analysis.keywords.map((kw: string, i: number) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                              <Chip label={kw} color="primary" variant="outlined" size="small" />
                            </motion.div>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {analysis.missing_skills?.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <AlertCircle size={20} color="#f44336" />
                          <Typography variant="h6" fontWeight="bold">Missing Skills</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {analysis.missing_skills.map((skill: string, i: number) => (
                            <Chip key={i} label={skill} color="error" variant="outlined" size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {/* ── Tab 1: Improvements ── */}
                {activeTab === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Zap size={20} color="#ff9800" />
                      <Typography variant="h6" fontWeight="bold">Actionable Improvements</Typography>
                    </Box>

                    {analysis.improvements.map((imp: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Paper elevation={0} sx={{
                          p: 2, mb: 2, display: 'flex', gap: 2,
                          bgcolor: 'rgba(255,152,0,0.05)',
                          border: '1px solid rgba(255,152,0,0.2)', borderRadius: 2
                        }}>
                          <Box sx={{
                            flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                            bgcolor: '#ff9800', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: 13
                          }}>
                            {i + 1}
                          </Box>
                          <Typography variant="body2">{imp}</Typography>
                        </Paper>
                      </motion.div>
                    ))}

                    {analysis.roadmap?.priority_actions?.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Priority Actions
                        </Typography>
                        {analysis.roadmap.priority_actions.map((action: string, i: number) => (
                          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                            <ArrowRight size={16} color="#2196f3" style={{ marginTop: 2, flexShrink: 0 }} />
                            <Typography variant="body2">{action}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* ── Tab 2: Roadmap ── */}
                {activeTab === 2 && analysis.roadmap && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Your Level: ${LEVEL_LABELS[analysis.roadmap.current_level] ?? analysis.roadmap.current_level}`}
                        sx={{ bgcolor: LEVEL_COLORS[analysis.roadmap.current_level] ?? '#888', color: '#fff', fontWeight: 'bold' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Personalized learning path based on your resume gaps
                      </Typography>
                    </Box>

                    {/* Level selector */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {allLevels.map((lvl) => (
                        <Chip
                          key={lvl}
                          label={LEVEL_LABELS[lvl]}
                          clickable
                          onClick={() => setRoadmapLevel(lvl)}
                          variant={roadmapLevel === lvl ? 'filled' : 'outlined'}
                          sx={{
                            fontWeight: roadmapLevel === lvl ? 'bold' : 'normal',
                            bgcolor: roadmapLevel === lvl ? LEVEL_COLORS[lvl] : undefined,
                            color: roadmapLevel === lvl ? '#fff' : undefined,
                            borderColor: LEVEL_COLORS[lvl],
                          }}
                        />
                      ))}
                    </Box>

                    {/* Steps for current selected level */}
                    {(roadmapLevel === analysis.roadmap.current_level
                      ? analysis.roadmap.focus_steps
                      : analysis.roadmap.next_steps
                    )?.map((step: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'flex-start' }}>
                          <Box sx={{
                            flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                            bgcolor: LEVEL_COLORS[roadmapLevel] ?? '#888',
                            color: '#fff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 12, fontWeight: 'bold'
                          }}>
                            {i + 1}
                          </Box>
                          <Typography variant="body2" sx={{ pt: '4px' }}>{step}</Typography>
                        </Box>
                      </motion.div>
                    ))}

                    {roadmapLevel !== analysis.roadmap.current_level && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Showing preview steps. Complete your current level first before tackling these.
                      </Alert>
                    )}
                  </Box>
                )}

                {/* ── Tab 3: Courses ── */}
                {activeTab === 3 && analysis.courses?.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Hand-picked courses to close your skill gaps and advance your career.
                    </Typography>
                    {analysis.courses.map((course: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Paper elevation={0} sx={{
                          p: 2, mb: 2,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2,
                          border: '1px solid', borderColor: 'divider', borderRadius: 2,
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(33,150,243,0.03)' },
                          transition: 'all 0.2s'
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                              <Typography variant="body1" fontWeight={600}>{course.name}</Typography>
                              {course.free && (
                                <Chip label="FREE" size="small" color="success"
                                  sx={{ fontWeight: 'bold', height: 20, fontSize: 10 }} />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">{course.platform}</Typography>
                            <Chip label={course.level} size="small" variant="outlined"
                              sx={{ mt: 0.75, height: 20, fontSize: 11 }} />
                          </Box>
                          <Tooltip title="Open course">
                            <Button
                              variant="outlined" size="small"
                              endIcon={<ExternalLink size={14} />}
                              href={course.url} target="_blank" rel="noopener noreferrer"
                              component="a"
                              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                            >
                              View
                            </Button>
                          </Tooltip>
                        </Paper>
                      </motion.div>
                    ))}
                  </Box>
                )}

                {/* ── Tab 4: Certifications ── */}
                {activeTab === 4 && analysis.certifications?.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Industry-recognized certifications to boost your credibility and salary.
                    </Typography>
                    {analysis.certifications.map((cert: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Paper elevation={0} sx={{
                          p: 2, mb: 2,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2,
                          border: '1px solid', borderColor: 'divider', borderRadius: 2,
                          borderLeft: '4px solid',
                          borderLeftColor:
                            cert.relevance === 'High' ? '#4caf50' :
                            cert.relevance === 'Medium' ? '#ff9800' : '#9e9e9e',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, transition: 'all 0.2s'
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                              <Award size={16} color={
                                cert.relevance === 'High' ? '#4caf50' :
                                cert.relevance === 'Medium' ? '#ff9800' : '#9e9e9e'
                              } />
                              <Typography variant="body1" fontWeight={600}>{cert.name}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">{cert.provider}</Typography>
                            <Chip
                              label={`${cert.relevance} Relevance`}
                              size="small"
                              sx={{
                                mt: 0.75, height: 20, fontSize: 11,
                                bgcolor: cert.relevance === 'High' ? 'rgba(76,175,80,0.12)' :
                                         cert.relevance === 'Medium' ? 'rgba(255,152,0,0.12)' : 'rgba(0,0,0,0.06)',
                                color: cert.relevance === 'High' ? '#2e7d32' :
                                       cert.relevance === 'Medium' ? '#e65100' : '#616161'
                              }}
                            />
                          </Box>
                          <Button
                            variant="outlined" size="small"
                            endIcon={<ExternalLink size={14} />}
                            href={cert.url} target="_blank" rel="noopener noreferrer"
                            component="a"
                            sx={{ flexShrink: 0 }}
                          >
                            Info
                          </Button>
                        </Paper>
                      </motion.div>
                    ))}
                  </Box>
                )}

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
