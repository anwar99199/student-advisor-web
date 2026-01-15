// Supabase configuration (hardcoded from info.tsx)
const projectId = "ukxgekdhlyhaooqzdime";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGdla2RobHloYW9vcXpkaW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTM1MzUsImV4cCI6MjA4Mzk4OTUzNX0.SEHR9CncEdDGFVgc1Wa7ifYBcwEbABPAPQhA_-toyG4";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c2f27df0`;

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  userId: string;
  userEmail: string;
  fileName: string;
  plan: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

class SupabaseClient {
  private accessToken: string | null = null;

  constructor() {
    // Load token from localStorage if exists
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken && !options.headers?.['Authorization']) {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
      if (endpoint !== '/signin' && endpoint !== '/signup') {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      } else {
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
      }
    } else if (!headers['Authorization']) {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async signUp(email: string, password: string, name: string) {
    const data = await this.request('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    return data;
  }

  async signIn(email: string, password: string) {
    const data = await this.request('/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.session) {
      this.accessToken = data.session.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  }

  async signOut() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const data = await this.request('/me');
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async uploadReceipt(fileName: string, fileData: string, plan: string, amount: string) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const data = await this.request('/upload-receipt', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileData, plan, amount }),
    });

    return data;
  }

  async getReceipts(): Promise<Receipt[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const data = await this.request('/receipts');
    return data.receipts;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const supabase = new SupabaseClient();
