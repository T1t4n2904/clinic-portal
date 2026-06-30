import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  redirect(`/api/prescription/${id}/pdf`);
}
export const dynamic = "force-dynamic";
