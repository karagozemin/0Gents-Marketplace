import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-400 flex items-center justify-between">
        <span>© 0Gents</span>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-white">About</Link>
          <Link href="/docs" className="hover:text-white">Docs</Link>
          <a href="https://x.com/0G_labs" className="hover:text-white" target="_blank">Socials</a>
        </div>
      </div>
    </footer>
  );
}


