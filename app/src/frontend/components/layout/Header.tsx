"use client";

export function Header() {
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold">The Biker Genome</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Admin</span>
      </div>
    </header>
  );
}
