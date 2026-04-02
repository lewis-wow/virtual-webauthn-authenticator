import { Providers } from '@/Providers';
import { Toaster } from '@repo/ui/components/ui/sonner';
import '@repo/ui/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: 'Virtual WebAuthn Authenticator',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background font-sans antialiased">
        <main className="h-full">
          <Providers>{children}</Providers>
        </main>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
