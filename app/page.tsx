import Dashboard from "@/components/Dashboard";
import { fetchAll } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const data = await fetchAll();
  return <Dashboard data={data} />;
}
