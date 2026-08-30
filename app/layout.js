import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { ToastProvider } from '@/components/ToastContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Marketplace MVP — Modern Full-Stack Next.js Platform',
  description: 'Role-based marketplace with multi-role auth, atomic inventory transactions, and state machine order workflow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">{children}</main>
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
