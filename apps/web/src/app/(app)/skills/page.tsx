"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SkillsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api.get("/skills"),
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Browse Skills</h1>
        <Link href="/skills/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Create Skill
        </Link>
      </div>
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data?.data ?? []).map((skill: { id: string; name: string; description: string; status: string; tags: string[] }) => (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md">
              <h3 className="mb-2 font-semibold">{skill.name}</h3>
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">{skill.description}</p>
              <div className="flex gap-1">
                {skill.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
