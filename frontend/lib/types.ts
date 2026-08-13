export interface TranscriptSegment {
  id: string;
  meeting: string;
  speaker_name: string;
  speaker_avatar?: string;
  start_time: number;
  end_time: number;
  text: string;
  sequence_order: number;
  created_at?: string;
}

export interface Summary {
  id: string;
  meeting: string;
  overview: string;
  key_points: string[];
  keywords: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ActionItem {
  id: string;
  meeting: string;
  task: string;
  assignee: string;
  due_date: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id: string;
  meeting: string;
  title: string;
  start_time: number;
  end_time: number;
  summary: string;
  sequence_order: number;
  created_at?: string;
}

export interface Comment {
  id: string;
  meeting: string;
  segment?: string | null;
  user_name: string;
  content: string;
  color_tag: 'purple' | 'yellow' | 'blue' | 'green' | 'pink';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  meeting: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface MeetingListItem {
  id: string;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participants: string[];
  audio_url: string;
  meeting_type: string;
  status: 'processing' | 'processed' | 'failed';
  transcript_count: number;
  action_items_count: number;
  summary_overview: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingDetail {
  id: string;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participants: string[];
  audio_url: string;
  meeting_type: string;
  status: 'processing' | 'processed' | 'failed';
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  action_items: ActionItem[];
  chapters: Chapter[];
  comments: Comment[];
  chat_messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingPayload {
  title: string;
  meeting_date?: string;
  meeting_type?: string;
  participants?: string[];
  audio_url?: string;
  transcript_content?: string;
  auto_generate_summary?: boolean;
}

export interface GlobalSearchResult {
  query: string;
  meetings: MeetingListItem[];
  transcript_matches: {
    segment_id: string;
    meeting_id: string;
    meeting_title: string;
    speaker_name: string;
    start_time: number;
    end_time: number;
    text: string;
    meeting_date: string;
  }[];
  action_item_matches: {
    action_item_id: string;
    meeting_id: string;
    meeting_title: string;
    task: string;
    assignee: string;
    completed: boolean;
  }[];
  total_results: number;
}

export interface GlobalAnalytics {
  total_meetings: number;
  total_hours: number;
  total_action_items: number;
  completed_action_items: number;
  action_completion_rate: number;
  top_topics: string[];
}

export interface MeetingAnalytics {
  meeting_id: string;
  meeting_title: string;
  total_duration_seconds: number;
  total_segments: number;
  talk_time_breakdown: {
    speaker: string;
    seconds: number;
    percentage: number;
  }[];
  action_items_total: number;
  action_items_completed: number;
}
