import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Send, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const headerBackClassName =
  "border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 hover:border-cyan-300 hover:text-cyan-800";

type ConversationWithProfile = {
  id: string;
  participant_1: string;
  participant_2: string;
  otherProfile?: {
    display_name: string | null;
  } | null;
};

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // Fetch conversations
  const { data: conversations } = useQuery<ConversationWithProfile[]>({
    queryKey: ["conversations", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;

      // Get profiles for other participants
      const otherIds = (data || []).map((c) =>
        c.participant_1 === userId ? c.participant_2 : c.participant_1
      );
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", otherIds);

      return (data || []).map((conv) => {
        const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
        const profile = profiles?.find((p) => p.user_id === otherId);
        return { ...conv, otherProfile: profile };
      });
    },
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ["messages", selectedConversation],
    enabled: !!selectedConversation,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription for new messages
  useEffect(() => {
    if (!selectedConversation) return;
    const channel = supabase
      .channel(`messages-${selectedConversation}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConversation}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!userId || !selectedConversation || !newMessage.trim()) return;
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: userId,
        content: newMessage.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
    },
  });

  // Start new conversation by searching users
  const { data: searchResults } = useQuery({
    queryKey: ["search-users", searchUser],
    enabled: searchUser.length > 2 && Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", userId)
        .ilike("display_name", `%${searchUser}%`)
        .limit(5);
      return data;
    },
  });

  const startConversation = async (otherUserId: string) => {
    if (!userId) return;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
      .maybeSingle();

    if (existing) {
      setSelectedConversation(existing.id);
    } else {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ participant_1: userId, participant_2: otherUserId })
        .select()
        .single();
      if (newConv) setSelectedConversation(newConv.id);
    }
    setSearchUser("");
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Messages"
          subtitle="Private conversations and live replies"
          topLabel="Direct conversations"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-cyan-700/75"
        />

        <div className="mx-auto max-w-5xl px-4 py-8">
          {!user ? (
            <div className="mx-auto max-w-2xl py-16 text-center">
              <MessageCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h2 className="mb-2 text-2xl font-bold text-foreground">Sign in to view messages</h2>
              <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <MessageCircle className="text-white" size={20} />
                </div>
                <p className="text-sm font-medium">Messages update in real time when the realtime backend channel is available.</p>
              </div>

              <div className="flex h-[calc(100vh-17rem)] overflow-hidden rounded-xl border border-border bg-card">
              {/* Conversation list */}
                <div className={`w-full border-r border-border md:w-80 ${selectedConversation ? "hidden md:flex" : "flex"} flex-col`}>
                  <div className="border-b border-border p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      placeholder="Search users to message..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {searchResults && searchResults.length > 0 && (
                    <div className="mt-2 border border-border rounded-lg bg-card overflow-hidden">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => startConversation(p.user_id)}
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm text-foreground transition-colors"
                        >
                          {p.display_name || "User"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                  <div className="flex-1 overflow-y-auto">
                    {(conversations || []).length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No conversations yet. Search for a user to start chatting!
                      </div>
                    ) : (
                      conversations!.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent ${
                            selectedConversation === conv.id ? "bg-accent" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-foreground">{conv.otherProfile?.display_name || "User"}</p>
                          <p className="truncate text-xs text-muted-foreground">Click to view conversation</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

              {/* Messages area */}
                <div className={`flex-1 flex-col ${!selectedConversation ? "hidden md:flex" : "flex"}`}>
                  {selectedConversation ? (
                    <>
                      <div className="flex items-center gap-2 border-b border-border p-3">
                        <button onClick={() => setSelectedConversation(null)} className="p-1 md:hidden">
                          <ArrowLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-foreground">
                          {conversations?.find((c) => c.id === selectedConversation)?.otherProfile?.display_name || "Conversation"}
                        </span>
                      </div>
                      <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {(messages || []).map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                              msg.sender_id === userId
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground"
                            }`}>
                              {msg.content}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex gap-2 border-t border-border p-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && newMessage.trim() && sendMessage.mutate()}
                          placeholder="Type a message..."
                          className="flex-1 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={() => newMessage.trim() && sendMessage.mutate()}
                          className="rounded-full bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground">
                      <p>Select a conversation or search for a user</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
