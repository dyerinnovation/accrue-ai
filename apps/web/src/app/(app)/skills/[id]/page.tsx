"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
import { api } from "@/lib/api";

interface SkillFile {
  id: string;
  path: string;
  size: number;
  contentType: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FileIcon({ path }: { path: string }) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const icons: Record<string, string> = {
    md: "\u{1F4DD}", py: "\u{1F40D}", js: "\u{1F7E8}", ts: "\u{1F535}",
    sh: "\u{1F4BB}", json: "\u{1F4CB}", yaml: "\u{2699}", yml: "\u{2699}",
  };
  return <span className="mr-1.5">{icons[ext] ?? "\u{1F4C4}"}</span>;
}

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["skill", id],
    queryFn: () => api.get(`/skills/${id}`),
  });

  const { data: filesData } = useQuery({
    queryKey: ["skill-files", id],
    queryFn: () => api.get(`/skills/${id}/files`),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.uploadFiles(`/skills/${id}/files`, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-files", id] });
      setUploading(false);
    },
    onError: () => setUploading(false),
  });

  async function handleDownload() {
    try {
      const blob = await api.download(`/skills/${id}/download`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${skill?.slug ?? "skill"}-v${skill?.version ?? 1}.tar.gz`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. The skill may not have files in the object store.");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    uploadMutation.mutate(Array.from(files));
    e.target.value = "";
  }

  if (isLoading) return <div className="py-12 text-center text-gray-500">Loading...</div>;

  const skill = data?.data;
  if (!skill) return <div className="py-12 text-center text-gray-500">Skill not found</div>;

  const files: SkillFile[] = filesData?.data ?? skill.files ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
          <p className="mt-1 text-gray-600">{skill.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Download</button>
          <Link href={`/skills/${id}/versions`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Versions</Link>
          <Link href={`/skills/${id}/edit`} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">Edit</Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          skill.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        }`}>{skill.status}</span>
        <span className="text-xs text-gray-500">v{skill.version}</span>
        {skill.tags.map((tag: string) => (
          <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{tag}</span>
        ))}
      </div>

      {/* File Browser */}
      {files.length > 0 && (
        <div className="mb-6 rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Files</h2>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-md border px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </button>
            </div>
          </div>
          <div className="divide-y">
            {files.map((file: SkillFile) => (
              <div key={file.path} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50">
                <div className="flex items-center">
                  <FileIcon path={file.path} />
                  <span className="font-mono text-gray-800">{file.path}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
                  <span className="text-xs text-gray-400">{file.contentType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button when no files exist */}
      {files.length === 0 && (
        <div className="mb-6 rounded-xl border border-dashed bg-white p-6 text-center">
          <p className="mb-2 text-sm text-gray-500">No files uploaded yet</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      )}

      {/* SKILL.md Content */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">SKILL.md</h2>
        <pre className="whitespace-pre-wrap text-sm">{skill.content}</pre>
      </div>
    </div>
  );
}
