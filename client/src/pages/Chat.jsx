import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useNoteStore } from "../store/noteStore";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatWindow } from "../components/chat/ChatWindow";
import { ChatInput } from "../components/chat/ChatInput";

export const Chat = () => {
  const [searchParams] = useSearchParams();
  const noteIdParam = searchParams.get("noteId");

  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    fetchConversations,
    loadConversation,
    sendMessage,
    createNewChat,
    deleteConversation,
    clearCurrentChat,
  } = useChatStore();

  const { notes, fetchNotes, activeNote } = useNoteStore();

  const [selectedNoteId, setSelectedNoteId] = useState(
    noteIdParam || activeNote?._id || null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchConversations();
    fetchNotes();
  }, [fetchConversations, fetchNotes]);

  // Sync selected note with route param if provided
  useEffect(() => {
    if (noteIdParam) {
      setSelectedNoteId(noteIdParam);
    }
  }, [noteIdParam]);

  // If active conversation has a noteId attached, sync selectedNoteId
  useEffect(() => {
    if (currentConversation?.noteId) {
      setSelectedNoteId(currentConversation.noteId);
    }
  }, [currentConversation]);

  const handleSendMessage = async (text) => {
    await sendMessage(text, selectedNoteId);
  };

  const handleSelectConversation = (conversationId) => {
    loadConversation(conversationId);
    setIsSidebarOpen(false); // Close mobile drawer
  };

  const handleNewChat = () => {
    createNewChat();
    setIsSidebarOpen(false);
  };

  const selectedNoteObj = notes.find((n) => n._id === selectedNoteId);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8.5rem)] min-h-[550px] flex rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-md relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Conversations Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversation?._id}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatWindow
          messages={messages}
          isSending={isSending}
          isLoading={isLoading}
          error={error}
          currentConversation={currentConversation}
          selectedNoteTitle={selectedNoteObj?.title || null}
          onClearChat={clearCurrentChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSampleQuestionClick={handleSendMessage}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
          selectedNoteId={selectedNoteId}
          onNoteChange={setSelectedNoteId}
          notes={notes}
        />
      </div>
    </div>
  );
};

export default Chat;
