import Seo from "@/components/Seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DynamicPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/page/${slug}`)
      .then((res) => res.json())
      .then((data) => setPage(data));
  }, [slug]);

  if (!page) return <div className="p-10"><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>;

  const siteUrl = "https://yourdomain.com"; // change later
  const pageUrl = `${siteUrl}/${slug}`;

  return (
    <>
      <Seo
        title={
          page.metaTitle
            ? `${page.metaTitle} | SnapKart`
            : `${page.title} | SnapKart`
        }
        description={
          page.metaDescription
            ? page.metaDescription
            : page.content.slice(0, 160)
        }
        url={pageUrl}
      />

      {/* Header */}
      <div className="mb-10">
        <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end py-8 px-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

          <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
            {page.title}
          </h1>

          <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
            Please read carefully.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-6">
          {page.title}
        </h1>

        <div className="prose max-w-none">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }}/>
        </div>
      </div>
    </>
  );
}
