import './globals.css';

export const metadata = {
  title: 'InterviewAI Pro',
  description: 'AI-powered interview simulation platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
