const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Request failed");
  return data;
}

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body?: unknown) => request("POST", path, body),
  put: (path: string, body?: unknown) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
};
