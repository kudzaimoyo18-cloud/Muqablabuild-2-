export type UserRole = 'seeker' | 'employer' | 'admin'

export type ApplicationStage =
  | 'applied'
  | 'reviewed'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'rejected'

export type VideoStatus = 'pending' | 'processing' | 'ready' | 'failed'
export type VideoType = 'job_description' | 'portfolio' | 'application'

export interface Profile {
  id: string
  role: UserRole
  displayName: string
  headline: string | null
  location: string | null
  preferredLang: 'en' | 'ar'
  avatarCfUid: string | null
  createdAt: string
  updatedAt: string
}

export interface SeekerProfile {
  id: string
  profileId: string
  skills: string[]
  experienceYears: number
  desiredRoles: string[]
  desiredSalaryMin: number | null
  desiredSalaryMax: number | null
  currency: string
  openToWork: boolean
}

export interface EmployerProfile {
  id: string
  profileId: string
  companyName: string
  companySize: string | null
  industry: string | null
  verified: boolean
}

export interface TeamMember {
  id: string
  employerId: string
  profileId: string
  roleInTeam: 'reviewer' | 'admin'
  createdAt: string
}

export interface Video {
  id: string
  ownerId: string
  cfUid: string
  cfPlaybackId: string | null
  videoType: VideoType
  status: VideoStatus
  durationSecs: number | null
  thumbnailUrl: string | null
  qualityScore: number | null
  language: string
  transcript: string | null
  transcriptAr: string | null
  createdAt: string
}

export interface JobPosting {
  id: string
  employerId: string
  title: string
  titleAr: string | null
  description: string | null
  descriptionAr: string | null
  videoJd: Video | null
  requiredSkills: string[]
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  location: string | null
  remoteAllowed: boolean
  anonymousMode: boolean
  active: boolean
  applicationCount: number
  createdAt: string
  expiresAt: string | null
}

export interface Application {
  id: string
  jobId: string
  seekerId: string
  stage: ApplicationStage
  aiScore: number | null
  matchScore: number | null
  coverVideoId: string | null
  notesBySeeker: string | null
  appliedAt: string
  reviewedAt: string | null
}

export interface PortfolioVideo {
  id: string
  seekerId: string
  videoId: string
  title: string
  skillTags: string[]
  sortOrder: number
  createdAt: string
}

export interface CandidateView {
  applicationId: string
  stage: ApplicationStage
  aiScore: number | null
  matchScore: number | null
  appliedAt: string
  seekerName: string | null
  seekerAvatar: string | null
  skills: string[]
  experienceYears: number
  portfolioVideos: PortfolioVideoSummary[]
  coverVideo: Video | null
  scores: VideoScores | null
  reviews: CandidateReview[]
}

export interface PortfolioVideoSummary {
  id: string
  videoId: string
  title: string
  skillTags: string[]
  thumbnailUrl: string | null
  durationSecs: number | null
  cfPlaybackId: string | null
}

export interface VideoScores {
  videoId: string
  confidenceScore: number | null
  sentimentScore: number | null
  bodyLanguageScore: number | null
  fillerWordRate: number | null
  speechPaceWpm: number | null
  eyeContactScore: number | null
  lightingScore: number | null
  biasFlags: BiasFlag[]
}

export interface BiasFlag {
  type: string
  severity: 'low' | 'medium' | 'high'
  offsetSecs: number
}

export interface CandidateReview {
  id: string
  applicationId: string
  reviewerId: string
  reviewerName?: string
  rating: number | null
  comment: string | null
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  payload: NotificationPayload
  read: boolean
  createdAt: string
}

export type NotificationType =
  | 'application_received'
  | 'stage_changed'
  | 'video_processed'
  | 'shortlisted'
  | 'interview_scheduled'

export interface NotificationPayload {
  jobTitle?: string
  jobId?: string
  applicationId?: string
  newStage?: ApplicationStage
  message?: string
}

export interface RecordingPrompt {
  id: string
  category: 'intro' | 'skill' | 'motivation'
  textEn: string
  textAr: string
  durationHintSecs: number
}

export interface FeedJob {
  id: string
  title: string
  titleAr: string | null
  companyName: string
  companyLogo: string | null
  location: string | null
  remoteAllowed: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  requiredSkills: string[]
  videoJd: {
    cfPlaybackId: string
    thumbnailUrl: string | null
    durationSecs: number | null
  } | null
  matchScore: number | null
  createdAt: string
}
