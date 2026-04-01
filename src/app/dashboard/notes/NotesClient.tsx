"use client";

// src/app/dashboard/notes/NotesClient.tsx
// Upgrade: TipTap rich editor + AI tag suggestion + related notes

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import {
  FileText, Plus, Trash2, Tag, Search, X,
  Sparkles, Loader2, Zap, BookOpen,
  Link as LinkIcon, Clock, ChevronRight,
  Save, Edit3, ArrowLeft,
} from "lucide-react";
import { createNote, updateNote, deleteNote, searchNotesAI } from "@/actions/note-actions";
import { ConfirmModal } from "@/components/ui/modal";
import { RichEditor } from "@/components/notes/RichEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

type Note     = { id: string; title: string; content: string; tags: string[]; createdAt: Date; updatedAt: Date };
type AIResult = { id: string; title: string; content: string; tags: string[]; similarity: number };
type RelNote  = { id: string; title: string; similarity: number };
type ViewMode = "list" | "editor";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAG_PALETTE = [
  "text-violet-300 bg-violet-500/20 border-violet-500/35",
  "text-blue-300 bg-blue-500/20 border-blue-500/35",
  "text-emerald-300 bg-emerald-500/20 border-emerald-500/35",
  "text-amber-300 bg-amber-500/20 border-amber-500/35",
  "text-pink-300 bg-pink-500/20 border-pink-500/35",
  "text-cyan-300 bg-cyan-500/20 border-cyan-500/35",
];
function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
}
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

