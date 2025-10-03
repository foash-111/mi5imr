"use client"

import type React from "react"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Youtube from "@tiptap/extension-youtube"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  YoutubeIcon,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { uploadToFalStorageClient } from "@/lib/upload-utils"
import { useToast } from "@/hooks/use-toast"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "ابدأ الكتابة هنا..." }: RichTextEditorProps) {
  const { toast } = useToast()
  const editorRef = useRef<any>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-vintage-accent underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-md overflow-hidden my-4",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[300px] rtl:text-right text-right direction-rtl",
        dir: "rtl",
        lang: "ar",
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md border-vintage-border" ref={editorRef}>
      <div className="flex flex-wrap gap-1 p-2 border-b border-vintage-border bg-vintage-paper-dark/5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-vintage-paper-dark/10" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-vintage-paper-dark/10" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-vintage-paper-dark/10" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-vintage-paper-dark/10" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-vintage-paper-dark/10" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-vintage-paper-dark/10" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-vintage-paper-dark/10" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="h-6 border-r border-vintage-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="[&_.ProseMirror]:text-right [&_.ProseMirror]:direction-rtl [&_.ProseMirror]:text-align-right [&_.ProseMirror_p]:text-right [&_.ProseMirror_h1]:text-right [&_.ProseMirror_h2]:text-right [&_.ProseMirror_h3]:text-right [&_.ProseMirror_li]:text-right [&_.ProseMirror_blockquote]:text-right [&_.ProseMirror]:font-family-['Noto_Naskh_Arabic',_serif]"
        />
      </div>
      <style jsx>{`
        .ProseMirror {
          direction: rtl !important;
          text-align: right !important;
          font-family: 'Noto Naskh Arabic', serif !important;
        }
        .ProseMirror p {
          text-align: right !important;
          direction: rtl !important;
        }
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          text-align: right !important;
          direction: rtl !important;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          text-align: right !important;
          direction: rtl !important;
          padding-right: 1.5em !important;
          padding-left: 0 !important;
        }
        .ProseMirror li {
          text-align: right !important;
          direction: rtl !important;
        }
        .ProseMirror blockquote {
          text-align: right !important;
          direction: rtl !important;
          border-right: 3px solid #e5e7eb !important;
          border-left: none !important;
          padding-right: 1em !important;
          padding-left: 0 !important;
          margin-right: 0 !important;
          margin-left: 0 !important;
        }
        .ProseMirror::placeholder {
          text-align: right !important;
          direction: rtl !important;
        }
      `}</style>
    </div>
  )
}
