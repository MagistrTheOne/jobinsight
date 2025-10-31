export interface JobGrade {
  level: 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Unknown';
  score: number; // 1-5
  confidence: number; // 0-100
  reasoning: string;
}

export interface JobAnalysis {
  redFlags: string[];
  requirements: {
    realistic: string[];
    unrealistic: string[];
  };
  salaryInsight: string;
  workLifeBalance: string;
  companyInsights: string;
  atsKeywords: string[];
  recommendedSkills: string[];
  overallScore: string;
  jobGrade?: JobGrade;
}

export interface ResumeAnalysis {
  atsCompatibility: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  formatting: string;
  skillsGap: string[];
  overallScore: string;
}

export interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[];
  education?: string;
}

export interface AnalysisResult {
  type: 'job' | 'resume' | 'cover-letter';
  data: JobAnalysis | ResumeAnalysis | string;
  timestamp: Date;
  id: string;
}

export interface OptimizedContent {
  original: string;
  optimized: string;
  improvements: string[];
  keywordsAdded: string[];
  type: 'cover-letter' | 'resume';
}