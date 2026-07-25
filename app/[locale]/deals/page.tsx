import { getDealProducts } from "@/lib/data";
import { DealsContent } from "@/components/deals/deals-content";

export default async function DealsPage() {
  const deals = await getDealProducts();

  return <DealsContent deals={deals} />;
}
