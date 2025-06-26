import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DASHBOARDS = {
  client: {
    label: "NTS G.R.O.W (Clients/Users)",
    url: "https://us.umami.is/share/ypQZw9mpZQ42Kytu/www.admin.ntsgrow.com",
  },
  internal: {
    label: "NTS G.R.O.W (Agronomy/Admin)",
    url: "https://cloud.umami.is/share/ypQZw9mpZQ42Kytu/www.admin.ntsgrow.com",
  },
};

const WebTrafficAnalyticsPage: React.FC = () => {
  const [selected, setSelected] = useState<"client" | "internal">("client");

  useEffect(() => {
    // Prevent horizontal scrolling on html and body
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      document.documentElement.style.width = '';
      document.body.style.width = '';
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", margin: 0, padding: 0, overflowX: 'hidden', maxWidth: '100%' }}>
      <Card style={{ height: "100vh", width: "100%", margin: 0, padding: 0, borderRadius: 0 }}>
        <CardHeader>
          <CardTitle>NTS G.R.O.W Platform Analytics</CardTitle>
        </CardHeader>
        <CardContent style={{ height: "calc(100vh - 80px)", padding: 0 }}>
          <Tabs value={selected} onValueChange={(val) => setSelected(val as "client" | "internal")} className="mb-4" style={{ margin: 16 }}>
            <TabsList>
              <TabsTrigger value="client">{DASHBOARDS.client.label}</TabsTrigger>
              <TabsTrigger value="internal">{DASHBOARDS.internal.label}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div style={{ width: "100%", height: "calc(100vh - 120px)" }}>
            {selected === "internal" ? (
              <iframe
                src={DASHBOARDS.internal.url}
                title="Umami Analytics Dashboard"
                width="100%"
                height="100%"
                style={{ border: "none" }}
                allowFullScreen
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#888' }}>
                No analytics available for NTS G.R.O.W (Clients/Users) yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebTrafficAnalyticsPage;