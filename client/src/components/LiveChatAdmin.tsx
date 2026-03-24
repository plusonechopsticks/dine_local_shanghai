import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatSession {
  id: number;
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: "active" | "needs_human" | "resolved";
  adminTookOver: boolean;
  lastMessageAt: Date;
  createdAt: Date;
}

interface ChatMessage {
  id: number;
  sessionId: number;
  senderType: "visitor" | "ai" | "admin";
  content: string;
  adminName: string | null;
  createdAt: Date;
}

export function LiveChatAdmin() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "needs_human" | "resolved">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessionsData, refetch: refetchSessions } = trpc.chat.getAllSessions.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: messagesData, refetch: refetchMessages } = trpc.chat.getSessionMessages.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId, refetchInterval: 3000 }
  );

  const sendAdminMessageMutation = trpc.chat.sendAdminMessage.useMutation({
    onSuccess: () => {
      setAdminMessage("");
      refetchMessages();
    },
  });

  const updateStatusMutation = trpc.chat.updateSessionStatus.useMutation({
    onSuccess: () => {
      refetchSessions();
    },
  });

  const sessions: ChatSession[] = sessionsData?.sessions || [];
  const messages: ChatMessage[] = messagesData?.messages || [];

  const filteredSessions = statusFilter === "all" 
    ? sessions 
    : sessions.filter(s => s.status === statusFilter);

  const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!adminMessage.trim() || !selectedSessionId) return;

    sendAdminMessageMutation.mutate({
      sessionId: selectedSessionId,
      content: adminMessage,
      adminName: "Admin",
    });
  };

  const handleStatusChange = (sessionId: string, status: "active" | "needs_human" | "resolved") => {
    updateStatusMutation.mutate({ sessionId, status });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, label: "Active", color: "bg-blue-600" },
      needs_human: { variant: "secondary" as const, label: "Needs Human", color: "bg-amber-600" },
      resolved: { variant: "outline" as const, label: "Resolved", color: "bg-gray-400" },
    };
    const config = variants[status as keyof typeof variants] || variants.active;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sessions List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Sessions
              </CardTitle>
              <CardDescription>{filteredSessions.length} conversations</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchSessions()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Status Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All ({sessions.length})
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active ({sessions.filter(s => s.status === "active").length})
            </Button>
            <Button
              variant={statusFilter === "needs_human" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("needs_human")}
            >
              Needs Help ({sessions.filter(s => s.status === "needs_human").length})
            </Button>
            <Button
              variant={statusFilter === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("resolved")}
            >
              Resolved ({sessions.filter(s => s.status === "resolved").length})
            </Button>
          </div>

          {/* Sessions */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No chat sessions yet
              </p>
            ) : (
              filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSessionId === session.sessionId
                      ? "border-[#8B4513] bg-[#8B4513]/5"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedSessionId(session.sessionId)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {session.visitorName || session.visitorEmail || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.lastMessageAt).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    {session.adminTookOver && (
                      <Badge variant="outline" className="text-xs">
                        Admin Responded
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        {selectedSession ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedSession.visitorName || selectedSession.visitorEmail || "Anonymous Visitor"}
                  </CardTitle>
                  <CardDescription>
                    Session started {new Date(selectedSession.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedSession.status !== "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(selectedSession.sessionId, "resolved")}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedSession.status === "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(selectedSession.sessionId, "active")}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto mb-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === "visitor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.senderType === "visitor"
                          ? "bg-[#8B4513] text-white"
                          : message.senderType === "admin"
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold opacity-75">
                          {message.senderType === "visitor"
                            ? "Visitor"
                            : message.senderType === "admin"
                            ? message.adminName || "Admin"
                            : "AI Assistant"}
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin Input */}
              {selectedSession.status !== "resolved" && (
                <div className="flex gap-2">
                  <Input
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your response..."
                    disabled={sendAdminMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!adminMessage.trim() || sendAdminMessageMutation.isPending}
                    className="bg-[#8B4513] hover:bg-[#723A0F]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-[500px]">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat session to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
