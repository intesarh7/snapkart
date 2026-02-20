import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import toast from "react-hot-toast";
const defaultSlugs = [
  "privacy-policy",
  "terms-conditions",
  "refund-policy",
  "help-center",
  "contact",
];

export default function AdminPages() {
  const [selectedSlug, setSelectedSlug] = useState("privacy-policy");
  const [customSlug, setCustomSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [message, setMessage] = useState("");

  const finalSlug = customSlug || selectedSlug;

  const fetchPage = async (slug: string) => {
    const res = await fetch(`/api/page/${slug}`);
    if (res.ok) {
      const data = await res.json();
      setTitle(data.title || "");
      setContent(data.content || "");
      setMetaTitle(data.metaTitle || "");
      setMetaDescription(data.metaDescription || "");
    } else {
      setTitle("");
      setContent("");
      setMetaTitle("");
      setMetaDescription("");
    }
  };

const editorRef = useRef<any>(null);
const [editorReady, setEditorReady] = useState(false);

const RichEditor = dynamic(
  () => import("@/components/admin/RichEditor"),
  { ssr: false }
);

  useEffect(() => {
    if (finalSlug) {
      fetchPage(finalSlug);
    }
  }, [finalSlug]);

const handleSave = async () => {
  if (!editorRef.current) return;

  // 🔥 force focus + ensure latest state
  editorRef.current.commands.focus();

  // small microtask delay to flush editor state
  await new Promise((resolve) => setTimeout(resolve, 0));

  const htmlContent = editorRef.current.getHTML();

  if (!htmlContent || htmlContent === "<p></p>") {
    toast.error("Content cannot be empty ❌");
    return;
  }

  try {
    await fetch("/api/page/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: finalSlug,
        title,
        content: htmlContent,
        metaTitle,
        metaDescription,
      }),
    });

    toast.success("Page Saved Successfully ✅");
  } catch {
    toast.error("Something went wrong ❌");
  }
};






  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Website Pages
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl shadow">
            {message}
          </div>
        )}

        {/* Slug Section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <label className="block font-semibold mb-2">
            Select Existing Page
          </label>

          <select
            value={selectedSlug}
            onChange={(e) => {
              setSelectedSlug(e.target.value);
              setCustomSlug("");
            }}
            className="w-full border p-3 rounded-xl mb-4"
          >
            {defaultSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>

          <label className="block font-semibold mb-2">
            Or Create New Custom Slug
          </label>

          <input
            value={customSlug}
            onChange={(e) =>
              setCustomSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
              )
            }
            placeholder="example-page-slug"
            className="w-full border p-3 rounded-xl"
          />

          <p className="text-sm text-gray-500 mt-2">
            Use lowercase & hyphen only (example: about-us)
          </p>
        </div>
        
        {/* Content Section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <label className="block font-semibold mb-2">
            Page Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />

          <label className="block font-semibold mb-2">
            Page Content
          </label>

          <div className="h-96 overflow-y-auto">
           <RichEditor
  initialValue={content}
  onReady={(editor) => {
    editorRef.current = editor;
    setEditorReady(true); // 🔥 mark ready
  }}
/>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">
            SEO Settings
          </h3>

          <label className="block font-semibold mb-2">
            Meta Title
          </label>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Meta title for Google"
            className="w-full border p-3 rounded-xl mb-4"
          />

          <label className="block font-semibold mb-2">
            Meta Description
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            placeholder="Meta description (150-160 characters)"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <button
  type="button"  // 🔥 IMPORTANT
  onClick={handleSave}
  disabled={!editorReady}
  className={`px-6 py-3 rounded-xl text-white ${
    editorReady
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Save Page
</button>

      </div>
    </>
  );
}
