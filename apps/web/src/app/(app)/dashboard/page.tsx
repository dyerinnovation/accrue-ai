"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api.get("/skills"),
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Skills</h1>
        <Link href="/skills/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Create Skill
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading skills...</div>
      ) : !skills?.data?.length ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No skills yet</h3>
          <p className="mb-6 text-gray-600">Create your first AI skill to get started.</p>
          <Link href="/skills/new" className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create Your First Skill
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.data.map((skill: { id: string; name: string; description: string; status: string; tags: string[]; version: number }) => (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{skill.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  skill.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                  skill.status === "TESTING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>{skill.status}</span>
              </div>
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">{skill.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>v{skill.version}</span>
                <div className="flex gap-1">
                  {skill.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
