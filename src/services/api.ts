/**
 * Serviços de API para comunicação com o backend
 */

import { ApiResponse, Member, Event, Ministry, DashboardStats, HealthStatus, FinanceTransaction } from '@/types';

export interface CongregationOption {
  id: string;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  email: string | null;
  phone: string | null;
  legalName: string | null;
  taxId: string | null;
  isActive: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erro ao fazer requisição',
        status: response.status,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Erro de conexão com servidor',
    };
  }
}

/**
 * Serviço de Membros
 */
export const congregationService = {
  async getAll(): Promise<ApiResponse<CongregationOption[]>> {
    return apiCall<CongregationOption[]>('/api/congregations');
  },

  async create(data: Partial<CongregationOption>): Promise<ApiResponse<CongregationOption>> {
    return apiCall<CongregationOption>('/api/congregations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string | number, data: Partial<CongregationOption>): Promise<ApiResponse<CongregationOption>> {
    return apiCall<CongregationOption>(`/api/congregations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const memberService = {
  async getAll(): Promise<ApiResponse<Member[]>> {
    return apiCall<Member[]>('/api/members');
  },

  async getById(id: string | number): Promise<ApiResponse<Member>> {
    return apiCall<Member>(`/api/members/${id}`);
  },

  async create(data: Omit<Member, 'id'>): Promise<ApiResponse<Member>> {
    return apiCall<Member>('/api/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string | number, data: Partial<Member>): Promise<ApiResponse<Member>> {
    return apiCall<Member>(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiCall<void>(`/api/members/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Serviço de Eventos
 */
export const eventService = {
  async getAll(): Promise<ApiResponse<Event[]>> {
    return apiCall<Event[]>('/api/events');
  },

  async getById(id: string | number): Promise<ApiResponse<Event>> {
    return apiCall<Event>(`/api/events/${id}`);
  },

  async getUpcoming(): Promise<ApiResponse<Event[]>> {
    return apiCall<Event[]>('/api/events?filter=upcoming');
  },

  async create(data: Omit<Event, 'id'>): Promise<ApiResponse<Event>> {
    return apiCall<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string | number, data: Partial<Event>): Promise<ApiResponse<Event>> {
    return apiCall<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiCall<void>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Serviço de Ministérios
 */
export const ministryService = {
  async getAll(): Promise<ApiResponse<Ministry[]>> {
    return apiCall<Ministry[]>('/api/ministries');
  },

  async getById(id: string | number): Promise<ApiResponse<Ministry>> {
    return apiCall<Ministry>(`/api/ministries/${id}`);
  },

  async create(data: Omit<Ministry, 'id'>): Promise<ApiResponse<Ministry>> {
    return apiCall<Ministry>('/api/ministries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string | number, data: Partial<Ministry>): Promise<ApiResponse<Ministry>> {
    return apiCall<Ministry>(`/api/ministries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiCall<void>(`/api/ministries/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Serviço de Dashboard
 */
export const financeServiceApi = {
  async getAll(): Promise<ApiResponse<FinanceTransaction[]>> {
    return apiCall<FinanceTransaction[]>('/api/finance');
  },

  async getById(id: string | number): Promise<ApiResponse<FinanceTransaction>> {
    return apiCall<FinanceTransaction>(`/api/finance/${id}`);
  },

  async create(data: Partial<FinanceTransaction>): Promise<ApiResponse<FinanceTransaction>> {
    return apiCall<FinanceTransaction>('/api/finance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string | number, data: Partial<FinanceTransaction>): Promise<ApiResponse<FinanceTransaction>> {
    return apiCall<FinanceTransaction>(`/api/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiCall<void>(`/api/finance/${id}`, {
      method: 'DELETE',
    });
  },
};

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiCall<DashboardStats>('/api/dashboard/stats');
  },

  async getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
    return apiCall<HealthStatus>('/api/health');
  },
};
