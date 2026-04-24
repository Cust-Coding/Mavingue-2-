import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata = {
  metadataBase: new URL("https://estaleiromavingueonline.com"),

  verification: {
    google: "google1d105e39920db946",
  },

  title: {
    default: "Estaleiro Mavingue",
    template: "%s | Estaleiro Mavingue",
  },

  description:
    "Ferragens, materiais de construção e serviços de canalização em Maputo. Produtos de qualidade com atendimento de confiança.",

  keywords: [
    "ferragens Maputo",
    "ferragens Matola",
    "materiais de construção Maputo",
    "canalização",
    "tubos PVC",
    "Estaleiro Mavingue",
  ],

  openGraph: {
    title: "Estaleiro Mavingue",
    description:
      "Loja de ferragens e serviços de água em Moçambique.",
    url: "https://estaleiromavingueonline.com",
    siteName: "Estaleiro Mavingue",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_MZ",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Estaleiro Mavingue",
    description: "Loja de ferragens e serviços de água em Moçambique.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "https://estaleiromavingueonline.com",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}