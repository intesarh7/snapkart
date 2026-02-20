import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        {/* Charset */}
        <meta charSet="UTF-8" />

        {/* Preconnect Example */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        {/* Default Favicon */}
        <link rel="icon" href="/favicon.ico" />

      </Head>

      <body className="antialiased font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
