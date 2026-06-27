import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
 return(
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <section className="mx-auto max-w-md rounded-2xl border border-white/30 whiteite/20 p-8 shadow-xl">
        <Link href="/" className="text-sm font-medium text-blue-300">
          Clinic Portal
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>

        <div className="mt-8">{children}</div>
      </section>
    </main>
 );
}
