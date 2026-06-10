import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { FloatingBackground } from "@/components/FloatingBackground";
import { ProgressSync } from "@/components/ProgressSync";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Misión Matemática de Vacaciones",
  description:
    "Practica matemáticas unos minutos al día, gana estrellas y mejora tus habilidades.",
};

export const viewport: Viewport = {
  themeColor: "#2B6FE3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${baloo.variable} ${nunito.variable} font-body antialiased`}>
        <FloatingBackground />
        <ProgressSync />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Header />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:pb-12">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
