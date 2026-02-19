"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function EditSkillPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["skill", id], queryFn: () => api.get(`/skills/${id}`) });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setDescription(data.data.description);
      setContent(data.data.content);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: { name: string; description: string; content: string }) => api.put(`/skills/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skill", id] }); router.push(`/skills/${id}`); },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Skill</h1>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name, description, content }); }} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Content (SKILL.md)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} className="w-full rounded-md border px-3 py-2 font-mono text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
          <button type="button" onClick={() => router.back()} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
