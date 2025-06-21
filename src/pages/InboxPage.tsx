import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Inbox, Search, Star, Reply, Archive, Trash2, Send } from 'lucide-react';

const InboxPage: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(1);
  const [replyText, setReplyText] = useState('');

  const messages = [
    {
      id: 1,
      from: 'John Smith',
      email: 'john.smith@ntsgrow.com',
      subject: 'Q1 Performance Review',
      preview: 'Hi team, I wanted to discuss the Q1 performance metrics...',
      time: '2 hours ago',
      unread: true,
      starred: false,
      priority: 'High',
      content: 'Hi team,\n\nI wanted to discuss the Q1 performance metrics and our upcoming strategies. The results show significant improvement in customer acquisition, but we need to focus more on retention rates.\n\nCan we schedule a meeting this week to review the detailed analytics?\n\nBest regards,\nJohn'
    },
    {
      id: 2,
      from: 'Sarah Johnson',
      email: 'sarah.j@ntsgrow.com',
      subject: 'Website Analytics Update',
      preview: 'The latest website traffic data shows interesting trends...',
      time: '4 hours ago',
      unread: true,
      starred: true,
      priority: 'Medium',
      content: 'Hello,\n\nThe latest website traffic data shows interesting trends. We\'ve seen a 25% increase in organic traffic and improved conversion rates.\n\nI\'ve attached the detailed report for your review.\n\nThanks,\nSarah'
    },
    {
      id: 3,
      from: 'Mike Davis',
      email: 'mike.davis@ntsgrow.com',
      subject: 'Task Calendar Updates',
      preview: 'Several tasks have been updated in the calendar system...',
      time: '1 day ago',
      unread: false,
      starred: false,
      priority: 'Low',
      content: 'Hi,\n\nSeveral tasks have been updated in the calendar system. Please review your assigned tasks and update their status accordingly.\n\nThe deadline for the monthly report is approaching.\n\nRegards,\nMike'
    }
  ];

  const selectedMsg = messages.find(msg => msg.id === selectedMessage);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReply = () => {
    if (replyText.trim()) {
      console.log('Sending reply:', replyText);
      setReplyText('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground mt-1">Admin messaging and communications</p>
        </div>
        <Button className="flex items-center gap-2">
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
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">In your inbox</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Badge className="bg-red-100 text-red-800">{messages.filter(m => m.unread).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.unread).length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.starred).length}</div>
            <p className="text-xs text-muted-foreground">Important messages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Badge className="bg-red-100 text-red-800">!</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.priority === 'High').length}</div>
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
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="flex-1" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                      selectedMessage === message.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedMessage(message.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder-avatar-${message.id}.jpg`} />
                          <AvatarFallback>{message.from.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${
                              message.unread ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {message.from}
                            </p>
                            {message.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                          <p className={`text-sm truncate ${
                            message.unread ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {message.preview}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getPriorityColor(message.priority)} variant="secondary">
                          {message.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                        {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMsg ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/placeholder-avatar-${selectedMsg.id}.jpg`} />
                      <AvatarFallback>{selectedMsg.from.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedMsg.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        From: {selectedMsg.from} &lt;{selectedMsg.email}&gt;
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedMsg.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-sm">{selectedMsg.content}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Reply</h4>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button onClick={handleReply} className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a message to view</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;