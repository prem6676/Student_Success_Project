import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, CircularProgress,
  Chip, Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Play, Mic, MicOff, Volume2, CheckCircle,
  MessageSquare, Award, TrendingUp, ChevronRight, RotateCcw,
  Code, Users, Brain, Target, Zap, Shield
} from 'lucide-react';
import { generateInterviewQuestions } from '../services/questionGenerator';
import { saveInterviewResult } from '../services/dashboardService';

type InterviewType = 'technical' | 'hr';

interface TechnicalFeedback {
  question: string;
  answer: string;
  isCorrect: boolean;
  logicScore: number;
  codingScore: number;
  communicationScore: number;
  efficiencyScore: number;
  totalScore: number;
  keyConceptsFound: string[];
  missingConcepts: string[];
  summary: string;
  verdict: 'Correct' | 'Partially Correct' | 'Incorrect';
  nlpSignals: {
    keywordDensity: number;
    fluencyScore: number;
    depthScore: number;
    confidenceScore: number;
  };
}

interface HRFeedback {
  question: string;
  answer: string;
  communicationScore: number;
  technicalScore: number;
  behaviourScore: number;
  culturalFitScore: number;
  totalScore: number;
  strengths: string[];
  improvements: string[];
  aiVoiceDetected: boolean;
  copiedContent: boolean;
  eyeContact: boolean;
  summary: string;
  hiringDecision: 'Selected' | 'Partially Selected' | 'Not Selected';
  nlpSignals: {
    starMethodUsed: boolean;
    specificExamplesGiven: boolean;
    emotionalIntelligence: number;
    vocabularyRichness: number;
  };
}

type AnswerFeedback = TechnicalFeedback | HRFeedback;

interface OverallReport {
  interviewType: InterviewType;
  totalScore: number;
  grade: string;
  hiringDecision: string;
  avgLogicScore?: number;
  avgCodingScore?: number;
  avgCommunicationScore?: number;
  avgEfficiencyScore?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  communicationScore?: number;
  behaviourScore?: number;
  culturalFitScore?: number;
  technicalKnowledgeScore?: number;
  topStrengths: string[];
  areasToImprove: string[];
  overallFeedback: string;
  keyFeedback: string[];
}

// ─── Groq API ─────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const getGroqKey = (): string => (import.meta as any).env?.VITE_GROQ_API_KEY || '';

const callGroq = async (systemPrompt: string, userPrompt: string, maxTokens = 1000): Promise<string> => {
  const key = getGroqKey();
  if (!key) throw new Error('VITE_GROQ_API_KEY not set');

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
};

// ─── NLP Utility Functions ────────────────────────────────────────────────────

const safeParseJSON = (raw: string): any => {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return null;
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val || 0));

// NLP signals computed client-side to enrich evaluation
const computeNLPSignals = (answer: string) => {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 4);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

  // Fluency: penalize very short sentences and run-ons
  const fluencyScore = Math.min(100, Math.max(0,
    sentences.length < 2 ? 20 :
    avgWordsPerSentence < 5 ? 40 :
    avgWordsPerSentence > 35 ? 55 :
    70 + Math.min(30, words.length / 5)
  ));

  // Vocabulary richness: unique/total ratio
  const vocabularyRichness = words.length > 0
    ? Math.round((uniqueWords.size / words.length) * 100)
    : 0;

  // Depth score: based on word count and sentence structure
  const depthScore = Math.min(100, Math.max(0,
    words.length < 20 ? 20 :
    words.length < 50 ? 45 :
    words.length < 100 ? 65 :
    words.length < 150 ? 80 : 90
  ));

  // Confidence signals: assertive language
  const confidentWords = /\b(I implemented|I designed|I built|I led|I solved|I improved|I created|I developed|I managed|I achieved|definitely|clearly|specifically|exactly|precisely)\b/i;
  const vagueWords = /\b(maybe|perhaps|I think|I guess|kind of|sort of|not sure|possibly|might be)\b/i;
  const confidentCount = (answer.match(confidentWords) || []).length;
  const vagueCount = (answer.match(vagueWords) || []).length;
  const confidenceScore = Math.min(100, Math.max(10,
    50 + (confidentCount * 15) - (vagueCount * 10)
  ));

  // STAR method detection
  const starMethodUsed =
    /\b(situation|context|background|when I|there was a time)\b/i.test(answer) &&
    /\b(task|responsible for|goal was|needed to|had to)\b/i.test(answer) &&
    /\b(I did|I took|I decided|action I|steps I|I worked|I led)\b/i.test(answer) &&
    /\b(result|outcome|achieved|success|improved|learned|impact|consequently)\b/i.test(answer);

  const specificExamplesGiven =
    /\b(\d+%|\d+ percent|tripled|doubled|reduced by|increased by|from \d|to \d|within \d)\b/i.test(answer) ||
    /\b(for example|for instance|specifically|in one case|such as)\b/i.test(answer);

  // Technical keyword density
  const technicalTerms = /\b(algorithm|complexity|O\(|Big O|array|hash|tree|graph|stack|queue|pointer|recursion|iteration|binary|linear|sort|search|cache|API|database|SQL|async|thread|memory|runtime|compile)\b/i;
  const techMatches = answer.match(new RegExp(technicalTerms.source, 'gi')) || [];
  const keywordDensity = Math.min(100, (techMatches.length / Math.max(1, words.length)) * 500);

  return {
    fluencyScore: Math.round(fluencyScore),
    vocabularyRichness,
    depthScore: Math.round(depthScore),
    confidenceScore: Math.round(confidenceScore),
    keywordDensity: Math.round(keywordDensity),
    starMethodUsed,
    specificExamplesGiven,
  };
};

// ─── Technical Evaluator (NLP-enhanced) ──────────────────────────────────────

