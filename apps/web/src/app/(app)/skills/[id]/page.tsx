"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["skill", id],
    queryFn: () => api.get(`/skills/${id}`),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-500">Loading...</div>;

  const skill = data?.data;
  if (!skill) return <div className="py-12 text-center text-gray-500">Skill not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
          <p className="mt-1 text-gray-600">{skill.description}</p>
        </div>
        <div className="flex gap-2">
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

      <div className="rounded-xl border bg-white p-6">
        <pre className="whitespace-pre-wrap text-sm">{skill.content}</pre>
      </div>
    </div>
  );
}
