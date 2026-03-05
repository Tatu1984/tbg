import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Brand panel with biker image */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80"
          alt="Motorcycle"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        <div className="relative p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/25">
              <span className="text-brand-foreground font-black text-lg">B</span>
            </div>
            <div>
              <span className="text-white font-black text-lg block leading-none">THE BIKER</span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand uppercase">GENOME</span>
            </div>
          </div>
          <div>
            <blockquote className="text-3xl font-black leading-tight text-white mb-4 tracking-tight">
              &ldquo;GEAR UP.<br />
              <span className="text-brand">RIDE SAFE.</span>&rdquo;
            </blockquote>
            <p className="text-white/50 text-sm max-w-sm">
              Billing, inventory, e-commerce &mdash; everything your store needs,
              unified in one powerful system.
            </p>
          </div>
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} The Biker Genome &middot; Powered by Infiniti Tech Partners
          </p>
        </div>
      </div>
      {/* Right - Form */}
      <div className="flex items-center justify-center p-8 bg-background">{children}</div>
    </div>
  );
}