const evaluateTechnicalAnswer = async (
  question: string,
  answer: string,
  jobRole: string
): Promise<TechnicalFeedback> => {
  const nlp = computeNLPSignals(answer);
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const system = `You are a strict technical interview evaluator for ${jobRole} positions.
Use NLP analysis to evaluate answers. You have been given pre-computed signals:
- Keyword density score: ${nlp.keywordDensity}/100 (technical term usage frequency)
- Fluency score: ${nlp.fluencyScore}/100 (sentence structure quality)
- Depth score: ${nlp.depthScore}/100 (answer elaboration level)
- Confidence score: ${nlp.confidenceScore}/100 (assertive vs vague language)
- Word count: ${wordCount}

STRICT SCORING RULES:
- If word count < 15: logicScore max 8, codingScore max 8 (too brief to evaluate)
- If answer is "no answer", "(no answer)", or similar: all scores = 0
- logicScore (0-30): Does the answer show correct problem-solving approach? Penalize wrong algorithms.
- codingScore (0-30): Implementation knowledge, syntax awareness, correct data structures
- communicationScore (0-20): Weighted 40% by fluency score (${nlp.fluencyScore}), 60% by explanation clarity
- efficiencyScore (0-20): Time/space complexity awareness — explicitly mentioned or implied

RESPOND ONLY with valid JSON, no markdown:`;

  const user = `Question: "${question}"
Answer: "${answer}"
Word count: ${wordCount}
Keyword density: ${nlp.keywordDensity}/100

Evaluate strictly. An answer that just says "binary search is faster" without explaining HOW deserves low logic score.
Return JSON:
{
  "isCorrect": true/false,
  "verdict": "Correct" | "Partially Correct" | "Incorrect",
  "logicScore": <0-30>,
  "codingScore": <0-30>,
  "communicationScore": <0-20>,
  "efficiencyScore": <0-20>,
  "keyConceptsFound": ["max 4 specific concepts actually present in the answer"],
  "missingConcepts": ["max 3 key concepts missing from this specific answer"],
  "summary": "2-3 sentences: what was right, what was wrong, specific improvement"
}`;

  try {
    const raw = await callGroq(system, user, 800);
    const p = safeParseJSON(raw);
    if (!p) throw new Error('No JSON parsed');

    const logicScore = clamp(Number(p.logicScore), 0, 30);
    const codingScore = clamp(Number(p.codingScore), 0, 30);
    // Blend AI comm score with NLP fluency
    const aiCommScore = clamp(Number(p.communicationScore), 0, 20);
    const communicationScore = Math.round(aiCommScore * 0.6 + (nlp.fluencyScore / 100 * 20) * 0.4);
    const efficiencyScore = clamp(Number(p.efficiencyScore), 0, 20);
    const totalScore = clamp(logicScore + codingScore + communicationScore + efficiencyScore, 0, 100);

    return {
      question, answer,
      isCorrect: Boolean(p.isCorrect),
      verdict: p.verdict || 'Partially Correct',
      logicScore, codingScore,
      communicationScore: clamp(communicationScore, 0, 20),
      efficiencyScore, totalScore,
      keyConceptsFound: Array.isArray(p.keyConceptsFound) ? p.keyConceptsFound.slice(0, 4) : [],
      missingConcepts: Array.isArray(p.missingConcepts) ? p.missingConcepts.slice(0, 3) : [],
      summary: p.summary || 'Evaluation complete.',
      nlpSignals: {
        keywordDensity: nlp.keywordDensity,
        fluencyScore: nlp.fluencyScore,
        depthScore: nlp.depthScore,
        confidenceScore: nlp.confidenceScore,
      },
    };
  } catch {
    // NLP-based fallback (never returns zeros)
    const base = Math.min(25, Math.max(5, nlp.depthScore * 0.25));
    const logicScore = Math.round(clamp(base * (nlp.keywordDensity / 50 + 0.5), 3, 25));
    const codingScore = Math.round(clamp(base * 0.8, 2, 22));
    const communicationScore = Math.round(clamp((nlp.fluencyScore / 100) * 18, 2, 18));
    const efficiencyScore = Math.round(clamp(base * 0.5, 1, 15));
    const totalScore = logicScore + codingScore + communicationScore + efficiencyScore;
    return {
      question, answer, isCorrect: false, verdict: 'Partially Correct',
      logicScore, codingScore, communicationScore, efficiencyScore,
      totalScore: clamp(totalScore, 5, 80),
      keyConceptsFound: nlp.keywordDensity > 20 ? ['Technical terms detected'] : [],
      missingConcepts: ['Algorithm specifics', 'Complexity analysis', 'Edge case handling'],
      summary: `Answer evaluated using NLP signals. Depth: ${nlp.depthScore}/100. Provide more specific technical details for higher scores.`,
      nlpSignals: {
        keywordDensity: nlp.keywordDensity,
        fluencyScore: nlp.fluencyScore,
        depthScore: nlp.depthScore,
        confidenceScore: nlp.confidenceScore,
      },
    };
  }
};

// ─── HR Evaluator (NLP-enhanced) ─────────────────────────────────────────────

const evaluateHRAnswer = async (
  question: string,
  answer: string,
  jobRole: string
): Promise<HRFeedback> => {
  const nlp = computeNLPSignals(answer);
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const system = `You are an expert HR evaluator for ${jobRole} positions using NLP-based assessment.
Pre-computed NLP signals for this answer:
- Fluency score: ${nlp.fluencyScore}/100 (grammar & sentence flow)
- Vocabulary richness: ${nlp.vocabularyRichness}/100 (unique word ratio)
- Depth score: ${nlp.depthScore}/100 (answer elaboration)
- Confidence score: ${nlp.confidenceScore}/100 (assertive language signals)
- STAR method detected: ${nlp.starMethodUsed}
- Specific examples given: ${nlp.specificExamplesGiven}
- Word count: ${wordCount}

SCORING RULES:
- communicationScore (0-100): 50% NLP fluency (${nlp.fluencyScore}), 50% clarity of expression
- technicalScore (0-100): domain knowledge shown relevant to ${jobRole}
- behaviourScore (0-100): STAR method used? Specific examples? Teamwork signals?
  - STAR detected: +25 bonus, Specific examples: +20 bonus
- culturalFitScore (0-100): professionalism, values, attitude toward work
- If word count < 20: all scores max 35 (too brief)
- aiVoiceDetected: true if robotic, overly formal, suspiciously perfect structure
- copiedContent: true if sounds memorized or generic without personal story

RESPOND ONLY with valid JSON, no markdown:`;

  const user = `Question: "${question}"
Answer: "${answer}"
NLP Summary: fluency=${nlp.fluencyScore}, confidence=${nlp.confidenceScore}, STAR=${nlp.starMethodUsed}, examples=${nlp.specificExamplesGiven}

Return JSON:
{
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "behaviourScore": <0-100>,
  "culturalFitScore": <0-100>,
  "strengths": ["2-3 specific strengths from THIS answer"],
  "improvements": ["2-3 specific improvements for THIS answer"],
  "aiVoiceDetected": false,
  "copiedContent": false,
  "eyeContact": true,
  "hiringDecision": "Selected" | "Partially Selected" | "Not Selected",
  "summary": "2-3 sentences with specific feedback about this answer"
}`;

  try {
    const raw = await callGroq(system, user, 800);
    const p = safeParseJSON(raw);
    if (!p) throw new Error('No JSON parsed');

    // Blend AI scores with NLP signals
    const aiComm = clamp(Number(p.communicationScore), 0, 100);
    const communicationScore = Math.round(aiComm * 0.5 + nlp.fluencyScore * 0.5);
    const technicalScore = clamp(Number(p.technicalScore), 0, 100);
    // Boost behaviour score if STAR method used
    let behaviourScore = clamp(Number(p.behaviourScore), 0, 100);
    if (nlp.starMethodUsed) behaviourScore = Math.min(100, behaviourScore + 15);
    if (nlp.specificExamplesGiven) behaviourScore = Math.min(100, behaviourScore + 10);
    const culturalFitScore = clamp(Number(p.culturalFitScore), 0, 100);
    const totalScore = Math.round((communicationScore + technicalScore + behaviourScore + culturalFitScore) / 4);

    return {
      question, answer,
      communicationScore, technicalScore, behaviourScore, culturalFitScore, totalScore,
      strengths: Array.isArray(p.strengths) ? p.strengths.slice(0, 3) : [],
      improvements: Array.isArray(p.improvements) ? p.improvements.slice(0, 3) : [],
      aiVoiceDetected: Boolean(p.aiVoiceDetected),
      copiedContent: Boolean(p.copiedContent),
      eyeContact: Boolean(p.eyeContact),
      hiringDecision: p.hiringDecision || 'Partially Selected',
      summary: p.summary || 'Evaluation complete.',
      nlpSignals: {
        starMethodUsed: nlp.starMethodUsed,
        specificExamplesGiven: nlp.specificExamplesGiven,
        emotionalIntelligence: clamp(nlp.confidenceScore, 0, 100),
        vocabularyRichness: nlp.vocabularyRichness,
      },
    };
  } catch {
    // NLP-based fallback
    const base = Math.min(80, Math.max(25, nlp.depthScore * 0.75));
    const communicationScore = Math.round(nlp.fluencyScore * 0.7 + base * 0.3);
    const behaviourScore = Math.round(
      base + (nlp.starMethodUsed ? 15 : 0) + (nlp.specificExamplesGiven ? 10 : 0)
    );
    const culturalFitScore = Math.round(clamp(nlp.confidenceScore * 0.6 + base * 0.4, 20, 85));
    const technicalScore = Math.round(clamp(base * 0.8, 20, 75));
    const totalScore = Math.round((communicationScore + technicalScore + clamp(behaviourScore, 0, 100) + culturalFitScore) / 4);

    return {
      question, answer,
      communicationScore: clamp(communicationScore, 20, 85),
      technicalScore: clamp(technicalScore, 20, 75),
      behaviourScore: clamp(behaviourScore, 20, 95),
      culturalFitScore: clamp(culturalFitScore, 20, 85),
      totalScore: clamp(totalScore, 20, 85),
      strengths: nlp.starMethodUsed
        ? ['Used structured STAR format', 'Provided context']
        : nlp.depthScore > 50
        ? ['Detailed response given']
        : ['Attempted the question'],
      improvements: [
        nlp.starMethodUsed ? 'Add measurable outcomes' : 'Use STAR method (Situation, Task, Action, Result)',
        nlp.specificExamplesGiven ? 'Quantify impact more' : 'Include specific examples with numbers',
        'Increase vocabulary and professional tone',
      ],
      aiVoiceDetected: false,
      copiedContent: nlp.confidenceScore < 20 && nlp.fluencyScore > 90,
      eyeContact: nlp.confidenceScore > 50,
      hiringDecision: totalScore >= 70 ? 'Selected' : totalScore >= 45 ? 'Partially Selected' : 'Not Selected',
      summary: `NLP-based evaluation: fluency ${nlp.fluencyScore}/100, depth ${nlp.depthScore}/100. ${nlp.starMethodUsed ? 'STAR method detected — good structure.' : 'No STAR structure detected — add situation, task, action, result.'}`,
      nlpSignals: {
        starMethodUsed: nlp.starMethodUsed,
        specificExamplesGiven: nlp.specificExamplesGiven,
        emotionalIntelligence: clamp(nlp.confidenceScore, 0, 100),
        vocabularyRichness: nlp.vocabularyRichness,
      },
    };
  }
};

