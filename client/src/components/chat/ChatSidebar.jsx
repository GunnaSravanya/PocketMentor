import { useState, useMemo } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  BookOpen,
  Calendar,
  Search,
  Bot,
  Sparkles,
} from "lucide-react";

export const ChatSidebar = ({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen = true,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Group conversations into Today, Yesterday, Older
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups = {
      today: [],
      yesterday: [],
      older: [],
    };

    filtered.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (convTime >= today) {
        groups.today.push(conv);
      } else if (convTime >= yesterday) {
        groups.yesterday.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchTerm]);

  return (
    <aside
      className={`w-72 sm:w-80 flex-shrink-0 bg-slate-950/95 border-r border-slate-800/80 flex flex-col h-full z-20 ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      {/* Sidebar Header & New Chat Button */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past conversations..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800/90 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Conversations List with Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
            <p className="text-xs font-semibold">No conversations yet</p>
            <p className="text-[11px] text-slate-500">
              Start a new session to ask your AI study mentor questions.
            </p>
          </div>
        ) : (
          <>
            {/* Today */}
            {groupedConversations.today.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5 block">
                  Today
                </span>
                <div className="space-y-1">
                  {groupedConversations.today.map((c) => (
                    <ConversationItem
                      key={c._id}
                      conversation={c}
                      isActive={c._id === currentConversationId}
                      onSelect={() => onSelectConversation(c._id)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c._id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groupedConversations.yesterday.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5 block">
                  Yesterday
                </span>
                <div className="space-y-1">
                  {groupedConversations.yesterday.map((c) => (
                    <ConversationItem
                      key={c._id}
                      conversation={c}
                      isActive={c._id === currentConversationId}
                      onSelect={() => onSelectConversation(c._id)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c._id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older */}
            {groupedConversations.older.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5 block">
                  Previous Chats
                </span>
                <div className="space-y-1">
                  {groupedConversations.older.map((c) => (
                    <ConversationItem
                      key={c._id}
                      conversation={c}
                      isActive={c._id === currentConversationId}
                      onSelect={() => onSelectConversation(c._id)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c._id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Persistent Memory
        </span>
        <span>{conversations.length} saved</span>
      </div>
    </aside>
  );
};

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-left select-none ${
        isActive
          ? "bg-slate-900 border border-cyan-500/40 text-white shadow-md shadow-cyan-500/5"
          : "hover:bg-slate-900/60 border border-transparent text-slate-300 hover:text-white"
      }`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <MessageSquare
            className={`w-3.5 h-3.5 flex-shrink-0 ${
              isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400"
            }`}
          />
          <p className="text-xs font-semibold truncate">{conversation.title || "Study Session"}</p>
        </div>

        {/* Note indicator if attached */}
        {conversation.noteTitle && (
          <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5 pl-5">
            <BookOpen className="w-2.5 h-2.5 text-indigo-400" />
            <span>{conversation.noteTitle}</span>
          </p>
        )}
      </div>

      {/* Delete button (reveals on hover or if active) */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
        title="Delete conversation"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ChatSidebar;
