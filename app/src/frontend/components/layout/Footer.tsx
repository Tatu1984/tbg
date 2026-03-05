"use client";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t px-6 py-4 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} The Biker Genome. All rights reserved.
    </footer>
  );
}
