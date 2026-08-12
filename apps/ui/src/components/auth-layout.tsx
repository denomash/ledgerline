export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_50%_0%,_oklch(0.546_0.245_262.881_/_0.12),_transparent_70%)]" />
      {children}
    </div>
  );
}
