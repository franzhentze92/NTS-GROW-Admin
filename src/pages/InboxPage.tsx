import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Inbox, 
  Search, 
  Star, 
  Reply, 
  Archive, 
  Trash2, 
  Send, 
  Mail,
  ArchiveRestore,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchMessages, 
  fetchSentMessages, 
  fetchArchivedMessages,
  markMessageAsRead,
  toggleMessageStarred,
  toggleMessageArchived,
  deleteMessage,
  createMessage
} from '@/lib/messagingApi';
import { Message, CreateMessageData } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import ComposeMessageDialog from '@/components/messaging/ComposeMessageDialog';
import { supabase } from '@/lib/supabaseClient';

const getCurrentUserId = (): string | null => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    const userData = JSON.parse(user);
    if (userData && typeof userData.id === 'string' && userData.id.length > 0) {
      return userData.id;
    }
  }
  return null;
};

const InboxPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [composeOpen, setComposeOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getCurrentUserId());

  // Get current user ID
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUserId(getCurrentUserId());
    };
    
    // Listen for changes to localStorage (e.g., login/logout)
    window.addEventListener('storage', handleStorageChange);

    // Initial check
    setCurrentUserId(getCurrentUserId());
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch messages based on active tab
  const { data: inboxMessages = [], isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: fetchMessages,
  });

  const { data: sentMessages = [], isLoading: sentLoading } = useQuery({
    queryKey: ['messages', 'sent'],
    queryFn: fetchSentMessages,
  });

  const { data: archivedMessages = [], isLoading: archivedLoading } = useQuery({
    queryKey: ['messages', 'archived'],
    queryFn: fetchArchivedMessages,
  });

  // Get current messages based on active tab
  const getCurrentMessages = () => {
    switch (activeTab) {
      case 'sent': return sentMessages;
      case 'archived': return archivedMessages;
      default: return inboxMessages;
    }
  };

  const currentMessages = getCurrentMessages();
  const isLoading = inboxLoading || sentLoading || archivedLoading;

  // Filter messages by search query
  const filteredMessages = currentMessages.filter(message => {
    const searchLower = searchQuery.toLowerCase();
    const fromName = message.from_user?.name || '';
    const toName = message.to_user?.name || '';
    const subject = message.subject || '';
    const content = message.content || '';
    
    return fromName.toLowerCase().includes(searchLower) ||
           toName.toLowerCase().includes(searchLower) ||
           subject.toLowerCase().includes(searchLower) ||
           content.toLowerCase().includes(searchLower);
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const toggleStarredMutation = useMutation({
    mutationFn: ({ messageId, isStarred }: { messageId: string; isStarred: boolean }) =>
      toggleMessageStarred(messageId, isStarred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const toggleArchivedMutation = useMutation({
    mutationFn: ({ messageId, isArchived }: { messageId: string; isArchived: boolean }) =>
      toggleMessageArchived(messageId, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setSelectedMessage(null);
      toast({
        title: 'Message deleted',
        description: 'The message has been deleted successfully.',
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setReplyText('');
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully.',
      });
    },
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `to_user_id=eq.${currentUserId}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUserId, queryClient]);

  // Handlers
  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.to_user_id === currentUserId) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleStarToggle = (message: Message) => {
    toggleStarredMutation.mutate({ 
      messageId: message.id, 
      isStarred: !message.is_starred 
    });
  };

  const handleArchiveToggle = (message: Message) => {
    toggleArchivedMutation.mutate({ 
      messageId: message.id, 
      isArchived: !message.is_archived 
    });
  };

  const handleDelete = (message: Message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(message.id);
    }
  };

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    const replyData: CreateMessageData = {
      to_user_id: selectedMessage.from_user_id,
      subject: `Re: ${selectedMessage.subject}`,
      content: replyText,
      priority: 'Medium',
    };

    replyMutation.mutate(replyData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getMessageStats = () => {
    const unreadCount = inboxMessages.filter(m => !m.is_read && m.to_user_id === currentUserId).length;
    const starredCount = inboxMessages.filter(m => m.is_starred).length;
    const highPriorityCount = inboxMessages.filter(m => m.priority === 'High').length;
    
    return { unreadCount, starredCount, highPriorityCount };
  };

  const stats = getMessageStats();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground mt-1">Admin messaging and communications</p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inboxMessages.length}</div>
            <p className="text-xs text-muted-foreground">In your inbox</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Badge className="bg-red-100 text-red-800">{stats.unreadCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.starredCount}</div>
            <p className="text-xs text-muted-foreground">Important messages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Urgent messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inbox" className="flex items-center gap-2">
                    <Inbox className="h-4 w-4" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Sent
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archived
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center space-x-2 mt-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search messages..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => {
                    const isFromMe = message.from_user_id === currentUserId;
                    const displayUser = isFromMe ? message.to_user : message.from_user;
                    const isUnread = !message.is_read && message.to_user_id === currentUserId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-muted' : ''
                        } ${isUnread ? 'bg-blue-50' : ''}`}
                        onClick={() => handleMessageSelect(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {displayUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium truncate ${
                                  isUnread ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {isFromMe ? `To: ${displayUser?.name}` : displayUser?.name}
                                </p>
                                {message.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                              </div>
                              <p className={`text-sm truncate ${
                                isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
                              }`}>
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.content.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={getPriorityColor(message.priority)} variant="secondary">
                              {message.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.created_at)}
                            </span>
                            {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {(selectedMessage.from_user_id === currentUserId 
                          ? selectedMessage.to_user?.name 
                          : selectedMessage.from_user?.name)?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.from_user_id === currentUserId ? 'To: ' : 'From: '}
                        {selectedMessage.from_user_id === currentUserId 
                          ? selectedMessage.to_user?.name 
                          : selectedMessage.from_user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(selectedMessage.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStarToggle(selectedMessage)}
                    >
                      <Star className={`h-4 w-4 ${selectedMessage.is_starred ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArchiveToggle(selectedMessage)}
                    >
                      {selectedMessage.is_archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(selectedMessage)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-sm">{selectedMessage.content}</p>
                  </div>
                  
                  {selectedMessage.from_user_id !== currentUserId && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Reply</h4>
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          onClick={handleReply} 
                          disabled={replyMutation.isPending || !replyText.trim()}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a message to view</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Message Dialog */}
      <ComposeMessageDialog 
        open={composeOpen} 
        onOpenChange={setComposeOpen} 
        currentUserId={currentUserId || ''} 
      />
    </div>
  );
};

export default InboxPage;