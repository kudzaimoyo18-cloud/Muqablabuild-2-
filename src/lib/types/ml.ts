import type { BiasFlag } from './domain'

export interface TranscriptionResult {
  videoId: string
  languageDetected: 'en' | 'ar' | 'mixed'
  transcriptEn: string
  transcriptAr: string | null
  wordTimings: WordTiming[]
}

export interface WordTiming {
  word: string
  startSecs: number
  endSecs: number
  confidence: number
}

export interface CoachingFeedback {
  lightingScore: number
  lightingAdvice: string | null
  speechPaceWpm: number
  paceAdvice: string | null
  fillerWords: FillerWordOccurrence[]
  fillerWordRate: number
  overallAdvice: string
}

export interface FillerWordOccurrence {
  word: string
  offsetSecs: number
}

export interface VideoAnalysisResult {
  videoId: string
  qualityScore: number
  confidenceScore: number
  sentimentScore: number
  bodyLanguageScore: number
  eyeContactScore: number
  lightingScore: number
  speechPaceWpm: number
  fillerWordRate: number
  biasFlags: BiasFlag[]
  transcript: string
  transcriptAr: string | null
}

export interface SkillMatchResult {
  jobId: string
  seekerId: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export interface CompositeScore {
  applicationId: string
  aiScore: number
  breakdown: {
    videoQuality: number
    confidence: number
    sentiment: number
    bodyLanguage: number
    skillMatch: number
  }
}