// ─── Overall Report Generator ─────────────────────────────────────────────────

const generateOverallReport = async (
  feedbacks: AnswerFeedback[],
  jobRole: string,
  interviewType: InterviewType
): Promise<OverallReport> => {
  const grade = (score: number) =>
    score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 65 ? 'B+' :
    score >= 55 ? 'B' : score >= 45 ? 'C+' : 'C';

  if (interviewType === 'technical') {
    const techFeedbacks = feedbacks as TechnicalFeedback[];
    const avg = (fn: (f: TechnicalFeedback) => number) =>
      Math.round(techFeedbacks.reduce((s, f) => s + fn(f), 0) / techFeedbacks.length);

    const avgLogic = avg(f => (f.logicScore / 30) * 100);
    const avgCoding = avg(f => (f.codingScore / 30) * 100);
    const avgComm = avg(f => (f.communicationScore / 20) * 100);
    const avgEff = avg(f => (f.efficiencyScore / 20) * 100);
    const avgTotal = avg(f => f.totalScore);
    const correct = techFeedbacks.filter(f => f.isCorrect).length;
    const concepts = [...new Set(techFeedbacks.flatMap(f => f.keyConceptsFound))].slice(0, 3);
    const missing = [...new Set(techFeedbacks.flatMap(f => f.missingConcepts))].slice(0, 3);
    const decision = avgTotal >= 75 ? 'Highly Recommended (HIRE)' : avgTotal >= 55 ? 'Recommended with Reservations' : 'Not Recommended';

    // Average NLP signals across all answers
    const avgNLP = {
      keywordDensity: Math.round(techFeedbacks.reduce((s, f) => s + f.nlpSignals.keywordDensity, 0) / techFeedbacks.length),
      fluency: Math.round(techFeedbacks.reduce((s, f) => s + f.nlpSignals.fluencyScore, 0) / techFeedbacks.length),
    };

    try {
      const feedback = await callGroq(
        `You are a senior technical interviewer. Give concise actionable feedback in 3-4 sentences. Be specific.`,
        `Candidate for ${jobRole} scored ${avgTotal}/100. Correct: ${correct}/${techFeedbacks.length}. Average keyword density: ${avgNLP.keywordDensity}/100. Average fluency: ${avgNLP.fluency}/100. Strengths: ${concepts.join(', ')}. Gaps: ${missing.join(', ')}. Write honest, specific feedback.`
      );
      return {
        interviewType, totalScore: avgTotal, grade: grade(avgTotal), hiringDecision: decision,
        avgLogicScore: avgLogic, avgCodingScore: avgCoding, avgCommunicationScore: avgComm,
        avgEfficiencyScore: avgEff, correctAnswers: correct, totalQuestions: techFeedbacks.length,
        topStrengths: concepts.length > 0 ? concepts : ['Attempted all questions'],
        areasToImprove: missing.length > 0 ? missing : ['Complexity analysis', 'Edge cases', 'Code optimization'],
        overallFeedback: feedback.trim(),
        keyFeedback: [`${correct}/${techFeedbacks.length} questions answered correctly`, ...missing.slice(0, 2)],
      };
    } catch {
      return {
        interviewType, totalScore: avgTotal, grade: grade(avgTotal), hiringDecision: decision,
        avgLogicScore: avgLogic, avgCodingScore: avgCoding, avgCommunicationScore: avgComm,
        avgEfficiencyScore: avgEff, correctAnswers: correct, totalQuestions: techFeedbacks.length,
        topStrengths: concepts.length > 0 ? concepts : ['Attempted all questions'],
        areasToImprove: missing.length > 0 ? missing : ['Complexity analysis', 'Edge cases'],
        overallFeedback: `You scored ${avgTotal}/100 with ${correct}/${techFeedbacks.length} correct answers. NLP analysis shows keyword density of ${avgNLP.keywordDensity}/100. Focus on ${missing[0] || 'algorithm complexity'} to improve.`,
        keyFeedback: [`${correct}/${techFeedbacks.length} correct`, ...missing.slice(0, 2)],
      };
    }
  } else {
    const hrFeedbacks = feedbacks as HRFeedback[];
    const avg = (fn: (f: HRFeedback) => number) =>
      Math.round(hrFeedbacks.reduce((s, f) => s + fn(f), 0) / hrFeedbacks.length);

    const avgComm = avg(f => f.communicationScore);
    const avgTech = avg(f => f.technicalScore);
    const avgBeh = avg(f => f.behaviourScore);
    const avgCult = avg(f => f.culturalFitScore);
    const avgTotal = avg(f => f.totalScore);
    const strengths = [...new Set(hrFeedbacks.flatMap(f => f.strengths))].slice(0, 3);
    const improvements = [...new Set(hrFeedbacks.flatMap(f => f.improvements))].slice(0, 3);
    const aiFlag = hrFeedbacks.some(f => f.aiVoiceDetected);
    const copyFlag = hrFeedbacks.some(f => f.copiedContent);
    const starCount = hrFeedbacks.filter(f => f.nlpSignals.starMethodUsed).length;
    const decision = avgTotal >= 75 ? 'Selected' : avgTotal >= 50 ? 'Partially Selected' : 'Not Selected';

    const keyFeedback: string[] = [];
    if (copyFlag) keyFeedback.push('Copied content detected in some answers');
    if (aiFlag) keyFeedback.push('AI-generated voice pattern detected');
    if (!copyFlag && !aiFlag) keyFeedback.push('Authentic responses detected');
    if (starCount > 0) keyFeedback.push(`STAR method used in ${starCount}/${hrFeedbacks.length} answers`);
    keyFeedback.push(...improvements.slice(0, 2));

    try {
      const feedback = await callGroq(
        `You are an expert HR manager. Give professional, honest feedback in 3-4 sentences with specific NLP insights.`,
        `Candidate for ${jobRole} scored ${avgTotal}/100. Communication: ${avgComm}, Behaviour: ${avgBeh}, Cultural Fit: ${avgCult}. STAR method used in ${starCount}/${hrFeedbacks.length} answers. Strengths: ${strengths.join(', ')}. Write specific HR feedback.`
      );
      return {
        interviewType, totalScore: avgTotal, grade: grade(avgTotal), hiringDecision: decision,
        communicationScore: avgComm, technicalKnowledgeScore: avgTech, behaviourScore: avgBeh,
        culturalFitScore: avgCult,
        topStrengths: strengths.length > 0 ? strengths : ['Participated fully'],
        areasToImprove: improvements.length > 0 ? improvements : ['Use STAR method', 'Add specific examples'],
        overallFeedback: feedback.trim(), keyFeedback,
      };
    } catch {
      return {
        interviewType, totalScore: avgTotal, grade: grade(avgTotal), hiringDecision: decision,
        communicationScore: avgComm, technicalKnowledgeScore: avgTech, behaviourScore: avgBeh,
        culturalFitScore: avgCult,
        topStrengths: strengths.length > 0 ? strengths : ['Participated fully'],
        areasToImprove: improvements.length > 0 ? improvements : ['Use STAR method', 'Add specific examples'],
        overallFeedback: `You scored ${avgTotal}/100. STAR method detected in ${starCount}/${hrFeedbacks.length} answers. ${avgBeh > 70 ? 'Strong behavioural responses.' : 'Improve answer structure.'} Focus on ${improvements[0] || 'structured responses'}.`,
        keyFeedback,
      };
    }
  }
};

