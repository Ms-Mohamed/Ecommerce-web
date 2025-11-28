import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import SessionProvider from "@/components/SessionProvider";
import { DatabaseCartProvider } from "@/lib/contexts/DatabaseCartContext";
import "./globals.css";

// Preload critical resources
if (typeof window !== 'undefined') {
  // Preload API endpoints that will be needed
  const preloadAPI = (url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  };
  
  // Preload critical API endpoints
  preloadAPI('/api/products?limit=12');
  preloadAPI('/api/categories');
}

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "VAL DE SEINE SERVICE - Votre Partenaire de Confiance pour Toutes Vos Technologies",
    description: "VAL DE SEINE SERVICE - Votre Partenaire de Confiance pour Toutes Vos Technologies",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <SessionProvider>
                    <DatabaseCartProvider>
                        <StoreProvider>
                            <Toaster />
                            {children}
                        </StoreProvider>
                    </DatabaseCartProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
