import {
  MeetingListItem,
  MeetingDetail,
  CreateMeetingPayload,
  GlobalSearchResult,
  GlobalAnalytics,
  MeetingAnalytics,
  ActionItem,
  Comment,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getActiveUser(): { email?: string; workspace?: string } {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('fireflies_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return { email: 'bhawya@scaler.com', workspace: 'Scaler AI Labs' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.detail) errorMessage = errorData.detail;
        else errorMessage = Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Meetings CRUD
  async getMeetings(params?: {
    search?: string;
    type?: string;
    participant?: string;
    ordering?: string;
    user_email?: string;
    workspace?: string;
  }): Promise<MeetingListItem[]> {
    const activeUser = getActiveUser();
    const query = new URLSearchParams();

    const email = params?.user_email || activeUser.email;
    if (email) query.append('user_email', email);

    if (params?.search) query.append('search', params.search);
    if (params?.type && params.type !== 'All') query.append('type', params.type);
    if (params?.participant) query.append('participant', params.participant);
    if (params?.ordering) query.append('ordering', params.ordering);

    const res = await fetch(`${API_BASE}/api/v1/meetings/?${query.toString()}`, {
      cache: 'no-store',
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : data.results || [];
  },

  async getMeetingDetail(id: string): Promise<MeetingDetail> {
    const res = await fetch(`${API_BASE}/api/v1/meetings/${id}/`, {
      cache: 'no-store',
    });
    return handleResponse<MeetingDetail>(res);
  },

  async createMeeting(payload: CreateMeetingPayload | FormData): Promise<MeetingDetail> {
    const activeUser = getActiveUser();
    let res: Response;
    if (payload instanceof FormData) {
      if (!payload.has('user_email') && activeUser.email) {
        payload.append('user_email', activeUser.email);
      }
      if (!payload.has('workspace') && activeUser.workspace) {
        payload.append('workspace', activeUser.workspace);
      }
      res = await fetch(`${API_BASE}/api/v1/meetings/`, {
        method: 'POST',
        body: payload,
      });
    } else {
      const dataToSend = {
        user_email: activeUser.email,
        workspace: activeUser.workspace,
        ...payload,
      };
      res = await fetch(`${API_BASE}/api/v1/meetings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
    }
    return handleResponse<MeetingDetail>(res);
  },

  async updateMeeting(id: string, data: Partial<MeetingDetail>): Promise<MeetingDetail> {
    const res = await fetch(`${API_BASE}/api/v1/meetings/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MeetingDetail>(res);
  },

  async deleteMeeting(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/meetings/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete meeting: ${res.statusText}`);
    }
  },

  async seedDemo(user_email?: string, workspace?: string): Promise<any> {
    const activeUser = getActiveUser();
    const res = await fetch(`${API_BASE}/api/v1/meetings/seed-demo/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: user_email || activeUser.email,
        workspace: workspace || activeUser.workspace,
      }),
    });
    return handleResponse(res);
  },

  // AI & Groq Intelligence
  async regenerateSummary(meetingId: string, replaceActionItems = false): Promise<MeetingDetail> {
    const res = await fetch(`${API_BASE}/api/v1/meetings/${meetingId}/generate-summary/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replace_action_items: replaceActionItems }),
    });
    return handleResponse<MeetingDetail>(res);
  },

  async askAI(meetingId: string, question: string, saveToHistory = true): Promise<{
    question: string;
    answer: string;
    message_id?: string;
    created_at?: string;
  }> {
    const res = await fetch(`${API_BASE}/api/v1/meetings/${meetingId}/ask/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, save_to_history: saveToHistory }),
    });
    return handleResponse(res);
  },

  // Action Items CRUD
  async toggleActionItem(actionItemId: string): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/api/v1/action-items/${actionItemId}/toggle/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<ActionItem>(res);
  },

  async createActionItem(
    meetingId: string,
    task: string,
    assignee = 'Unassigned',
    due_date = ''
  ): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/api/v1/action-items/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meeting: meetingId,
        task,
        assignee,
        due_date,
        completed: false,
      }),
    });
    return handleResponse<ActionItem>(res);
  },

  async deleteActionItem(actionItemId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/action-items/${actionItemId}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete action item: ${res.statusText}`);
    }
  },

  // Comments / Notes
  async addComment(
    meetingId: string,
    content: string,
    userName = 'You',
    segmentId?: string | null,
    colorTag = 'purple'
  ): Promise<Comment> {
    const res = await fetch(`${API_BASE}/api/v1/comments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meeting: meetingId,
        segment: segmentId || null,
        user_name: userName,
        content,
        color_tag: colorTag,
      }),
    });
    return handleResponse<Comment>(res);
  },

  async deleteComment(commentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/comments/${commentId}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete comment: ${res.statusText}`);
    }
  },

  // Global Search & Analytics
  async globalSearch(query: string): Promise<GlobalSearchResult> {
    const res = await fetch(`${API_BASE}/api/v1/search/?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });
    return handleResponse<GlobalSearchResult>(res);
  },

  async getGlobalAnalytics(): Promise<GlobalAnalytics> {
    const activeUser = getActiveUser();
    const query = new URLSearchParams();
    if (activeUser.email) query.append('user_email', activeUser.email);

    const res = await fetch(`${API_BASE}/api/v1/analytics/?${query.toString()}`, {
      cache: 'no-store',
    });
    return handleResponse<GlobalAnalytics>(res);
  },

  async getMeetingAnalytics(meetingId: string): Promise<MeetingAnalytics> {
    const res = await fetch(`${API_BASE}/api/v1/analytics/?meeting_id=${meetingId}`, {
      cache: 'no-store',
    });
    return handleResponse<MeetingAnalytics>(res);
  },

  // Export URLs
  getExportUrl(meetingId: string, format: 'markdown' | 'txt' | 'vtt' | 'json'): string {
    return `${API_BASE}/api/v1/meetings/${meetingId}/export/?format=${format}`;
  },
};
