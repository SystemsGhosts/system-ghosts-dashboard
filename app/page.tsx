import Dashboard from "@/components/Dashboard";
import { fetchAll } from "@/lib/sheets";

export const revalidate = 3600;
export const dynamic = "force-static";

export default async function Page() {
  const data = await fetchAll();
  return <Dashboard data={data} />;
}
