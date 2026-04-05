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
• FloatingToolbar (muncul langsung saat teks diseleksi, mirip Notion)
────────────────────────────────────────
*/

import { useRef, useEffect, useState, useCallback } from "react";
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
  CodeSquare,
} from "lucide-react";

// ── Toolbar Button (Sticky Toolbar) ───────────────────────────────────────────

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
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

// ── Mini Button (FloatingToolbar) ─────────────────────────────────────────────
// ✅ Punya prop disabled

function MiniBtn({
  onClick,
  active,
  disabled,
  title,
  children,
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
        "w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-all",
        active
          ? "bg-emerald-500/30 text-emerald-300"
          : "text-slate-300 hover:text-white hover:bg-slate-600/70",
        disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MiniDivider() {
  return <div className="w-px h-4 bg-slate-600/60 mx-0.5 flex-shrink-0" />;
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
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo size={14} />
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={openImageUpload} title="Upload Image">
        <ImageIcon size={14} />
      </ToolBtn>

      <Divider />

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

      <ToolBtn
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        active={editor.isActive("table")}
        title="Insert Table"
      >
        <TableIcon size={14} />
      </ToolBtn>

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

// ── Floating Toolbar ───────────────────────────────────────────────────────────
// ✅ openImageUpload diterima sebagai prop (bukan diambil dari scope luar)

function FloatingToolbar({
  editor,
  openImageUpload,
}: {
  editor: Editor | null;
  openImageUpload: () => void;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) { setVisible(false); return; }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) { setVisible(false); return; }

    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || rect.width === 0) { setVisible(false); return; }

    setPos({
      top: rect.top - 48 - 8,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updatePosition);

    const handleBlur = () => setVisible(false);
    editor.on("blur", handleBlur);

    const handleMouseUp = () => setTimeout(updatePosition, 10);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("blur", handleBlur);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editor, updatePosition]);

  if (!editor || !visible) return null;

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
        animation: "floatIn 0.12s ease-out",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-[#0d1120]/95 backdrop-blur-sm border border-slate-600/60 shadow-2xl shadow-black/70">

        {/* History */}
        <MiniBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={12} />
        </MiniBtn>
        <MiniBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={12} />
        </MiniBtn>

        <MiniDivider />

        {/* Image Upload — ✅ pakai prop */}
        <MiniBtn onClick={openImageUpload} title="Upload Image">
          <ImageIcon size={12} />
        </MiniBtn>

        <MiniDivider />

        {/* Text Style */}
        <MiniBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <Code size={12} />
        </MiniBtn>

        <MiniDivider />

        {/* Headings */}
        <MiniBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 size={12} />
        </MiniBtn>

        <MiniDivider />

        {/* Lists */}
        <MiniBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <ListOrdered size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Checklist">
          <CheckSquare size={12} />
        </MiniBtn>

        <MiniDivider />

        {/* Blocks */}
        <MiniBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <CodeSquare size={12} />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus size={12} />
        </MiniBtn>

        <MiniDivider />

        {/* Table */}
        <MiniBtn
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          active={editor.isActive("table")}
          title="Insert Table"
        >
          <TableIcon size={12} />
        </MiniBtn>

        {/* Table controls — hanya muncul saat cursor di dalam tabel */}
        {editor.isActive("table") && (
          <>
            <MiniDivider />
            <MiniBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
              <span className="text-[9px] font-bold flex items-center gap-0.5"><Plus size={7} />Col</span>
            </MiniBtn>
            <MiniBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
              <span className="text-[9px] font-bold flex items-center gap-0.5"><Plus size={7} />Row</span>
            </MiniBtn>
            <MiniBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
              <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5"><Trash2 size={7} />Col</span>
            </MiniBtn>
            <MiniBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
              <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5"><Trash2 size={7} />Row</span>
            </MiniBtn>
            <MiniBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
              <Trash2 size={11} className="text-red-400" />
            </MiniBtn>
          </>
        )}
      </div>
    </div>
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
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Dropcursor.configure({ width: 2, color: "#34d399" }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "tiptap-table" } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || "",
    editorProps: {
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

  // ✅ Didefinisikan di sini, lalu dikirim sebagai prop ke kedua toolbar
  const openImageUpload = () => fileInputRef.current?.click();

  return (
    <div className="rounded-xl border border-slate-600/50 bg-slate-800/40 overflow-hidden">
      <Toolbar editor={editor} openImageUpload={openImageUpload} />

      {/* ✅ openImageUpload dikirim sebagai prop */}
      <FloatingToolbar editor={editor} openImageUpload={openImageUpload} />

      <EditorContent editor={editor} />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !editor) return;
          await uploadToSupabase(file, editor);
          e.target.value = "";
        }}
      />
    </div>
  );
}