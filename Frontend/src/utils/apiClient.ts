const API_BASE = "https://localhost:7197/api";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await res.text();
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  console.log(text);
  if (!text) {
    return [] as unknown as T;
  }  
  return JSON.parse(text) as T;
}

const apiClient = {
  get: <T>(endpoint: string, token?: string): Promise<T> =>
    request<T>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),

  post: <T>(endpoint: string, body: unknown, token?: string): Promise<T> =>
    request<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, token?: string): Promise<T> =>
    request<T>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),

  delete: (endpoint: string, token?: string): Promise<void> =>
    request<void>(endpoint, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
};

export default apiClient;
