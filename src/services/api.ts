import {
  User,
  Ticket,
  Asset,
  Department,
  TicketComment,
  TicketFeedback,
  AuditLog,
  DashboardMetrics,
  TicketPriority,
  TicketStatus,
} from '../types/index.ts';

const TOKEN_KEY = 'it_helpdesk_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set JSON Content-Type only if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'ไม่สามารถประมวลผลการตอบกลับจากเซิร์ฟเวอร์ได้',
  }));

  if (!response.ok || data.success === false) {
    const error: any = new Error(data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    error.errors = data.errors;
    error.status = response.status;
    throw error;
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    authStorage.setToken(res.token);
    return res;
  },

  register: async (userData: any) => {
    const res = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    authStorage.setToken(res.token);
    return res;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  getMe: async () => {
    return request<User>('/auth/me');
  },

  // Tickets
  getTickets: async (filters?: {
    status?: string;
    priority?: string;
    category?: string;
    departmentId?: number | string;
    technicianId?: number | string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== 'all') {
          params.append(key, String(val));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Ticket[]>(`/tickets${query}`);
  },

  getTicketById: async (id: number) => {
    return request<Ticket>(`/tickets/${id}`);
  },

  // Public Guest Ticket Operations (no auth needed)
  createPublicTicket: async (formData: FormData) => {
    return request<Ticket>('/tickets/public', {
      method: 'POST',
      body: formData,
    });
  },

  trackTicket: async (ticketNumber: string, verificationCode: string) => {
    return request<Ticket>('/tickets/track', {
      method: 'POST',
      body: JSON.stringify({ ticketNumber, verificationCode }),
    });
  },

  addPublicComment: async (
    ticketNumber: string,
    verificationCode: string,
    comment: string,
    commenterName?: string
  ) => {
    return request<TicketComment>('/tickets/track/comments', {
      method: 'POST',
      body: JSON.stringify({ ticketNumber, verificationCode, comment, commenterName }),
    });
  },

  submitPublicFeedback: async (
    ticketNumber: string,
    verificationCode: string,
    rating: number,
    comment?: string
  ) => {
    return request<TicketFeedback>('/tickets/track/feedback', {
      method: 'POST',
      body: JSON.stringify({ ticketNumber, verificationCode, rating, comment }),
    });
  },

  createTicket: async (formData: FormData) => {
    return request<Ticket>('/tickets', {
      method: 'POST',
      body: formData,
    });
  },

  updateTicketStatus: async (
    id: number,
    payload: {
      status: TicketStatus;
      notes?: string;
      diagnosis?: string;
      repairActions?: string;
      resolutionNotes?: string;
    }
  ) => {
    return request<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  assignTechnician: async (id: number, technicianId: number) => {
    return request<Ticket>(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ technicianId }),
    });
  },

  updateTicketPriority: async (id: number, priority: TicketPriority) => {
    return request<Ticket>(`/tickets/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  },

  addComment: async (ticketId: number, comment: string, isInternal = false) => {
    return request<TicketComment>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, isInternal }),
    });
  },

  submitFeedback: async (ticketId: number, rating: number, comment?: string) => {
    return request<TicketFeedback>(`/tickets/${ticketId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  // Assets
  getAssets: async (filters?: {
    category?: string;
    departmentId?: number | string;
    status?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== 'all') {
          params.append(key, String(val));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Asset[]>(`/assets${query}`);
  },

  getAssetById: async (id: number) => {
    return request<Asset>(`/assets/${id}`);
  },

  createAsset: async (data: Partial<Asset>) => {
    return request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAsset: async (id: number, data: Partial<Asset>) => {
    return request<Asset>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAsset: async (id: number) => {
    return request<{ success: boolean }>(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  // Users & Departments
  getUsers: async () => {
    return request<User[]>('/users');
  },

  getTechnicians: async () => {
    return request<User[]>('/users/technicians');
  },

  getDepartments: async () => {
    return request<Department[]>('/users/departments');
  },

  updateUserRole: async (
    id: number,
    data: { role?: string; isActive?: boolean; departmentId?: number | null }
  ) => {
    return request<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Reports
  getDashboardMetrics: async () => {
    return request<DashboardMetrics>('/reports/dashboard');
  },

  getReportData: async (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    return request<Ticket[]>(`/reports/data?${searchParams.toString()}`);
  },

  exportReportCsvUrl: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const token = authStorage.getToken();
    if (token) searchParams.append('auth_token', token);
    return `/api/reports/export-csv?${searchParams.toString()}`;
  },

  // Audit Logs
  getAuditLogs: async (limit = 100) => {
    return request<AuditLog[]>(`/audit-logs?limit=${limit}`);
  },
};