// ─── Speech utilities ─────────────────────────────────────────────────────────

const speak = (text: string): Promise<void> =>
  new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; utterance.pitch = 1; utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.lang === 'en-US');
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
const stopSpeaking = () => window.speechSynthesis.cancel();

// ─── Score Bar ────────────────────────────────────────────────────────────────

const ScoreBar = ({
  label, score, maxScore, color, icon
}: { label: string; score: number; maxScore: number; color: string; icon: React.ReactNode }) => {
  const pct = (score / maxScore) * 100;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{label}</Typography>
        </Box>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color }}>{score}/{maxScore}</Typography>
      </Box>
      <Box sx={{ height: 10, borderRadius: 5, bgcolor: '#1e293b', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 5 }}
        />
      </Box>
    </Box>
  );
};

// ─── Gauge ────────────────────────────────────────────────────────────────────

const GaugeChart = ({ score, max, label, color }: { score: number; max: number; label: string; color: string }) => {
  const pct = score / max;
  const angle = -120 + pct * 240;
  return (
    <Box sx={{ textAlign: 'center' }}>
      <svg width={100} height={65} viewBox="0 0 100 65">
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#1e293b" strokeWidth={8} strokeLinecap="round" />
        <motion.path
          d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${pct * 125.6} 125.6`}
          initial={{ strokeDasharray: '0 125.6' }}
          animate={{ strokeDasharray: `${pct * 125.6} 125.6` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.line
          x1="50" y1="55"
          initial={{ x2: 50, y2: 55 }}
          animate={{
            x2: 50 + 28 * Math.cos((angle - 90) * Math.PI / 180),
            y2: 55 + 28 * Math.sin((angle - 90) * Math.PI / 180),
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          stroke={color} strokeWidth={2.5} strokeLinecap="round"
        />
        <circle cx="50" cy="55" r={4} fill={color} />
        <text x="50" y="52" textAnchor="middle" fill={color} fontSize="14" fontWeight="800">{score}</text>
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mt: -1 }}>
        <Typography sx={{ fontSize: 10, color: '#475569' }}>0</Typography>
        <Typography sx={{ fontSize: 10, color: '#475569' }}>{max}</Typography>
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', mt: 0.5 }}>{label}</Typography>
    </Box>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DonutChart = ({ score, max, color }: { score: number; max: number; color: string }) => {
  const r = 28; const circ = 2 * Math.PI * r;
  const offset = circ - (score / max) * circ;
  return (
    <svg width={70} height={70}>
      <circle cx={35} cy={35} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <motion.circle
        cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        strokeLinecap="round" transform="rotate(-90 35 35)"
      />
      <text x="35" y="40" textAnchor="middle" fill={color} fontSize="13" fontWeight="800">
        {score}/{max}
      </text>
    </svg>
  );
};

// ─── Verdict Badge ────────────────────────────────────────────────────────────

const VerdictBadge = ({ verdict }: { verdict: string }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'Correct': { bg: '#14532d20', text: '#4ade80', border: '#22c55e' },
    'Partially Correct': { bg: '#78350f20', text: '#fcd34d', border: '#f59e0b' },
    'Incorrect': { bg: '#450a0a20', text: '#fca5a5', border: '#ef4444' },
    'Selected': { bg: '#14532d20', text: '#4ade80', border: '#22c55e' },
    'Partially Selected': { bg: '#78350f20', text: '#fcd34d', border: '#f59e0b' },
    'Not Selected': { bg: '#450a0a20', text: '#fca5a5', border: '#ef4444' },
    'Highly Recommended (HIRE)': { bg: '#14532d20', text: '#4ade80', border: '#22c55e' },
    'Recommended with Reservations': { bg: '#78350f20', text: '#fcd34d', border: '#f59e0b' },
    'Not Recommended': { bg: '#450a0a20', text: '#fca5a5', border: '#ef4444' },
  };
  const c = colors[verdict] || colors['Partially Selected'];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 2, py: 0.8, borderRadius: 2, border: `1.5px solid ${c.border}`, bgcolor: c.bg }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: c.text, letterSpacing: '0.05em' }}>
        {verdict.toUpperCase()}
      </Typography>
    </Box>
  );
};

// ─── NLP Signal Bar (new component) ──────────────────────────────────────────

const NLPSignalBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Box sx={{ mb: 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
      <Typography sx={{ fontSize: 11, color: '#64748b' }}>{label}</Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color }}>{value}</Typography>
    </Box>
    <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#1e293b' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8 }}
        style={{ height: '100%', background: color, borderRadius: 2 }}
      />
    </Box>
  </Box>
);

const jobRoles = [
  'Software Engineer', 'Associate Software Engineer', 'Data Analyst',
  'Web Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const MockInterview = () => {
  const [phase, setPhase] = useState<'setup' | 'interview' | 'evaluating' | 'report'>('setup');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [jobRole, setJobRole] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<AnswerFeedback[]>([]);
  const [report, setReport] = useState<OverallReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [groqKeyMissing, setGroqKeyMissing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<AnswerFeedback | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!(import.meta as any).env?.VITE_GROQ_API_KEY) setGroqKeyMissing(true);
  }, []);

  useEffect(() => {
    if (phase !== 'interview') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { handleSubmitAnswer(); return 120; }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, currentQ]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraActive(true);
    } catch { setCameraActive(false); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; setCameraActive(false);
  };

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => {
      let interim = ''; let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      setCurrentAnswer(prev => (prev + final).trimStart());
      setLiveTranscript(interim);
    };
    recognition.onend = () => { setIsListening(false); setLiveTranscript(''); };
    recognition.onerror = () => { setIsListening(false); setLiveTranscript(''); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false); setLiveTranscript('');
  }, []);

  const speakQuestion = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await speak(text);
    setIsSpeaking(false);
  }, []);

  const generateHRQuestions = async (role: string): Promise<string[]> => {
    try {
      const raw = await callGroq(
        `You are an HR interviewer. Generate exactly 5 HR behavioral and situational interview questions for a ${role} position. Return ONLY a JSON array of 5 strings, no markdown.`,
        `Generate 5 varied HR interview questions for ${role}. Cover: teamwork conflict, career goals, failure/learning, strengths, and a situational challenge. Return as JSON array only.`
      );
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length >= 5) return parsed.slice(0, 5);
      }
    } catch {}
    return [
      `Tell me about yourself and why you want to work as a ${role}.`,
      'Describe a situation where you had to work with a difficult team member. How did you handle it?',
      'What are your greatest strengths and how do they apply to this role?',
      'Where do you see yourself professionally in 5 years?',
      'Describe a time when you failed at something. What did you learn from it?',
    ];
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const qs = interviewType === 'technical'
        ? await generateInterviewQuestions(jobRole)
        : await generateHRQuestions(jobRole);
      setQuestions(qs);
      setCurrentQ(0); setAnswers([]); setFeedbacks([]);
      setCurrentAnswer(''); setTimeLeft(120); setCurrentFeedback(null);
      setPhase('interview');
      await startCamera();
      setTimeout(() => speakQuestion(qs[0]), 800);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopListening(); stopSpeaking();

    const answer = currentAnswer.trim() || '(No answer provided)';
    const question = questions[currentQ];
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setEvalLoading(true);

    const feedback = interviewType === 'technical'
      ? await evaluateTechnicalAnswer(question, answer, jobRole)
      : await evaluateHRAnswer(question, answer, jobRole);

    const newFeedbacks = [...feedbacks, feedback];
    setFeedbacks(newFeedbacks);
    setCurrentFeedback(feedback);
    setEvalLoading(false);

    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ); setCurrentAnswer(''); setTimeLeft(120);
      setTimeout(() => speakQuestion(questions[nextQ]), 400);
    } else {
      setPhase('evaluating');
      stopCamera();
      const overallReport = await generateOverallReport(newFeedbacks, jobRole, interviewType);
      setReport(overallReport);

      // ── FIX: Dashboard scores correctly normalized to 0-100 ──────────────
      if (interviewType === 'technical') {
        const techFeedbacks = newFeedbacks as TechnicalFeedback[];
        const avgComm100 = Math.round(techFeedbacks.reduce((s, f) => s + (f.communicationScore / 20) * 100, 0) / techFeedbacks.length);
        const avgCoding100 = Math.round(techFeedbacks.reduce((s, f) => s + (f.codingScore / 30) * 100, 0) / techFeedbacks.length);
        const avgLogic100 = Math.round(techFeedbacks.reduce((s, f) => s + (f.logicScore / 30) * 100, 0) / techFeedbacks.length);

        await saveInterviewResult({
          jobRole,
          totalScore: overallReport.totalScore,
          communicationScore: avgComm100,       // 0-100
          technicalScore: avgCoding100,          // 0-100 (maps to coding proficiency)
          confidenceScore: avgLogic100,          // 0-100 (maps to logic/problem solving)
          grade: overallReport.grade,
          questionsAnswered: newFeedbacks.length,
        });
      } else {
        const hrFeedbacks = newFeedbacks as HRFeedback[];
        const avgComm = Math.round(hrFeedbacks.reduce((s, f) => s + f.communicationScore, 0) / hrFeedbacks.length);
        const avgTech = Math.round(hrFeedbacks.reduce((s, f) => s + f.technicalScore, 0) / hrFeedbacks.length);
        const avgBeh = Math.round(hrFeedbacks.reduce((s, f) => s + f.behaviourScore, 0) / hrFeedbacks.length);

        await saveInterviewResult({
          jobRole,
          totalScore: overallReport.totalScore,
          communicationScore: avgComm,           // 0-100
          technicalScore: avgTech,               // 0-100
          confidenceScore: avgBeh,               // 0-100 (behaviour as confidence proxy)
          grade: overallReport.grade,
          questionsAnswered: newFeedbacks.length,
        });
      }

      setPhase('report');
    }
  }, [currentAnswer, currentQ, questions, answers, feedbacks, jobRole, interviewType, speakQuestion, stopListening]);

  const resetAll = () => {
    stopCamera(); stopListening(); stopSpeaking();
    setPhase('setup'); setJobRole(''); setQuestions([]);
    setCurrentQ(0); setCurrentAnswer(''); setAnswers([]);
    setFeedbacks([]); setReport(null); setTimeLeft(120);
    setCurrentFeedback(null);
  };

  const progressPct = questions.length > 0 ? (currentQ / questions.length) * 100 : 0;
  const isTech = interviewType === 'technical';

  return (
    <Box sx={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ p: 1.5, borderRadius: 3, display: 'flex', background: isTech ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
          {isTech ? <Code size={28} color="#fff" /> : <Users size={28} color="#fff" />}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>Mock Interview</Typography>
          <Typography variant="body2" color="text.secondary">NLP-powered • Voice enabled • Real-time evaluation</Typography>
        </Box>
      </Box>

      {groqKeyMissing && (
        <Paper sx={{ p: 2, mb: 3, border: '1px solid #f59e0b40', bgcolor: '#78350f20', borderRadius: 2 }}>
          <Typography sx={{ color: '#fcd34d', fontSize: 13, fontWeight: 600 }}>
            ⚠️ Add <code>VITE_GROQ_API_KEY=your_key</code> to your <code>.env</code> file.
            Get a free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>console.groq.com</a>.
          </Typography>
        </Paper>
      )}

      <AnimatePresence mode="wait">

        {/* ── SETUP ── */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Configure Your Interview</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#64748b', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Interview Type</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                  {([
                    { type: 'technical' as InterviewType, icon: <Code size={24} />, title: 'Technical Interview', desc: 'DSA, coding, system design, problem solving', color: '#3b82f6', gradient: 'linear-gradient(135deg,#1e3a5f,#0c2a4a)', border: '#3b82f6', tags: ['Logic', 'Coding', 'Complexity'] },
                    { type: 'hr' as InterviewType, icon: <Users size={24} />, title: 'HR Interview', desc: 'Behavioral, cultural fit, communication skills', color: '#a855f7', gradient: 'linear-gradient(135deg,#2d1b69,#1e0a3c)', border: '#a855f7', tags: ['STAR Method', 'Culture', 'Soft Skills'] },
                  ] as const).map(opt => (
                    <Paper key={opt.type} onClick={() => setInterviewType(opt.type)} sx={{ p: 2.5, borderRadius: 3, cursor: 'pointer', border: `2px solid ${interviewType === opt.type ? opt.border : '#1e293b'}`, background: interviewType === opt.type ? opt.gradient : 'transparent', transition: 'all 0.2s', '&:hover': { borderColor: opt.border, background: opt.gradient } }}>
                      <Box sx={{ color: opt.color, mb: 1 }}>{opt.icon}</Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>{opt.title}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1.5 }}>{opt.desc}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {opt.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ fontSize: 10, height: 20, bgcolor: `${opt.color}20`, color: opt.color, fontWeight: 700 }} />)}
                      </Box>
                    </Paper>
                  ))}
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Job Role</InputLabel>
                  <Select value={jobRole} onChange={e => setJobRole(e.target.value)} label="Select Job Role">
                    {jobRoles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>

                <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                    {isTech ? '🔬 Technical Interview — NLP Evaluation:' : '🤝 HR Interview — NLP Evaluation:'}
                  </Typography>
                  {(isTech ? [
                    '5 technical questions on algorithms, data structures & coding',
                    'NLP signals: keyword density, fluency, depth, confidence scoring',
                    'Scored: Logic (30) + Coding (30) + Communication (20) + Efficiency (20)',
                    'AI + NLP blend gives accurate verdict per answer',
                  ] : [
                    '5 behavioral & situational HR questions',
                    'STAR method detection — automatic bonus for structured answers',
                    'NLP signals: vocabulary richness, fluency, specific examples detection',
                    'Final hiring decision with per-dimension breakdown',
                  ]).map((t, i) => (
                    <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{i + 1}. {t}</Typography>
                  ))}
                </Paper>

                <Button fullWidth variant="contained" size="large" disabled={!jobRole || loading} onClick={startInterview}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Play size={20} />}
                  sx={{ py: 1.8, borderRadius: 3, fontWeight: 700, fontSize: 16, background: isTech ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#8b5cf6,#ec4899)', '&:hover': { background: isTech ? 'linear-gradient(135deg,#2563eb,#0891b2)' : 'linear-gradient(135deg,#7c3aed,#db2777)' } }}>
                  {loading ? 'Preparing Interview...' : `Start ${isTech ? 'Technical' : 'HR'} Interview`}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── INTERVIEW ── */}
        {phase === 'interview' && questions.length > 0 && (
          <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={isTech ? 'Technical' : 'HR'} size="small" sx={{ bgcolor: isTech ? '#1e3a5f' : '#2d1b69', color: isTech ? '#60a5fa' : '#c084fc', fontWeight: 700, fontSize: 11 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Question {currentQ + 1} of {questions.length}</Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: timeLeft < 30 ? '#ef4444' : timeLeft < 60 ? '#f59e0b' : '#22c55e' }}>
                  ⏱ {formatTime(timeLeft)}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPct} sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { background: isTech ? 'linear-gradient(90deg,#3b82f6,#06b6d4)' : 'linear-gradient(90deg,#8b5cf6,#ec4899)' } }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 3, borderRadius: 3, background: isTech ? 'linear-gradient(135deg,#1e3a5f,#0c2a4a)' : 'linear-gradient(135deg,#2d1b69,#1e0a3c)', border: `1px solid ${isTech ? '#3b82f630' : '#a855f730'}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip label={`Q${currentQ + 1}`} size="small" sx={{ bgcolor: isTech ? '#3b82f620' : '#a855f720', color: isTech ? '#60a5fa' : '#c084fc', fontWeight: 700 }} />
                    <Button size="small" onClick={() => speakQuestion(questions[currentQ])} disabled={isSpeaking} startIcon={isSpeaking ? <CircularProgress size={14} /> : <Volume2 size={14} />} sx={{ color: '#94a3b8', fontSize: 12, minWidth: 0 }}>
                      {isSpeaking ? 'Speaking...' : 'Replay'}
                    </Button>
                  </Box>
                  <Typography sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: 16, lineHeight: 1.6 }}>{questions[currentQ]}</Typography>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${isListening ? (isTech ? '#3b82f6' : '#a855f7') : 'divider'}`, transition: 'border-color 0.3s', minHeight: 140 }}>
                  <textarea
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    placeholder={isTech ? "Explain your approach, algorithm, time/space complexity..." : "Use STAR method: Situation → Task → Action → Result..."}
                    style={{ width: '100%', minHeight: 120, border: 'none', outline: 'none', background: 'transparent', resize: 'vertical', fontSize: 14, fontFamily: 'inherit', lineHeight: 1.6, color: 'inherit' }}
                  />
                  {liveTranscript && <Typography sx={{ color: '#64748b', fontSize: 13, fontStyle: 'italic', mt: 1 }}>{liveTranscript}...</Typography>}
                  {isListening && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      {[0, 1, 2, 3].map(i => (
                        <Box key={i} sx={{ width: 4, borderRadius: 2, bgcolor: isTech ? '#3b82f6' : '#a855f7', animation: `wave 0.8s ${i * 0.15}s ease-in-out infinite alternate`, '@keyframes wave': { from: { height: '6px' }, to: { height: '20px' } } }} />
                      ))}
                      <Typography sx={{ color: isTech ? '#3b82f6' : '#a855f7', fontSize: 12, fontWeight: 600 }}>Listening...</Typography>
                    </Box>
                  )}
                </Paper>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant={isListening ? 'contained' : 'outlined'} onClick={isListening ? stopListening : startListening} startIcon={isListening ? <MicOff size={18} /> : <Mic size={18} />} sx={{ flex: 1, borderRadius: 2, fontWeight: 600, ...(isListening ? { background: '#ef4444', '&:hover': { background: '#dc2626' } } : {}) }}>
                    {isListening ? 'Stop Mic' : 'Use Mic'}
                  </Button>
                  <Button variant="contained" onClick={handleSubmitAnswer} disabled={!currentAnswer.trim() || evalLoading}
                    endIcon={evalLoading ? <CircularProgress size={16} color="inherit" /> : <ChevronRight size={18} />}
                    sx={{ flex: 2, borderRadius: 2, fontWeight: 700, background: isTech ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#8b5cf6,#ec4899)', '&:hover': { background: isTech ? 'linear-gradient(135deg,#2563eb,#0891b2)' : 'linear-gradient(135deg,#7c3aed,#db2777)' } }}>
                    {evalLoading ? 'Evaluating...' : currentQ === questions.length - 1 ? 'Finish & Report' : 'Submit & Next'}
                  </Button>
                </Box>

                {/* Previous feedback with NLP signals */}
                {currentFeedback && currentQ > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {isTech ? (
                      <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #3b82f630', bgcolor: '#1e3a5f15' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Previous Answer</Typography>
                          <VerdictBadge verdict={(currentFeedback as TechnicalFeedback).verdict} />
                        </Box>
                        <Typography sx={{ color: '#94a3b8', fontSize: 13, mb: 1.5 }}>{currentFeedback.summary}</Typography>
                        {/* NLP signals mini display */}
                        <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 2, mb: 1 }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#475569', mb: 1 }}>NLP SIGNALS</Typography>
                          <NLPSignalBar label="Keyword density" value={(currentFeedback as TechnicalFeedback).nlpSignals.keywordDensity} color="#3b82f6" />
                          <NLPSignalBar label="Fluency" value={(currentFeedback as TechnicalFeedback).nlpSignals.fluencyScore} color="#06b6d4" />
                          <NLPSignalBar label="Depth" value={(currentFeedback as TechnicalFeedback).nlpSignals.depthScore} color="#a855f7" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {(currentFeedback as TechnicalFeedback).keyConceptsFound.map(c => <Chip key={c} label={`✓ ${c}`} size="small" sx={{ bgcolor: '#14532d20', color: '#4ade80', fontSize: 11, fontWeight: 600 }} />)}
                        </Box>
                      </Paper>
                    ) : (
                      <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #a855f730', bgcolor: '#2d1b6915' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ color: '#c084fc', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Previous Answer</Typography>
                          <VerdictBadge verdict={(currentFeedback as HRFeedback).hiringDecision} />
                        </Box>
                        <Typography sx={{ color: '#94a3b8', fontSize: 13, mb: 1.5 }}>{currentFeedback.summary}</Typography>
                        <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 2, mb: 1 }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#475569', mb: 1 }}>NLP SIGNALS</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {(currentFeedback as HRFeedback).nlpSignals.starMethodUsed && <Chip label="✓ STAR Method" size="small" sx={{ bgcolor: '#14532d20', color: '#4ade80', fontSize: 10 }} />}
                            {(currentFeedback as HRFeedback).nlpSignals.specificExamplesGiven && <Chip label="✓ Specific Examples" size="small" sx={{ bgcolor: '#14532d20', color: '#4ade80', fontSize: 10 }} />}
                            {!(currentFeedback as HRFeedback).nlpSignals.starMethodUsed && <Chip label="✗ No STAR structure" size="small" sx={{ bgcolor: '#450a0a20', color: '#fca5a5', fontSize: 10 }} />}
                          </Box>
                          <NLPSignalBar label="Fluency" value={(currentFeedback as HRFeedback).nlpSignals.vocabularyRichness} color="#a855f7" />
                        </Box>
                        <Typography sx={{ color: '#64748b', fontSize: 12, mt: 1 }}>Score: {(currentFeedback as HRFeedback).totalScore}/100</Typography>
                      </Paper>
                    )}
                  </motion.div>
                )}
              </Box>

              {/* Right: Camera + quality */}
              <Box>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#000', position: 'relative', height: 280 }}>
                  <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {!cameraActive && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Video size={48} color="#475569" />
                      <Typography sx={{ color: '#475569', fontSize: 13 }}>Camera unavailable</Typography>
                    </Box>
                  )}
                  {cameraActive && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.7)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', animation: 'blink 1.5s infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                      <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>REC</Typography>
                    </Box>
                  )}
                </Paper>

                <Paper sx={{ mt: 2, p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Answer Quality</Typography>
                  {[
                    { label: 'Words', value: currentAnswer.trim().split(/\s+/).filter(Boolean).length, max: isTech ? 150 : 200 },
                    { label: 'Sentences', value: currentAnswer.split(/[.!?]+/).filter(s => s.trim()).length, max: 10 },
                  ].map(m => (
                    <Box key={m.label} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{m.label}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{m.value}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(100, (m.value / m.max) * 100)} sx={{ height: 5, borderRadius: 3, '& .MuiLinearProgress-bar': { background: isTech ? 'linear-gradient(90deg,#3b82f6,#06b6d4)' : 'linear-gradient(90deg,#8b5cf6,#ec4899)' } }} />
                    </Box>
                  ))}

                  {isTech && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#1e293b' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', mb: 1 }}>CHECKLIST</Typography>
                      {[
                        { label: 'Algorithm/approach mentioned', check: /algorithm|approach|method|sort|search|tree|graph|stack|queue|hash|dp|greedy|binary|linear/i.test(currentAnswer) },
                        { label: 'Time complexity mentioned', check: /O\(|time complex|Big O|linear|constant|log|quadratic/i.test(currentAnswer) },
                        { label: 'Edge case mentioned', check: /edge case|null|empty|zero|negative|bound|overflow/i.test(currentAnswer) },
                        { label: 'Implementation detail', check: /\bfor\b|\bwhile\b|\bif\b|loop|iterate|recursion|return|pointer/i.test(currentAnswer) },
                      ].map(c => (
                        <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.check ? '#22c55e' : '#475569' }} />
                          <Typography sx={{ fontSize: 11, color: c.check ? '#4ade80' : '#64748b' }}>{c.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {!isTech && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#1e293b' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', mb: 1 }}>STAR METHOD</Typography>
                      {[
                        { label: 'Situation described', check: /when|situation|context|time when|once|project|there was/i.test(currentAnswer) },
                        { label: 'Task/goal defined', check: /task|responsible|goal|needed to|had to|my role/i.test(currentAnswer) },
                        { label: 'Action taken', check: /I did|I took|I decided|I worked|I helped|I led|I created|I built/i.test(currentAnswer) },
                        { label: 'Result/outcome', check: /result|outcome|achieved|success|improved|learned|impact|reduced|increased/i.test(currentAnswer) },
                      ].map(c => (
                        <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.check ? '#a855f7' : '#475569' }} />
                          <Typography sx={{ fontSize: 11, color: c.check ? '#c084fc' : '#64748b' }}>{c.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Typography sx={{ fontSize: 12, fontWeight: 600, mt: 1.5, color: currentAnswer.length < 50 ? '#f59e0b' : currentAnswer.length < 150 ? '#60a5fa' : '#4ade80' }}>
                    {currentAnswer.length < 50 ? '💡 Add more detail to your answer' : currentAnswer.length < 150 ? '👍 Good start, keep going' : '✅ Well-detailed answer'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* ── EVALUATING ── */}
        {phase === 'evaluating' && (
          <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress size={60} sx={{ mb: 3, color: isTech ? '#3b82f6' : '#a855f7' }} />
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Generating Your Report...</Typography>
              <Typography color="text.secondary">NLP analysis complete — generating detailed evaluation</Typography>
            </Box>
          </motion.div>
        )}

        {/* ── REPORT ── (unchanged layout, scores now accurate) */}
        {phase === 'report' && report && (
          <motion.div key="report" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>

            {report.interviewType === 'technical' && (
              <>
                <Paper sx={{ p: 4, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg,#0c2a4a,#1e3a5f)', border: '1px solid #3b82f630' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Technical Interview — NLP Evaluation</Typography>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0' }}>{jobRole}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <VerdictBadge verdict={report.hiringDecision} />
                        <Typography sx={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Score: <strong style={{ color: '#60a5fa' }}>{report.totalScore} / 100</strong></Typography>
                      </Box>
                    </Box>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                      <Typography sx={{ fontSize: 64, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{report.grade}</Typography>
                    </motion.div>
                  </Box>
                </Paper>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #3b82f630' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Brain size={20} color="#3b82f6" />
                      <Typography sx={{ fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60a5fa' }}>Logic & Problem Solving</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mb: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>{Math.round((report.avgLogicScore! / 100) * 30)}</Typography>
                        <Typography sx={{ fontSize: 13, color: '#64748b' }}>out of 30</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>{report.topStrengths[0] || 'Problem solving demonstrated'}</Typography>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #06b6d430' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Code size={20} color="#06b6d4" />
                      <Typography sx={{ fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#22d3ee' }}>Coding Proficiency</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: 12, color: '#64748b' }}>Score</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#22d3ee' }}>{Math.round((report.avgCodingScore! / 100) * 30)}/30</Typography>
                        </Box>
                        <Box sx={{ height: 12, borderRadius: 6, bgcolor: '#1e293b' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${report.avgCodingScore}%` }} transition={{ duration: 1.2 }} style={{ height: '100%', background: '#06b6d4', borderRadius: 6 }} />
                        </Box>
                      </Box>
                      <DonutChart score={Math.round((report.avgCodingScore! / 100) * 30)} max={30} color="#06b6d4" />
                    </Box>
                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>{report.topStrengths[1] || 'Code structure and implementation'}</Typography>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #a855f730' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <MessageSquare size={20} color="#a855f7" />
                      <Typography sx={{ fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>Communication (NLP)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <GaugeChart score={Math.round((report.avgCommunicationScore! / 100) * 20)} max={20} label="/ 20" color="#a855f7" />
                      <Typography sx={{ fontSize: 13, color: '#94a3b8', flex: 1 }}>Fluency + clarity blend scoring via NLP analysis</Typography>
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #22c55e30' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Zap size={20} color="#22c55e" />
                      <Typography sx={{ fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4ade80' }}>Code Efficiency O(N)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DonutChart score={Math.round((report.avgEfficiencyScore! / 100) * 20)} max={20} color="#22c55e" />
                      <Typography sx={{ fontSize: 13, color: '#94a3b8', flex: 1 }}>{report.areasToImprove[0] || 'Focus on optimal time/space complexity.'}</Typography>
                    </Box>
                  </Paper>
                </Box>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight={700} sx={{ mb: 2 }}>Answer Verdicts</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    {feedbacks.map((f, i) => {
                      const tf = f as TechnicalFeedback;
                      return (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: tf.verdict === 'Correct' ? '#14532d' : tf.verdict === 'Partially Correct' ? '#78350f' : '#450a0a' }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: tf.verdict === 'Correct' ? '#4ade80' : tf.verdict === 'Partially Correct' ? '#fcd34d' : '#fca5a5' }}>Q{i + 1}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    <Typography sx={{ fontSize: 13, color: '#94a3b8', ml: 1 }}>{report.correctAnswers}/{report.totalQuestions} correct</Typography>
                  </Box>

                  {feedbacks.map((f, i) => {
                    const tf = f as TechnicalFeedback;
                    return (
                      <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < feedbacks.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14, flex: 1 }}>Q{i + 1}. {tf.question}</Typography>
                          <VerdictBadge verdict={tf.verdict} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 1 }}>
                          {[
                            { l: 'Logic', v: tf.logicScore, m: 30, c: '#3b82f6' },
                            { l: 'Coding', v: tf.codingScore, m: 30, c: '#06b6d4' },
                            { l: 'Comm', v: tf.communicationScore, m: 20, c: '#a855f7' },
                            { l: 'Efficiency', v: tf.efficiencyScore, m: 20, c: '#22c55e' },
                          ].map(m => (
                            <Box key={m.l} sx={{ textAlign: 'center', p: 1, bgcolor: '#0f172a', borderRadius: 2 }}>
                              <Typography sx={{ fontSize: 15, fontWeight: 800, color: m.c }}>{m.v}</Typography>
                              <Typography sx={{ fontSize: 10, color: '#475569' }}>{m.l}/{m.m}</Typography>
                            </Box>
                          ))}
                        </Box>
                        {/* NLP signals per answer */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip label={`Fluency: ${tf.nlpSignals.fluencyScore}`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#60a5fa', fontSize: 10 }} />
                          <Chip label={`Keywords: ${tf.nlpSignals.keywordDensity}`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#22d3ee', fontSize: 10 }} />
                          <Chip label={`Depth: ${tf.nlpSignals.depthScore}`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#c084fc', fontSize: 10 }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>{tf.summary}</Typography>
                        {(tf.keyConceptsFound.length > 0 || tf.missingConcepts.length > 0) && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                            {tf.keyConceptsFound.map(c => <Chip key={c} label={`✓ ${c}`} size="small" sx={{ bgcolor: '#14532d20', color: '#4ade80', fontSize: 11 }} />)}
                            {tf.missingConcepts.map(c => <Chip key={c} label={`✗ ${c}`} size="small" sx={{ bgcolor: '#450a0a20', color: '#fca5a5', fontSize: 11 }} />)}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Paper>
              </>
            )}

            {report.interviewType === 'hr' && (
              <>
                <Paper sx={{ p: 4, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', border: '1px solid #bae6fd' }}>
                  <Typography sx={{ fontSize: 26, fontWeight: 900, textAlign: 'center', color: '#0c2a4a', letterSpacing: '-0.02em', mb: 0.5 }}>AI + NLP Evaluation Results</Typography>
                  <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#64748b', mb: 3 }}>— NLP Based Analysis —</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={36} color="#fff" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <CheckCircle size={22} color={report.hiringDecision === 'Selected' ? '#22c55e' : '#f59e0b'} />
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0c2a4a' }}>Hiring Decision:</Typography>
                      </Box>
                      <Box sx={{ display: 'inline-block', px: 3, py: 1, borderRadius: 2, bgcolor: report.hiringDecision === 'Selected' ? '#22c55e' : report.hiringDecision === 'Partially Selected' ? '#f59e0b' : '#ef4444' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.05em' }}>{report.hiringDecision.toUpperCase()}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Box sx={{ px: 3, py: 1.5, borderRadius: 2, bgcolor: '#0c2a4a', mb: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Evaluation Summary</Typography>
                  </Box>
                  {[
                    { label: 'Communication (NLP Fluency)', score: report.communicationScore!, max: 100, icon: <MessageSquare size={18} />, color: '#22c55e' },
                    { label: 'Technical Knowledge', score: report.technicalKnowledgeScore!, max: 100, icon: <Code size={18} />, color: '#f59e0b' },
                    { label: 'Behaviour (STAR + Examples)', score: report.behaviourScore!, max: 100, icon: <Award size={18} />, color: '#84cc16' },
                    { label: 'Cultural Fit', score: report.culturalFitScore!, max: 100, icon: <Users size={18} />, color: '#22c55e' },
                  ].map(item => <ScoreBar key={item.label} label={item.label} score={item.score} maxScore={item.max} color={item.color} icon={item.icon} />)}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 3, bgcolor: '#fef9c3', border: '1px solid #fde68a', mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                      <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0c2a4a' }}>Overall Score</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontSize: 22, color: '#0c2a4a' }}>{report.totalScore.toFixed(2)} / 100</Typography>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ fontSize: 22 }}>💡</Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0c2a4a' }}>Key Feedback (NLP Analysis)</Typography>
                  </Box>
                  {report.keyFeedback.map((item, i) => {
                    const isWarning = item.toLowerCase().includes('copied') || item.toLowerCase().includes('ai voice') || item.toLowerCase().includes('ai-generated');
                    const isPositive = item.toLowerCase().includes('authentic') || item.toLowerCase().includes('correct') || item.toLowerCase().includes('star method');
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, mt: 0.5, bgcolor: isWarning ? '#ef4444' : isPositive ? '#22c55e' : '#f59e0b' }} />
                        <Typography sx={{ fontSize: 14, color: isWarning ? '#dc2626' : '#374151', fontWeight: isWarning ? 700 : 400 }}>{item}</Typography>
                      </Box>
                    );
                  })}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#0c2a4a', fontSize: 14 }}>Final Status:</Typography>
                    <Box sx={{ border: `2px solid ${report.hiringDecision === 'Selected' ? '#22c55e' : '#f59e0b'}`, px: 2, py: 0.8, borderRadius: 2, transform: 'rotate(-2deg)' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', color: report.hiringDecision === 'Selected' ? '#22c55e' : '#f59e0b' }}>
                        {report.hiringDecision.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight={700} sx={{ mb: 2 }}>Answer-by-Answer Breakdown</Typography>
                  {feedbacks.map((f, i) => {
                    const hf = f as HRFeedback;
                    return (
                      <Box key={i} sx={{ mb: 2.5, pb: 2.5, borderBottom: i < feedbacks.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Q{i + 1}. {hf.question}</Typography>
                          <VerdictBadge verdict={hf.hiringDecision} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 1.5 }}>
                          {[
                            { l: 'Comm', v: hf.communicationScore, c: '#22c55e' },
                            { l: 'Technical', v: hf.technicalScore, c: '#f59e0b' },
                            { l: 'Behaviour', v: hf.behaviourScore, c: '#84cc16' },
                            { l: 'Cult. Fit', v: hf.culturalFitScore, c: '#06b6d4' },
                          ].map(m => (
                            <Box key={m.l} sx={{ textAlign: 'center', p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                              <Typography sx={{ fontSize: 16, fontWeight: 800, color: m.c }}>{m.v}</Typography>
                              <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>{m.l}</Typography>
                            </Box>
                          ))}
                        </Box>
                        {/* NLP signals for HR */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          {hf.nlpSignals.starMethodUsed && <Chip label="✓ STAR Method" size="small" sx={{ bgcolor: '#14532d20', color: '#4ade80', fontWeight: 700, fontSize: 10 }} />}
                          {hf.nlpSignals.specificExamplesGiven && <Chip label="✓ Specific Examples" size="small" sx={{ bgcolor: '#14532d20', color: '#4ade80', fontWeight: 700, fontSize: 10 }} />}
                          {!hf.nlpSignals.starMethodUsed && <Chip label="✗ No STAR structure" size="small" sx={{ bgcolor: '#450a0a20', color: '#fca5a5', fontWeight: 700, fontSize: 10 }} />}
                          {hf.aiVoiceDetected && <Chip label="⚠ AI Voice Pattern" size="small" sx={{ bgcolor: '#78350f20', color: '#fcd34d', fontWeight: 700 }} />}
                          {hf.copiedContent && <Chip label="⚠ Copied Content" size="small" sx={{ bgcolor: '#450a0a20', color: '#fca5a5', fontWeight: 700 }} />}
                        </Box>
                        <Typography sx={{ fontSize: 13, color: '#64748b' }}>{hf.summary}</Typography>
                      </Box>
                    );
                  })}
                </Paper>
              </>
            )}

            {/* AI Coach Feedback */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: isTech ? '#1e3a5f' : '#2d1b69', color: isTech ? '#60a5fa' : '#c084fc', display: 'flex' }}>
                  <MessageSquare size={18} />
                </Box>
                <Typography fontWeight={700}>AI Coach Feedback</Typography>
              </Box>
              <Typography sx={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>{report.overallFeedback}</Typography>
            </Paper>

            {/* Strengths & Improvements */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #22c55e30', bgcolor: '#14532d08' }}>
                <Typography sx={{ color: '#4ade80', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Award size={18} /> Key Strengths
                </Typography>
                {report.topStrengths.map((s, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <CheckCircle size={14} color="#4ade80" style={{ marginTop: 3, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 14, color: '#cbd5e1' }}>{s}</Typography>
                  </Box>
                ))}
              </Paper>
              <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #f59e0b30', bgcolor: '#78350f08' }}>
                <Typography sx={{ color: '#fcd34d', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={18} /> Areas to Improve
                </Typography>
                {report.areasToImprove.map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <ChevronRight size={14} color="#fcd34d" style={{ marginTop: 3, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 14, color: '#cbd5e1' }}>{a}</Typography>
                  </Box>
                ))}
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<RotateCcw size={18} />} onClick={resetAll} sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}>Try Again</Button>
              <Button fullWidth variant="contained" onClick={() => window.location.href = '/'} sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, background: isTech ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#8b5cf6,#ec4899)', '&:hover': { background: isTech ? 'linear-gradient(135deg,#2563eb,#0891b2)' : 'linear-gradient(135deg,#7c3aed,#db2777)' } }}>
                Back to Dashboard
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};