export const metadata = {
  title: "SnapKart",
  description: "Online Food Delivery App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff4d4f" />
      </head>
      <body>{children}</body>
    </html>
  );
}