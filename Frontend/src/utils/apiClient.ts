const API_BASE = "https://localhost:7197/api";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers: isFormData
      ? options.headers // ne állíts be Content-Type-ot FormData-nál!
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
    body: options.body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${text}`);
  }

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
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, token?: string): Promise<T> => {
    // Megállapítjuk, hogy FormData-t küldünk-e
    const isFormData = body instanceof FormData;
    
    return request<T>(endpoint, {
      method: "PUT",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // FormData esetén nem stringify-eljük, egyébként igen
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  delete: (endpoint: string, token?: string): Promise<void> =>
    request<void>(endpoint, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),

  postForm: <T>(endpoint: string, formData: FormData, token?: string): Promise<T> =>
    request<T>(endpoint, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    }),
};

export default apiClient;
