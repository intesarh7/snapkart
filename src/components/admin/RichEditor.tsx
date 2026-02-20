"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { useEffect, useState, useRef  } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export default function RichEditor({
  initialValue,
  onReady,
}: {
  initialValue: string;
  onReady: (editor: any) => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
const hasInitialized = useRef(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
  if (editor && !hasInitialized.current) {
    editor.commands.setContent(initialValue || "");
    hasInitialized.current = true;
  }
}, [editor, initialValue]);

  // 🔥 pass editor instance to parent
  useEffect(() => {
    if (editor) {
      onReady(editor);
    }
  }, [editor, onReady]);

  if (!editor) return null;

  return (
    <div
      className={`border rounded-xl bg-white transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 p-6 overflow-auto"
          : "p-4"
      }`}
    >
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
            className="px-3 py-1 border rounded-lg"
          >
            Bold
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
            className="px-3 py-1 border rounded-lg"
          >
            Italic
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className="px-3 py-1 border rounded-lg"
          >
            H2
          </button>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 border rounded-lg"
        >
          {isFullscreen ? (
            <Minimize2 size={18} />
          ) : (
            <Maximize2 size={18} />
          )}
        </button>
      </div>

      <div
        className={`resize-y overflow-auto border rounded-lg ${
          isFullscreen ? "min-h-[70vh]" : "min-h-80"
        }`}
      >
        <EditorContent
          editor={editor}
          className="prose max-w-none p-4 outline-none"
        />
      </div>
    </div>
  );
}
