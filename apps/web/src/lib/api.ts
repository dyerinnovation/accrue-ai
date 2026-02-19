const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeaders() };

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

  /** Upload files via multipart/form-data */
  uploadFiles: async (path: string, files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
    return data;
  },

  /** Download a file as blob */
  download: async (path: string): Promise<Blob> => {
    const res = await fetch(`${API_URL}${path}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Download failed");
    return res.blob();
  },
};
