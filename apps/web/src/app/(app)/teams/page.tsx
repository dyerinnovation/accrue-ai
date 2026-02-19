"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function TeamsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teams"], queryFn: () => api.get("/teams") });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-8 text-3xl font-bold">Teams</h1>
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(data?.data ?? []).map((team: { id: string; name: string; members: unknown[] }) => (
            <div key={team.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">{team.name}</h3>
              <p className="text-sm text-gray-500">{team.members.length} members</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
