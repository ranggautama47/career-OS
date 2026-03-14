"use client"

/*
────────────────────────────────────────
RichEditor.tsx
Notion-style Rich Text Editor for CareerOS
Features:
• Bold / Italic / Code
• Headings
• Lists
• Checklist
• Blockquote
• Code block
• Horizontal rule
• Image upload (Supabase Storage)
• Drag & Drop image
────────────────────────────────────────
*/

import { useRef } from "react"
import { supabase } from "@/lib/supabase"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import Dropcursor from "@tiptap/extension-dropcursor"

import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckSquare,
  Undo,
  Redo,
  Minus,
  ImageIcon,
} from "lucide-react"

//////////////////////////////////////////////////////
// Toolbar Button Component
//////////////////////////////////////////////////////

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={[
        "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all",
        active
          ? "bg-emerald-500 text-white shadow"
          : "text-slate-300 hover:text-white hover:bg-slate-600/70",
        disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-slate-600/50 mx-1 flex-shrink-0" />
}

//////////////////////////////////////////////////////
// Toolbar Component
//////////////////////////////////////////////////////

function Toolbar({
  editor,
  openImageUpload,
}: {
  editor: Editor | null
  openImageUpload: () => void
}) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5 px-3 py-2.5 border-b border-slate-600/40 flex-wrap bg-slate-800/60">

      {/* Undo / Redo */}
      <ToolBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={14} />
      </ToolBtn>

      <Divider />

      {/* Upload Image */}
      <ToolBtn onClick={openImageUpload} title="Upload Image">
        <ImageIcon size={14} />
      </ToolBtn>

      <Divider />

      {/* Text Style */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <Code size={14} />
      </ToolBtn>

      <Divider />

      {/* Headings */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        <Heading1 size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 size={14} />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
      >
        <CheckSquare size={14} />
      </ToolBtn>

      <Divider />

      {/* Blocks */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote size={14} />
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
      >
        <span className="font-mono text-[11px]">&lt;/&gt;</span>
      </ToolBtn>

      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={14} />
      </ToolBtn>
    </div>
  )
}

//////////////////////////////////////////////////////
// Main RichEditor Component
//////////////////////////////////////////////////////

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichEditor({
  content,
  onChange,
  placeholder = "Start writing your note...",
  minHeight = 300,
}: RichEditorProps) {

  const fileInputRef = useRef<HTMLInputElement>(null)

  //////////////////////////////////////////
  // Upload Image to Supabase Storage
  //////////////////////////////////////////

  const uploadImage = async (file: File, editor: Editor) => {

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("note-images")
      .upload(fileName, file)

    if (error) {
      console.error("Upload error:", error)
      return
    }

    const { data } = supabase.storage
      .from("note-images")
      .getPublicUrl(fileName)

    const url = data.publicUrl

    editor.chain().focus().setImage({ src: url }).run()
  }

  //////////////////////////////////////////
  // TipTap Editor
  //////////////////////////////////////////

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),

      Dropcursor.configure({
        width: 2,
        color: "#34d399",
      }),

      Placeholder.configure({
        placeholder,
      }),

      TaskList,
      TaskItem.configure({ nested: true }),
    ],

    content: content || "",

    editorProps: {

      handleDrop(view, event) {

        const file = event.dataTransfer?.files?.[0]

        if (file && file.type.startsWith("image/")) {

          uploadImage(file, editor!)

          return true
        }

        return false
      },

      attributes: {
        class: "rich-editor-content focus:outline-none",
        style: `min-height:${minHeight}px;padding:18px 20px`,
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  //////////////////////////////////////////
  // Open File Picker
  //////////////////////////////////////////

  const openImageUpload = () => {
    fileInputRef.current?.click()
  }

  //////////////////////////////////////////
  // File Input Change
  //////////////////////////////////////////

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0]

    if (!file || !editor) return

    uploadImage(file, editor)
  }

  //////////////////////////////////////////
  // Render
  //////////////////////////////////////////

  return (
    <div className="rounded-xl border border-slate-600/50 bg-slate-800/40 overflow-hidden">

      <Toolbar editor={editor} openImageUpload={openImageUpload} />

      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

    </div>
  )
}