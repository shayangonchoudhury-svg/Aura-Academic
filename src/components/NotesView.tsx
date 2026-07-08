import React, { useState, useEffect } from 'react';
import { Note, Folder, AIHighlight } from '../types';
import { Search, FolderOpen, FileText, Sparkles, Plus, Clock, ArrowLeft, Brain, Trash2, CheckCircle, ListChecks, HelpCircle, Save, Loader2, AlertCircle } from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export default function NotesView({ notes, setNotes }: NotesViewProps) {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('aura_folders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aura_folders', JSON.stringify(folders));
  }, [folders]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Editing / Viewing States
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Form Fields
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteFolderId, setNoteFolderId] = useState("");

  // AI Loading / Error states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Folder modal
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6bfb9a");

  // Filter notes based on folder and search query
  const filteredNotes = notes.filter((note) => {
    const matchesFolder = selectedFolderId ? note.folderId === selectedFolderId : true;
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFolder && matchesSearch;
  });

  const getFolderDetails = (folderId?: string) => {
    return folders.find(f => f.id === folderId);
  };

  const getActiveNote = () => {
    return notes.find(n => n.id === activeNoteId);
  };

  // Open note for viewing/editing
  const handleOpenNote = (note: Note) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteFolderId(note.folderId || "");
    setIsCreatingNote(false);
    setAiError(null);
  };

  // Close note view
  const handleCloseNoteView = () => {
    setActiveNoteId(null);
    setAiError(null);
  };

  // Save changes to current note
  const handleSaveChanges = () => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => {
      if (n.id === activeNoteId) {
        return {
          ...n,
          title: noteTitle,
          content: noteContent,
          folderId: noteFolderId || undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  // Trigger New Note
  const handleStartNewNote = () => {
    setNoteTitle("");
    setNoteContent("");
    setNoteFolderId(selectedFolderId || "");
    setIsCreatingNote(true);
    setActiveNoteId(null);
    setAiError(null);
  };

  // Create Note submit
  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: noteTitle,
      content: noteContent,
      folderId: noteFolderId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setIsCreatingNote(false);
    setActiveNoteId(newNote.id); // View the newly created note immediately
  };

  // Trigger New Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: 'folder_' + Date.now(),
      name: newFolderName,
      color: newFolderColor
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName("");
    setShowAddFolderModal(false);
  };

  // Trigger REAL AI Highlights from Backend Express proxy API!
  const triggerAIHighlights = async () => {
    const currentNote = getActiveNote();
    if (!currentNote) return;

    setAiLoading(true);
    setAiError(null);

    // Save current editor state first so AI receives updated note text
    handleSaveChanges();

    try {
      const response = await fetch("/api/ai-highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle: noteTitle,
          noteContent: noteContent
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze note");
      }

      // Update current note with returned AI highlights
      setNotes(prev => prev.map(n => {
        if (n.id === currentNote.id) {
          return {
            ...n,
            aiHighlight: data as AIHighlight,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong during AI analysis. Is your GEMINI_API_KEY set?");
    } finally {
      setAiLoading(false);
    }
  };

  const activeNote = getActiveNote();

  return (
    <div className="w-full flex flex-col gap-stack-lg animate-fade-in" id="knowledge-base-view">
      
      {/* Search and Navigation back button (if viewing note) */}
      {activeNote || isCreatingNote ? (
        <button
          onClick={handleCloseNoteView}
          className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            type="text"
            placeholder="Search your knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container/60 border border-outline-variant/15 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary placeholder-on-surface-variant/50"
          />
        </div>
      )}

      {/* Main View Grid or Single Note View */}
      {!activeNote && !isCreatingNote ? (
        <>
          {/* Knowledge Folders Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Knowledge Folders
              </h3>
              <button 
                onClick={() => setShowAddFolderModal(true)}
                className="text-xs text-primary hover:underline font-mono"
              >
                + New Folder
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                  selectedFolderId === null
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface-container-low/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>All Notes</span>
                <span className="font-mono text-[10px] bg-surface-container-highest/50 px-1.5 py-0.5 rounded">
                  {notes.length}
                </span>
              </button>

              {folders.map(folder => {
                const count = notes.filter(n => n.folderId === folder.id).length;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                      selectedFolderId === folder.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-container-low/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-surface-container-highest/50 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recently Edited Notes List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notes & Summaries
              </h3>
              
              <button
                onClick={handleStartNewNote}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-surface rounded-lg font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Start Note
              </button>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 border border-outline-variant/10 bg-gradient-to-b from-surface-container-low/20 to-surface-container-lowest/10">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 animate-pulse">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-on-surface font-bold">Your Knowledge Base is Empty</p>
                  <p className="text-xs text-on-surface-variant max-w-sm mt-1 leading-relaxed">
                    {searchQuery 
                      ? "No notes found matching your search. Try another query." 
                      : "Create your first study note to summarize complex articles, generate flashcards, and run deep AI learning reviews."}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={handleStartNewNote}
                    className="mt-2 px-5 py-2.5 bg-primary text-surface font-bold text-xs rounded-lg hover:scale-105 transition-all uppercase tracking-widest shadow-[0_4px_15px_rgba(74,222,128,0.25)]"
                  >
                    + Compose First Note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredNotes.map((note) => {
                  const folder = getFolderDetails(note.folderId);
                  return (
                    <div 
                      key={note.id}
                      onClick={() => handleOpenNote(note)}
                      className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-surface-container-low/60 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {folder ? (
                            <span 
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                              style={{ color: folder.color, backgroundColor: `${folder.color}15` }}
                            >
                              {folder.name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container-low">
                              General Notes
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="font-bold text-on-surface text-sm md:text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
                          {note.title}
                        </h4>
                        
                        <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-outline-variant/10 mt-3 pt-2">
                        {note.aiHighlight ? (
                          <span className="text-[10px] font-semibold font-mono text-primary flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary animate-pulse" /> AI Highlights Ready
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-on-surface-variant italic">
                            No AI highlights generated
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-1 text-on-surface-variant hover:text-error rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Highlights Explainer card */}
          <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-surface-container-lowest to-surface-container-high border border-outline-variant/10">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 animate-float">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  AI Highlights Engine
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Our system is connected directly to the server-side Gemini 3.5 model. Open any note and click the AI trigger to dynamically generate structured summaries, find core concepts with definitions, and construct study action items dynamically!
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Detailed Editor and AI Reviewer View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg" id="active-note-editor">
          
          {/* Editor Side */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {isCreatingNote ? (
              <form onSubmit={handleCreateNoteSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-on-surface">Compose New Note</h3>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary text-surface rounded-lg font-bold text-xs uppercase tracking-wider"
                  >
                    Create Note
                  </button>
                </div>

                <div className="flex gap-3">
                  <div className="w-full">
                    <label className="block text-[10px] font-mono font-semibold text-on-surface-variant uppercase mb-1">
                      Note Folder
                    </label>
                    <select
                      value={noteFolderId}
                      onChange={e => setNoteFolderId(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant/25 rounded-lg text-on-surface focus:outline-none focus:border-primary text-xs"
                    >
                      <option value="">No Folder (General)</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Note Title (e.g., Photosynthesis Pathways)"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/25 rounded-lg text-on-surface font-bold text-base focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={12}
                    placeholder="Start typing your academic notes here..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/25 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary font-sans leading-relaxed"
                  />
                </div>
              </form>
            ) : (
              /* Editing existing note */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-on-surface-variant flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" /> Editor Mode
                  </h3>

                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Note
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-semibold text-on-surface-variant uppercase mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={e => {
                        setNoteTitle(e.target.value);
                        // Save changes to state
                        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title: e.target.value } : n));
                      }}
                      className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant/25 rounded-lg text-on-surface font-bold text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-semibold text-on-surface-variant uppercase mb-1">
                      Folder Category
                    </label>
                    <select
                      value={noteFolderId}
                      onChange={e => {
                        setNoteFolderId(e.target.value);
                        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, folderId: e.target.value || undefined } : n));
                      }}
                      className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant/25 rounded-lg text-on-surface focus:outline-none focus:border-primary text-xs h-[34px]"
                    >
                      <option value="">General Notes</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={12}
                    value={noteContent}
                    onChange={e => {
                      setNoteContent(e.target.value);
                      setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, content: e.target.value } : n));
                    }}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/25 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Highlights Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-outline-variant/15 lg:pl-6 pt-6 lg:pt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                AI Summary Board
              </h3>
            </div>

            {aiLoading ? (
              <div className="glass-card rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Gemini is analyzing your note...</p>
                  <p className="text-xs text-on-surface-variant mt-1">Extracting core concepts and study points</p>
                </div>
              </div>
            ) : aiError ? (
              <div className="glass-card rounded-xl p-5 border border-error/20 bg-error-container/5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-error">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm">AI Extraction Interrupted</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {aiError}
                </p>
                <button
                  onClick={triggerAIHighlights}
                  className="mt-1 px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 rounded-lg text-xs font-semibold"
                >
                  Retry Extraction
                </button>
              </div>
            ) : activeNote?.aiHighlight ? (
              <div className="flex flex-col gap-4">
                
                {/* Summary Card */}
                <div className="glass-card rounded-xl p-4 bg-primary/5 border border-primary/20">
                  <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-1.5">
                    Concept Brief
                  </h4>
                  <p className="text-xs text-on-surface italic leading-relaxed">
                    "{activeNote.aiHighlight.summary}"
                  </p>
                </div>

                {/* Key Takeaways */}
                {activeNote.aiHighlight.keyTakeaways && activeNote.aiHighlight.keyTakeaways.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest block">
                      Key Takeaways
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {activeNote.aiHighlight.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="text-xs text-on-surface leading-relaxed flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Core Concepts */}
                {activeNote.aiHighlight.coreConcepts && activeNote.aiHighlight.coreConcepts.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest block">
                      Core Vocab / Definitions
                    </span>
                    <div className="flex flex-col gap-2">
                      {activeNote.aiHighlight.coreConcepts.map((concept, idx) => (
                        <div key={idx} className="p-2.5 bg-surface-container-low/40 rounded-lg border border-outline-variant/10">
                          <span className="text-xs font-bold text-primary block">{concept.name}</span>
                          <span className="text-xs text-on-surface-variant mt-0.5 block leading-relaxed">{concept.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {activeNote.aiHighlight.actionItems && activeNote.aiHighlight.actionItems.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest block">
                      Recommended Study Checklist
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {activeNote.aiHighlight.actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-on-surface leading-relaxed p-1.5 bg-surface-container-low/20 rounded">
                          <ListChecks className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={triggerAIHighlights}
                  className="mt-2 w-full py-2 bg-surface-container hover:text-primary hover:border-primary/35 border border-outline-variant/20 rounded-lg text-xs font-bold font-mono tracking-wide transition-all"
                >
                  Regenerate AI Review
                </button>
              </div>
            ) : (
              /* No AI summary generated yet */
              <div className="glass-card rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3.5 py-12">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">No AI review generated</p>
                  <p className="text-xs text-on-surface-variant max-w-xs mt-1">
                    Harness the power of server-side Gemini AI to instantly extract structured summaries, core definitions, and a recommended checklists.
                  </p>
                </div>
                {!isCreatingNote && (
                  <button
                    onClick={triggerAIHighlights}
                    className="px-5 py-2 bg-primary text-surface rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                  >
                    ✨ Generate AI Review
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card rounded-xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 bg-surface-container">
              <h3 className="font-semibold text-on-surface text-base">New Folder</h3>
              <button 
                onClick={() => setShowAddFolderModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-on-surface-variant uppercase mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry Lab"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/25 rounded-lg text-on-surface focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-on-surface-variant uppercase mb-1">
                  Folder Category Color
                </label>
                <div className="flex items-center gap-2.5 mt-1">
                  {["#6bfb9a", "#bdc2ff", "#ffd6d9", "#f59e0b", "#3b82f6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newFolderColor === color ? 'border-on-surface scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-surface rounded-lg font-bold text-sm hover:scale-[1.02] transition-all"
              >
                Confirm Add Folder
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
