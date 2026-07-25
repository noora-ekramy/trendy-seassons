import { redirect } from "next/navigation";

export default async function BuildsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/products`);
}
