export type Gender = 'MALE' | 'FEMALE';

export type FunnelStage =
  | 'PROFILE_REVIEW'
  | 'VERIFIED'
  | 'ACTIVE_SEARCH'
  | 'POTENTIAL_MATCH_FOUND'
  | 'INTRODUCTION_SENT'
  | 'FIRST_CALL_SCHEDULED'
  | 'DATING'
  | 'RELATIONSHIP'
  | 'ENGAGED'
  | 'MARRIED';

export type MatchStatus =
  | 'NEW'
  | 'WAITING_REVIEW'
  | 'SENT'
  | 'AWAITING_FEEDBACK'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ON_HOLD';

export type FeedbackResponse =
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'NEED_MORE_TIME'
  | 'DATE_SCHEDULED'
  | 'FOLLOW_UP_NEEDED';

export type FeedbackReason =
  | 'LOCATION_MISMATCH'
  | 'LIFESTYLE_MISMATCH'
  | 'TIMING'
  | 'FAMILY_CONCERNS'
  | 'NO_CHEMISTRY'
  | 'OTHER';

export type NoteCategory =
  | 'GENERAL'
  | 'PREFERENCE'
  | 'CONCERN'
  | 'CALL_LOG'
  | 'FAMILY'
  | 'FEEDBACK'
  | 'STRATEGY';

export interface Matchmaker {
  id: string;
  email: string;
  name: string;
}

export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  city: string;
  designation: string;
  currentCompany: string;
  religion: string;
  degree: string;
  currentStage: FunnelStage;
  verified: boolean;
  relationshipGoals: string;
}

export interface Customer extends CustomerSummary {
  dateOfBirth: string;
  country: string;
  height: number;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  undergraduateCollege: string;
  income: number;
  maritalStatus: string;
  languagesKnown: string[];
  siblings: number;
  caste: string | null;
  wantKids: string;
  openToRelocate: string;
  openToPets: string;
  motherTongue: string;
  dietPreference: string;
  smokingPreference: string;
  drinkingPreference: string;
  familyType: string;
  manglik: string;
  educationPreference: string | null;
  partnerAgePreferenceMin: number | null;
  partnerAgePreferenceMax: number | null;
  preferredCities: string[];
  familyExpectations: string | null;
  lifestylePreferences: string[];
  coreValues: string[];
  nonNegotiables: string[];
  lastInteractionDate: string | null;
  matchActivityScore: number;
  assignedMatchmaker: { id: string; name: string } | null;
  counts?: { notes: number; timeline: number; matchesAsClient: number };
}

export interface CustomerListResponse {
  data: (Customer & { assignedMatchmaker: { id: string; name: string } | null })[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export type Breakdown = Record<string, number>;

export interface Match {
  id: string;
  customerId?: string;
  overallScore: number;
  breakdown: Breakdown;
  strengths: string[];
  concerns: string[];
  status: MatchStatus;
  aiExplanation: string | null;
  createdAt: string;
  candidate: CustomerSummary;
  client?: CustomerSummary;
  feedback?: Feedback[];
}

export interface Feedback {
  id: string;
  matchId: string;
  response: FeedbackResponse;
  reason: FeedbackReason | null;
  notes: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  customerId: string;
  category: NoteCategory;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

export type TimelineEventType =
  | 'PROFILE_CREATED'
  | 'VERIFICATION'
  | 'STAGE_CHANGE'
  | 'NOTE_ADDED'
  | 'MATCH_GENERATED'
  | 'INTRODUCTION_SENT'
  | 'FEEDBACK_RECEIVED'
  | 'CALL_SCHEDULED'
  | 'STATUS_UPDATE';

export interface TimelineEvent {
  id: string;
  customerId: string;
  type: TimelineEventType;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardKpis {
  totalClients: number;
  activeSearches: number;
  verifiedCount: number;
  matchesSent: number;
  introductionsSent: number;
  meetingsScheduled: number;
  relationships: number;
  engagements: number;
  marriages: number;
  successRate: number;
}

export interface FunnelStageCount {
  stage: FunnelStage;
  label: string;
  count: number;
}

export interface MatchmakerInsights {
  personalitySummary: string;
  relationshipPriorities: string[];
  potentialChallenges: string[];
  suggestedStrategy: string;
}

export interface IntroductionVariants {
  warm: string;
  professional: string;
  personalized: string;
}

export interface SuccessStories {
  relationships: number;
  engagements: number;
  marriages: number;
  successRate: number;
  avgDaysToMatch: number;
  stories: {
    client: CustomerSummary;
    partner: CustomerSummary | null;
    stage: FunnelStage;
    score: number | null;
  }[];
}

export interface QueueData {
  NEW: QueueItem[];
  WAITING_REVIEW: QueueItem[];
  SENT: QueueItem[];
  AWAITING_FEEDBACK: QueueItem[];
}

export interface QueueItem {
  id: string;
  overallScore: number;
  status: MatchStatus;
  strengths: string[];
  concerns: string[];
  candidate: CustomerSummary;
  client: CustomerSummary;
  createdAt: string;
}
