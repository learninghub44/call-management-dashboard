const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://call-management-system-11b9.onrender.com";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "callsystem2024secret";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
};

export type CallStatus =
  | "queued" | "ringing" | "in_progress" | "completed"
  | "busy" | "no_answer" | "failed" | "canceled";

export type Direction = "inbound" | "outbound";

export interface Agent {
  id: string;
  name: string;
  phone_number: string;
  is_available: boolean;
  created_at: string;
  _count?: { calls: number };
}

export interface Call {
  id: string;
  twilio_sid: string | null;
  direction: Direction;
  from_number: string;
  to_number: string;
  status: CallStatus;
  duration: number | null;
  agent_id: string | null;
  agent?: Agent;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCalls {
  data: Call[];
  pagination: { total: number; limit: number; offset: number };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...(options?.headers || {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  health: () => request<{ status: string; ts: string }>("/health"),

  // Agents
  getAgents: () => request<{ data: Agent[] }>("/agents"),
  createAgent: (name: string, phone_number: string) =>
    request<{ data: Agent }>("/agents", {
      method: "POST",
      body: JSON.stringify({ name, phone_number }),
    }),
  setAvailability: (id: string, is_available: boolean) =>
    request<{ data: Agent }>(`/agents/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ is_available }),
    }),

  // Calls
  getCalls: (limit = 100, offset = 0) =>
    request<PaginatedCalls>(`/calls?limit=${limit}&offset=${offset}`),
  makeCall: (to: string) =>
    request<{ data: Call }>("/calls/outbound", {
      method: "POST",
      body: JSON.stringify({ to }),
    }),
};
