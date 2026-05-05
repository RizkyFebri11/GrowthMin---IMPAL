import './globals.css';

export const metadata = {
  title: 'GrowthMin Dashboard',
  description: 'GrowthMin Marketing Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
