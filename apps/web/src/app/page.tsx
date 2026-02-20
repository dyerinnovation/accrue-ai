import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Image src="/logo.png" alt="" width={32} height={32} />
            Accrue AI
          </h1>
          <nav className="flex gap-4">
            <Link href="/login" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
              Log In
            </Link>
            <Link href="/register" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tight">
            Build AI Skills That <span className="text-blue-600">Compound</span>
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Create, iterate, and share reusable AI agent skills through an assembly line process.
            Each skill builds on the last — your AI capabilities grow over time.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700">
              Start Building
            </Link>
            <Link href="/skills" className="rounded-lg border border-gray-300 px-8 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50">
              Browse Skills
            </Link>
          </div>
        </div>

        <div className="mt-20 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">1</div>
            <h3 className="mb-2 text-lg font-semibold">Create</h3>
            <p className="text-gray-600">
              Describe what you need. Our AI wizard guides you through building a precise, reusable skill.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">2</div>
            <h3 className="mb-2 text-lg font-semibold">Iterate</h3>
            <p className="text-gray-600">
              Test against real scenarios. Get feedback. Improve. Each version is better than the last.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">3</div>
            <h3 className="mb-2 text-lg font-semibold">Accrue</h3>
            <p className="text-gray-600">
              Share with your team. Build on existing skills. Watch your AI capabilities compound.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8 text-center text-sm text-gray-500">
        Accrue AI — AI skills that compound over time.
      </footer>
    </div>
  );
}
