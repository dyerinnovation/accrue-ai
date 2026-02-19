"use client";
import { useParams } from "next/navigation";

export default function EvalsPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Eval Results</h1>
      <p className="text-gray-600">Eval dashboard for skill {id}.</p>
    </div>
  );
}
