import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
 return(
    <main className="min-h-screen bg-[#FAF9F6] px-6 py-16 text-slate-900 flex items-center justify-center font-sans">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <Link href="/" className="text-xs font-bold uppercase tracking-wider text-emerald-800 hover:text-emerald-700 transition">
          Ayurveda Clinic
        </Link>

        <h1 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>

        <div className="mt-5">{children}</div>
      </section>
    </main>
 );
}
