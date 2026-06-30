import Link from "next/link";

type LandingPageProps = {
  searchParams: Promise<{
    verified?: string;
  }>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = await searchParams;
  const isVerified = params.verified === "1";

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-6 py-16 text-slate-900 flex items-center justify-center font-sans">
      <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">AyurClinic Portal</p>

        {isVerified ? (
          <div className="mt-4 rounded bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-xs text-emerald-850">
            Phone number verified successfully. Please login to access your dashboard.
          </div>
        ) : null}

        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 leading-tight">
          Holistic Patient Care Workspace
        </h1>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Access your personalized Ayurvedic prescriptions, schedule doctor slots, and consult online or in-clinic.
        </p>

        <div className="mt-6 flex gap-2">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition active:scale-[0.98]"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
