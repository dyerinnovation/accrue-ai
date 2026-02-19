"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function VersionsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["skill-versions", id],
    queryFn: () => api.get(`/skills/${id}/versions`),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Version History</h1>
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {(data?.data ?? []).map((ver: { id: string; version: number; changelog: string | null; createdAt: string }) => (
            <div key={ver.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Version {ver.version}</span>
                <span className="text-xs text-gray-500">{new Date(ver.createdAt).toLocaleDateString()}</span>
              </div>
              {ver.changelog && <p className="mt-1 text-sm text-gray-600">{ver.changelog}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
