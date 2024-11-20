export interface TargetList {
  id: string;
  name: string;
  created_at: string;
  emails: string[];
}

export interface Survey {
  id: string;
  name: string;
  subject: string;
  email_body: string;
  target_list_id: string;
  created_at: string;
  status: 'draft' | 'sent';
  responses_count: number;
  nps_score: number | null;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  email: string;
  score: number;
  feedback: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
}