import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://estaleiromavingueonline.com"),

  title: {
    default: "Estaleiro Mavingue",
    template: "%s | Estaleiro Mavingue",
  },

  description:
    "Ferragens, materiais de construção e serviços de água em Maputo. Qualidade e confiança.",

  keywords: [
    "ferragens Maputo",
    "materiais de construção",
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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_MZ",
    type: "website",
  },

  alternates: {
    canonical: "https://estaleiromavingueonline.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}