function NoteCard({ note, isActive, onClick, onDelete, similarity }: {
  note: Note | AIResult; isActive: boolean;
  onClick: () => void; onDelete?: () => void; similarity?: number;
}) {
  const plain = stripHtml(note.content).slice(0, 75);
  return (
    <div onClick={onClick}
      className={[
        "group relative px-4 py-3.5 cursor-pointer transition-all duration-150 border-l-2",
        isActive ? "bg-slate-800/80 border-emerald-500/70" : "border-transparent hover:bg-slate-800/40 hover:border-slate-600/40",
      ].join(" ")}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className={`font-semibold text-sm leading-snug line-clamp-1 flex-1 ${isActive ? "text-white" : "text-slate-200"}`}>
          {note.title || "Untitled"}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {similarity !== undefined && (
            <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">{Math.round(similarity * 100)}%</span>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all">
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>
      {plain && <p className="text-slate-400 text-xs line-clamp-1 mb-1.5">{plain}</p>}
      <div className="flex items-center gap-1.5 flex-wrap">
        {note.tags.slice(0, 2).map((t) => (
          <span key={t} className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${tagColor(t)}`}>{t}</span>
        ))}
        {note.tags.length > 2 && <span className="text-[9px] text-slate-500">+{note.tags.length - 2}</span>}
        {"updatedAt" in note && <span className="text-[9px] text-slate-500 ml-auto">{timeAgo(note.updatedAt)}</span>}
      </div>
    </div>
  );
}

// ── AI Tag Suggestion ─────────────────────────────────────────────────────────

function AITagSuggestion({ content, existingTags, onAdd }: {
  content: string; existingTags: string[]; onAdd: (t: string) => void;
}) {
  const [suggested, setSuggested] = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);
  const [fetched, setFetched]     = useState(false);
  const timerRef                  = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const plain = stripHtml(content);
    if (plain.length < 50) { setSuggested([]); setFetched(false); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/ai/suggest-tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
        const data = await res.json() as { tags: string[] };
        setSuggested(data.tags ?? []);
        setFetched(true);
      } catch { setSuggested([]); }
      finally { setLoading(false); }
    }, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [content]);

  const newTags = suggested.filter((t) => !existingTags.includes(t));
  if (!fetched && !loading) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pt-1">
      <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
        {loading ? <><Loader2 size={9} className="animate-spin" />Analyzing...</> : <><Sparkles size={9} />AI suggests:</>}
      </div>
      {!loading && newTags.map((tag) => (
        <button key={tag} onClick={() => onAdd(tag)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/25 transition-colors">
          <Plus size={8} />{tag}
        </button>
      ))}
      {!loading && newTags.length === 0 && fetched && (
        <span className="text-[10px] text-slate-600">All tags added</span>
      )}
    </div>
  );
}

// ── Related Notes ─────────────────────────────────────────────────────────────

function RelatedNotes({ noteId, content, userId, totalNotes, onSelect }: {
  noteId?: string; content: string; userId: string; totalNotes: number; onSelect: (id: string) => void;
}) {
  const [related, setRelated] = useState<RelNote[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef              = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const plain = stripHtml(content);
    if (plain.length < 80 || totalNotes < 2) { setRelated([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/ai/related-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ noteId, content, userId }) });
        const data = await res.json() as { notes: RelNote[] };
        setRelated((data.notes ?? []).filter((n) => n.similarity > 0.3));
      } catch { setRelated([]); }
      finally { setLoading(false); }
    }, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [content, noteId, userId, totalNotes]);

  if (related.length === 0 && !loading) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon size={12} className="text-violet-400" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related Notes</span>
        {loading && <Loader2 size={10} className="animate-spin text-slate-600" />}
      </div>
      <div className="space-y-1.5">
        {related.map((r) => (
          <button key={r.id} onClick={() => onSelect(r.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-violet-500/30 transition-all text-left group">
            <BookOpen size={12} className="text-violet-400 flex-shrink-0" />
            <span className="text-slate-300 text-xs font-medium flex-1 truncate group-hover:text-white">{r.title}</span>
            <span className="text-[9px] text-slate-600">{Math.round(r.similarity * 100)}%</span>
            <ChevronRight size={10} className="text-slate-700 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AI Search Bar ─────────────────────────────────────────────────────────────

function AISearchBar({ userId, onResults, onClear }: {
  userId: string; onResults: (r: AIResult[]) => void; onClear: () => void;
}) {
  const [query, setQuery]            = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState("");

  const run = () => {
    if (!query.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await searchNotesAI(userId, query.trim());
      if (res.success) onResults(res.data);
      else { setError(res.error); onResults([]); }
    });
  };

  return (
    <div className="px-3 pb-2.5 border-b border-slate-700/50">
      <div className="flex items-center gap-1 mb-1.5">
        <Sparkles size={9} className="text-indigo-400" />
        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">AI Semantic Search</span>
      </div>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Search by meaning..."
            className="w-full bg-indigo-950/30 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 pr-7 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          {query && (
            <button onClick={() => { setQuery(""); onClear(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
              <X size={10} />
            </button>
          )}
        </div>
        <button onClick={run} disabled={isPending || !query.trim()}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors">
          {isPending ? <Loader2 size={11} className="animate-spin text-white" /> : <Zap size={11} className="text-white" />}
        </button>
      </div>
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

// ── Note Editor View ──────────────────────────────────────────────────────────

function NoteEditorView({ note, userId, totalNotes, onSave, onBack, onSelectNote }: {
  note: Partial<Note> | null; userId: string; totalNotes: number;
  onSave: (saved: Note) => void; onBack: () => void; onSelectNote: (id: string) => void;
}) {
  const isEdit = !!note?.id;
  const [title, setTitle]            = useState(note?.title   ?? "");
  const [content, setContent]        = useState(note?.content ?? "");
  const [tags, setTags]              = useState<string[]>(note?.tags ?? []);
  const [tagInput, setTagInput]      = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState("");
  const [saved, setSaved]            = useState(false);

  const addTag = useCallback((t: string) => {
    const clean = t.trim().toLowerCase().replace(/\s+/g, "-");
    if (clean && !tags.includes(clean)) setTags((p) => [...p, clean]);
    setTagInput("");
  }, [tags]);

  const handleSave = () => {
    setError("");
    if (!title.trim()) { setError("Title required."); return; }
    if (!stripHtml(content).trim()) { setError("Content required."); return; }
    startTransition(async () => {
      const now = new Date();
      if (isEdit && note?.id) {
        const res = await updateNote(userId, note.id, { title: title.trim(), content, tags });
        if (res.success) {
          onSave({ ...note as Note, title: title.trim(), content, tags, updatedAt: now });
          setSaved(true); setTimeout(() => setSaved(false), 2000);
        } else setError(res.error);
      } else {
        const res = await createNote(userId, { title: title.trim(), content, tags });
        if (res.success) {
          onSave({ id: res.data.id, title: title.trim(), content, tags, createdAt: now, updatedAt: now });
          onBack();
        } else setError(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-800 flex-shrink-0 bg-[#141d2e]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors">
          <ArrowLeft size={13} /> All Notes
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          {error && <span className="text-red-400 text-xs hidden sm:inline">{error}</span>}
          {saved && <span className="text-emerald-400 text-xs flex items-center gap-1"><Save size={11} />Saved</span>}
          <button onClick={handleSave} disabled={isPending}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>

      {/* Error on mobile (below toolbar) */}
      {error && <div className="sm:hidden px-3 py-1.5 bg-red-500/10 border-b border-red-500/20"><span className="text-red-400 text-xs">{error}</span></div>}

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-[#111827]">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">

          {/* Title */}
          <input
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-white text-xl sm:text-3xl font-extrabold placeholder:text-slate-500 focus:outline-none leading-tight"
          />

          {/* Rich Text Editor */}
          <RichEditor content={content} onChange={setContent} placeholder="Start writing..." minHeight={250} />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Tag size={11} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((t) => (
                <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${tagColor(t)}`}>
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="opacity-50 hover:opacity-100 ml-0.5"><X size={9} /></button>
                </span>
              ))}
              <div className="flex items-center gap-1 border border-slate-600/50 bg-slate-700/30 rounded-lg px-2 py-1 focus-within:border-slate-500 transition-colors">
                <input
                  type="text" placeholder="Add tag..." value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                  }}
                  className="bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none w-24"
                />
                {tagInput && (
                  <span className="text-[9px] text-slate-500 whitespace-nowrap flex-shrink-0 flex items-center gap-0.5">
                    <kbd className="px-1 py-0.5 rounded bg-slate-600/60 text-slate-300 text-[8px] font-mono">Enter</kbd>
                    to add
                  </span>
                )}
              </div>
            </div>
            <AITagSuggestion content={content} existingTags={tags} onAdd={addTag} />
          </div>

          {/* Related Notes */}
          <RelatedNotes
            noteId={note?.id} content={content} userId={userId} totalNotes={totalNotes}
            onSelect={(id) => { onBack(); setTimeout(() => onSelectNote(id), 80); }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function NotesClient({ initialNotes, userId }: { initialNotes: Note[]; userId: string }) {
  const [notes, setNotes]             = useState<Note[]>(initialNotes);
  const [search, setSearch]           = useState("");
  const [activeTag, setActiveTag]     = useState<string | null>(null);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [viewMode, setViewMode]       = useState<ViewMode>("list");
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [aiResults, setAiResults]     = useState<AIResult[] | null>(null);
  const [, startTransition]           = useTransition();

  const allTags    = Array.from(new Set(notes.flatMap((n) => n.tags)));
  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const filtered = aiResults ? [] : notes.filter((n) => {
    const ms = !search || n.title.toLowerCase().includes(search.toLowerCase()) || stripHtml(n.content).toLowerCase().includes(search.toLowerCase());
    const mt = !activeTag || n.tags.includes(activeTag);
    return ms && mt;
  });

  const openNew  = () => { setEditingNote({}); setSelectedId(null); setViewMode("editor"); };
  const openEdit = (note: Note) => { setEditingNote(note); setSelectedId(note.id); setViewMode("editor"); };

  const handleSaved = (saved: Note) => {
    setNotes((p) => { const e = p.find((n) => n.id === saved.id); return e ? p.map((n) => n.id === saved.id ? saved : n) : [saved, ...p]; });
    setSelectedId(saved.id);
  };

  const doDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteNote(userId, id);
      if (res.success) { setNotes((p) => p.filter((n) => n.id !== id)); if (selectedId === id) setSelectedId(null); }
      setDeleteId(null);
    });
  };

  // Editor mode — full screen
  if (viewMode === "editor") {
    return (
      <div className="min-h-screen bg-[#111827]">
        <NoteEditorView
          note={editingNote} userId={userId} totalNotes={notes.length}
          onSave={handleSaved}
          onBack={() => setViewMode("list")}
          onSelectNote={(id) => { const n = notes.find((x) => x.id === id); if (n) { setEditingNote(n); setSelectedId(id); } }}
        />
      </div>
    );
  }

  // On mobile: show list OR read panel (not both)
  // selectedId controls which panel is visible on mobile
  // On desktop (lg+): always show both panels side by side

  // List + Read view
  return (
    <div className="min-h-screen bg-[#111827] lg:flex">
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && doDelete(deleteId)}
        title="Delete Note?" message="This cannot be undone." confirmLabel="Delete" />

      {/* ── Sidebar / Note List ── */}
      {/* Mobile: full width, hidden when note is selected */}
      {/* Desktop: fixed width sidebar */}
      <div className={[
        "lg:w-72 lg:flex-shrink-0 border-r border-slate-700/50 flex flex-col lg:h-screen lg:sticky lg:top-0 bg-[#141d2e]",
        selectedId ? "hidden lg:flex" : "flex min-h-screen lg:min-h-0",
      ].join(" ")}>

        <div className="px-4 pt-5 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-emerald-400" />
              <span className="text-white font-bold text-sm">Smart Notes</span>
            </div>
            <button onClick={openNew} className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
              <Plus size={12} />
            </button>
          </div>
          <p className="text-slate-400 text-[10px] mt-0.5">{notes.length} notes</p>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setAiResults(null); }}
              placeholder="Search..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* AI Search */}
        <AISearchBar userId={userId} onResults={setAiResults} onClear={() => setAiResults(null)} />

        {/* Tags */}
        {allTags.length > 0 && !aiResults && (
          <div className="px-3 py-2 flex flex-wrap gap-1">
            {allTags.slice(0, 8).map((t) => (
              <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${activeTag === t ? tagColor(t) : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Note list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {aiResults !== null ? (
            <>
              {aiResults.length === 0
                ? <div className="text-center py-10 text-slate-400 text-xs"><Sparkles size={14} className="mx-auto mb-2 opacity-40" />No results found.</div>
                : <>
                    <div className="px-4 py-2 text-[9px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-950/20">{aiResults.length} AI results</div>
                    {aiResults.map((r) => (
                      <NoteCard key={r.id} note={r} isActive={selectedId === r.id} onClick={() => setSelectedId(r.id)} similarity={r.similarity} />
                    ))}
                  </>
              }
            </>
          ) : (
            <>
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note} isActive={selectedId === note.id}
                  onClick={() => setSelectedId(note.id)} onDelete={() => setDeleteId(note.id)} />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">{notes.length === 0 ? "No notes yet." : "No results."}</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Read Panel ── */}
      {/* Mobile: full width, hidden when NO note selected */}
      {/* Desktop: always visible alongside sidebar */}
      <div className={[
        "flex-1 overflow-y-auto",
        selectedId ? "flex flex-col" : "hidden lg:flex lg:flex-col",
      ].join(" ")}>
        {selectedNote ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 w-full">
            {/* Mobile back button */}
            <button
              onClick={() => setSelectedId(null)}
              className="lg:hidden flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors mb-4"
            >
              <ArrowLeft size={13} /> All Notes
            </button>

            <div className="flex items-start justify-between mb-5 gap-3">
              <div className="min-w-0">
                <h1 className="text-white text-xl sm:text-2xl font-extrabold leading-tight mb-1 break-words">{selectedNote.title}</h1>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={10} /><span>Updated {timeAgo(selectedNote.updatedAt)}</span>
                </div>
              </div>
              <button onClick={() => openEdit(selectedNote)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-600/60 text-slate-300 hover:text-white text-xs font-medium transition-all flex-shrink-0">
                <Edit3 size={11} /> Edit
              </button>
            </div>
            {selectedNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedNote.tags.map((t) => (
                  <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${tagColor(t)}`}><Tag size={9} className="inline mr-1" />{t}</span>
                ))}
              </div>
            )}
            {/* Render HTML from TipTap */}
            <div className="rich-editor-content overflow-x-hidden" style={{ padding: 0 }}
              dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
            {/* Related in read view */}
            <RelatedNotes noteId={selectedNote.id} content={selectedNote.content}
              userId={userId} totalNotes={notes.length} onSelect={setSelectedId} />
          </div>
        ) : (
          <div className="h-full min-h-screen flex flex-col items-center justify-center px-8 text-center">
            <div className="w-18 h-18 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 p-5">
              <FileText size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-1">Select a note</h3>
            <p className="text-slate-400 text-sm mb-5">or create one to get started</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Sparkles size={11} className="text-indigo-400" />
              <p className="text-indigo-300 text-xs font-medium">Rich editor · AI tags · Semantic search · Related notes</p>
            </div>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20">
              <Plus size={14} /> New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}