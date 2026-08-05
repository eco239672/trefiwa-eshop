import "./globals.css";

export const metadata = {
  title: "TREFIWA",
  description: "Zdravé potraviny a sypané čaje",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}