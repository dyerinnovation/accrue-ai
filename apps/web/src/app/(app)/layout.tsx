import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">Accrue AI</Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link href="/skills" className="hover:text-blue-600">Skills</Link>
            <Link href="/teams" className="hover:text-blue-600">Teams</Link>
            <Link href="/settings" className="hover:text-blue-600">Settings</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
