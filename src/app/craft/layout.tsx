import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Craft",
  description:
    "Discover how MYCOAT jackets are made: 90/10 European goose down, water-repellent shells, and precision quilting.",
  alternates: { canonical: "https://www.mycoat.shop/craft" },
};

export default function CraftLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
