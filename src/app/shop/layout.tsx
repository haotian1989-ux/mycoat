import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Shop premium down jackets and puffer coats for men and women. 90/10 European goose down, from $149.",
  alternates: { canonical: `${SITE_URL}/shop` },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
