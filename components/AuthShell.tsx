import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
 return(
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 flex items-center justify-center font-sans">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-xs font-semibold uppercase tracking-wider text-emerald-800 hover:text-emerald-700">
          Clinic Portal
        </Link>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>

        <div className="mt-6">{children}</div>
      </section>
    </main>
 );
}
