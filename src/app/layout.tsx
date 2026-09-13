export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingContact from "@/components/FloatingContact";
import MobileTabBar from "@/components/MobileTabBar";
import { CartProvider } from "@/components/CartContext";
import { SITE_URL, SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Luxury Down Jackets`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Premium down jackets and puffer coats. 90/10 European goose down, water-repellent shells, honest prices.",
  keywords: ["down jacket", "puffer coat", "luxury down", "winter coat", "goose down jacket", "alpine style"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Luxury Down Jackets`,
    description: "Premium down jackets and puffer coats at honest prices.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Luxury Down Jackets`,
    description: "Premium down jackets and puffer coats at honest prices.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#org",
      name: SITE_NAME,
      url: SITE_URL,
      description: "Premium down jackets and puffer coats.",
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": SITE_URL + "/#org" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col pb-16 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingContact />
          <MobileTabBar />
        </CartProvider>
      </body>
    </html>
  );
}
