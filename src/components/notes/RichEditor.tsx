"use client";

/*
────────────────────────────────────────
RichEditor.tsx — CareerOS
Features:
• Bold / Italic / Inline Code
• Headings H1 H2 H3
• Bullet / Numbered / Checklist
• Blockquote / Code Block / HR
• Image upload (Supabase Storage) + Drag & Drop
• Table (insert, add/delete row/col)
• Sticky Toolbar (tidak hilang saat scroll)
• BubbleMenu (toolbar muncul saat teks diseleksi, mirip Notion)
────────────────────────────────────────
*/

import { useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Dropcursor from "@tiptap/extension-dropcursor";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { BubbleMenu } from "@tiptap/react";
import { BubbleMenu as BubbleMenuExtension } from "@tiptap/extension-bubble-menu";
import {
  Bold,
  Italic,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Undo,
  Redo,
  Minus,
  ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
} from "lucide-react";

// ── Toolbar Button ─────────────────────────────────────────────────────────────
 
function ToolBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      aria-label={title}
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
  );
}
 
function Divider() {
  return <div className="w-px h-5 bg-slate-600/50 mx-1 flex-shrink-0" />;
}
 
// ── Sticky Toolbar ─────────────────────────────────────────────────────────────
 
function Toolbar({
  editor,
  openImageUpload,
}: {
  editor: Editor | null;
  openImageUpload: () => void;
}) {
  if (!editor) return null;
 
  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 px-3 py-2.5 border-b border-slate-600/40 flex-wrap bg-[#111827] shadow-sm">
      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo size={14} />
      </ToolBtn>
 
      <Divider />
 
      {/* Image Upload */}
      <ToolBtn onClick={openImageUpload} title="Upload Image">
        <ImageIcon size={14} />
      </ToolBtn>
 
      <Divider />
 
      {/* Text Style */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <Bold size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <Italic size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
        <Code size={14} />
      </ToolBtn>
 
      <Divider />
 
      {/* Headings */}
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <Heading1 size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <Heading2 size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <Heading3 size={14} />
      </ToolBtn>
 
      <Divider />
 
      {/* Lists */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
        <List size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
        <ListOrdered size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Checklist">
        <CheckSquare size={14} />
      </ToolBtn>
 
      <Divider />
 
      {/* Blocks */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
        <Quote size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
        <span className="font-mono text-[11px]">&lt;/&gt;</span>
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus size={14} />
      </ToolBtn>
 
      <Divider />
 
      {/* Table */}
      <ToolBtn
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        active={editor.isActive("table")}
        title="Insert Table"
      >
        <TableIcon size={14} />
      </ToolBtn>
 
      {/* Table controls — hanya muncul saat cursor di dalam tabel */}
      {editor.isActive("table") && (
        <>
          <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">
            <span className="text-[9px] font-bold flex items-center gap-0.5"><Plus size={8} />Col</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
            <span className="text-[9px] font-bold flex items-center gap-0.5"><Plus size={8} />Row</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
            <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5"><Trash2 size={8} />Col</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
            <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5"><Trash2 size={8} />Row</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
            <Trash2 size={12} className="text-red-400" />
          </ToolBtn>
        </>
      )}
    </div>
  );
}
 
// ── Bubble Menu (muncul saat teks diseleksi, persis seperti Notion) ────────────
 
function FloatingToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
 
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top" }}
      shouldShow={({ from, to }: { from: number; to: number }) => from !== to}
    >
      <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-[#0d1120] border border-slate-600/60 shadow-2xl shadow-black/60">
        {[
          { fn: () => editor.chain().focus().toggleBold().run(),               active: editor.isActive("bold"),                    icon: <Bold size={12} />,     title: "Bold"     },
          { fn: () => editor.chain().focus().toggleItalic().run(),             active: editor.isActive("italic"),                  icon: <Italic size={12} />,   title: "Italic"   },
          { fn: () => editor.chain().focus().toggleCode().run(),               active: editor.isActive("code"),                    icon: <Code size={12} />,     title: "Code"     },
        ].map((b, i) => (
          <button
            key={i}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); b.fn(); }}
            title={b.title}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-all ${b.active ? "bg-emerald-500/25 text-emerald-300" : "text-slate-300 hover:bg-slate-700"}`}
          >
            {b.icon}
          </button>
        ))}
        <div className="w-px h-4 bg-slate-600 mx-0.5" />
        {[
          { fn: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), icon: <Heading2 size={12} />, title: "H2"       },
          { fn: () => editor.chain().focus().toggleBlockquote().run(),          active: editor.isActive("blockquote"),             icon: <Quote size={12} />,    title: "Quote"    },
        ].map((b, i) => (
          <button
            key={i}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); b.fn(); }}
            title={b.title}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-all ${b.active ? "bg-emerald-500/25 text-emerald-300" : "text-slate-300 hover:bg-slate-700"}`}
          >
            {b.icon}
          </button>
        ))}
      </div>
    </BubbleMenu>
  );
}
 
// ── Image Upload ───────────────────────────────────────────────────────────────
 
async function uploadToSupabase(file: File, editor: Editor) {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("note-images").upload(fileName, file);
  if (error) { console.error("Upload error:", error); return; }
  const { data } = supabase.storage.from("note-images").getPublicUrl(fileName);
  editor.chain().focus().setImage({ src: data.publicUrl }).run();
}
 
// ── Main Component ─────────────────────────────────────────────────────────────
 
interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}
 
export function RichEditor({
  content,
  onChange,
  placeholder = "Start writing your note...",
  minHeight = 300,
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      // Image + drag & drop
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Dropcursor.configure({ width: 2, color: "#34d399" }),
      // Table
      Table.configure({ resizable: true, HTMLAttributes: { class: "tiptap-table" } }),
      TableRow,
      TableHeader,
      TableCell,
      BubbleMenuExtension,
    ],
    content: content || "",
    editorProps: {
      // Drag & drop image
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/") && editor) {
          uploadToSupabase(file, editor);
          return true;
        }
        return false;
      },
      attributes: {
        class: "rich-editor-content focus:outline-none",
        style: `min-height:${minHeight}px;padding:18px 20px`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });
 
  const openImageUpload = () => fileInputRef.current?.click();
 
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    await uploadToSupabase(file, editor);
    // Reset input supaya bisa upload file yang sama lagi
    e.target.value = "";
  };
 
  return (
    <div className="rounded-xl border border-slate-600/50 bg-slate-800/40 overflow-hidden">
      {/* Sticky toolbar */}
      <Toolbar editor={editor} openImageUpload={openImageUpload} />
 
      {/* Bubble menu saat teks diseleksi */}
      <FloatingToolbar editor={editor} />
 
      <EditorContent editor={editor} />
 
      {/* Hidden file input untuk image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}