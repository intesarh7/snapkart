import Head from "next/head";

function generateKeywords(title: string, description: string) {
  const baseKeywords = [
    "SnapKart",
    "online food delivery",
    "food ordering app",
    "restaurant delivery",
    "order food online",
  ];

  const dynamicWords = `${title} ${description}`
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .filter(word => word.length > 3);

  const uniqueKeywords = Array.from(
    new Set([...baseKeywords, ...dynamicWords])
  );

  return uniqueKeywords.join(", ");
}

export default function Seo({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}) {

  const keywords = generateKeywords(title, description);

  return (
    <Head>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <link rel="canonical" href={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

    </Head>
  );
}
