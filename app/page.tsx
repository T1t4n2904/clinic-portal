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
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Clinic Portal</p>

        {isVerified ? (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Phone number verified successfully. Please login from the main
            screen to access your dashboard.
          </div>
        ) : null}

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Patient registration and login system
        </h1>

        <p className="mt-4 text-slate-600">
          Register as a patient, verify your phone number, and access your
          patient dashboard.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
