import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AgriChatbot: React.FC = () => (
  <div className="rounded-lg overflow-hidden shadow-lg h-full">
    <iframe
      src="https://www.chatbase.co/chatbot-iframe/495OL95GJUbHmOtYjtTr-"
      width="100%"
      style={{ height: 'calc(100vh - 12rem)', minHeight: '600px' }}
      frameBorder="0"
    ></iframe>
  </div>
);

const HealthChatbot: React.FC = () => (
  <div className="rounded-lg overflow-hidden shadow-lg h-full">
    <iframe
      src="https://www.chatbase.co/chatbot-iframe/ZG6l8BS0UGZrydtUIrC2H"
      width="100%"
      style={{ height: "100%", minHeight: "700px" }}
      frameBorder="0"
    ></iframe>
  </div>
);

const ChatPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Chatbots</h1>
        <p className="text-muted-foreground">
          Your personal AI assistants for various topics.
        </p>
      </div>
      <Tabs defaultValue="agriculture" className="w-full">
        <TabsList>
          <TabsTrigger value="agriculture">Agri-Chat</TabsTrigger>
          <TabsTrigger value="health">Health-Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="agriculture">
          <AgriChatbot />
        </TabsContent>
        <TabsContent value="health">
          <HealthChatbot />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPage; 