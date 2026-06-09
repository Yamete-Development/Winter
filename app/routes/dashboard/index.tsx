
import { requireUser } from "../../services/auth.server";
import { db } from "../../db.server";
import { hub } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/index";
import { useState, useEffect, forwardRef } from "react";
import { Typography, Button, Card, Row, Col, List, Avatar, Tag, Space, Switch, Input, Select, Badge, Divider, Tabs, Dropdown, message, Modal, Steps } from "antd";
import { BlockedWordsManager, type AntiSwearRule } from "../../components/BlockedWordsManager";
import { 
  PlusOutlined, 
  CaretRightOutlined, 
  PauseOutlined, 
  DisconnectOutlined, 
  SafetyCertificateFilled, 
  CrownFilled,
  DragOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  SettingOutlined
} from "@ant-design/icons";
import  { type LinksFunction, useFetcher } from "react-router";
import { Responsive, useContainerWidth } from "react-grid-layout";
import gridStyles from "react-grid-layout/css/styles.css?url";
import resizableStyles from "react-resizable/css/styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: gridStyles },
  { rel: "stylesheet", href: resizableStyles }
];

const { Title, Text } = Typography;

const defaultLayouts = {"moderation":{"lg":[{"i":"liveFeed","x":0,"y":0,"w":7,"h":22,"minW":5,"minH":10},{"i":"safetyKnobs","x":7,"y":0,"w":5,"h":10,"minW":4,"minH":5},{"i":"blockedWords","x":7,"y":10,"w":5,"h":12,"minW":4,"minH":5},{"i":"infractions","x":0,"y":22,"w":7,"h":10,"minW":4,"minH":5},{"i":"staff","x":7,"y":22,"w":5,"h":10,"minW":4,"minH":5}],"xs":[{"i":"liveFeed","x":0,"y":0,"w":4,"h":22,"minW":5,"minH":10,"moved":false,"static":false},{"i":"safetyKnobs","x":0,"y":22,"w":4,"h":10,"minW":4,"minH":5,"moved":false,"static":false},{"i":"blockedWords","x":0,"y":32,"w":4,"h":12,"minW":4,"minH":5,"moved":false,"static":false},{"i":"infractions","x":0,"y":44,"w":4,"h":10,"minW":4,"minH":5,"moved":false,"static":false},{"i":"staff","x":0,"y":54,"w":4,"h":10,"minW":4,"minH":5,"moved":false,"static":false}],"md":[{"i":"liveFeed","x":0,"y":0,"w":5,"h":15,"minW":5,"minH":10,"moved":false,"static":false},{"i":"safetyKnobs","x":0,"y":15,"w":5,"h":10,"minW":4,"minH":5,"moved":false,"static":false},{"i":"blockedWords","x":5,"y":11,"w":5,"h":7,"minW":4,"minH":5,"moved":false,"static":false},{"i":"infractions","x":5,"y":0,"w":5,"h":11,"minW":4,"minH":5,"moved":false,"static":false},{"i":"staff","x":5,"y":18,"w":5,"h":10,"minW":4,"minH":5,"moved":false,"static":false}]},"general":{"lg":[{"i":"connections","x":0,"y":0,"w":7,"h":18,"minW":4,"minH":8},{"i":"profile","x":7,"y":0,"w":5,"h":10,"minW":4,"minH":8},{"i":"dangerZone","x":7,"y":10,"w":5,"h":8,"minW":4,"minH":5}]}};

const GridItemWrapper = forwardRef(({ children, ...props }: any, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

const GridTabContent = ({ layout, onLayoutChange, children }: any) => {
  const { width, containerRef, mounted } = useContainerWidth();
  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', position: 'relative' }}>
      {mounted && width > 0 && (
        <Responsive
          width={width}
          layouts={layout}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          containerPadding={[0, 8]}
          onLayoutChange={onLayoutChange}
        >
          {children}
        </Responsive>
      )}
    </div>
  );
};


export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const userHubs = await db.select().from(hub).where(eq(hub.ownerId, user.id));
  return { userHubs };
}


export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "create_hub") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const language = formData.get("language") as string;
    const region = formData.get("region") as string;
    
    // Generate a simple ID
    const id = "hub_" + Math.random().toString(36).substring(2, 11);
    
    try {
      await db.insert(hub).values({
        id,
        name,
        description,
        language,
        region,
        ownerId: user.id,
        iconUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=300&q=80",
        shortDescription: description.substring(0, 50),
        rules: [],
      });
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }
  return { error: "Unknown intent" };
}

export default function DashboardIndex({ loaderData }: Route.ComponentProps) {
  const { userHubs } = loaderData;

  const [selectedHubId, setSelectedHubId] = useState(userHubs[0]?.id || "");
  const [chatInput, setChatInput] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [layouts, setLayouts] = useState<{ moderation: any, general: any }>(defaultLayouts);

  useEffect(() => {
    const saved = localStorage.getItem("interchat-dashboard-layout");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.moderation && parsed.general) {
          setLayouts(parsed);
        }
      } catch (e) {
        console.error("Failed to parse layout from local storage");
      }
    }
  }, []);

  const handleLayoutChange = (tab: 'moderation' | 'general', newLayout: any, allLayouts: any) => {
    setLayouts(prev => {
      const next = { ...prev, [tab]: allLayouts };
      localStorage.setItem("interchat-dashboard-layout", JSON.stringify(next));
      return next;
    });
  };

    const hubs = userHubs.length > 0 ? userHubs.map(h => ({
    id: h.id,
    name: h.name,
    avatarUrl: h.iconUrl || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop",
    bannerUrl: h.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    verified: h.verified,
    partnered: h.partnered,
    weeklyMsgs: h.weeklyMessageCount ? h.weeklyMessageCount.toString() : "0"
  })) : [];

  const [configs, setConfigs] = useState({
    "gaming-bros": {
      nsfw: false,
      locked: false,
      profanityFilter: true,
      appealCooldown: 168,
      antiSwearRules: [
        { id: "1a", pattern: "spam", matchType: "wildcard", actions: ["BLOCK_MESSAGE", "WARN"] },
        { id: "2b", pattern: "advertisement", matchType: "exact", actions: ["WARN"] },
        { id: "3c", pattern: "scam", matchType: "wildcard", actions: ["BLOCK_MESSAGE", "SEND_ALERT"] }
      ],
      welcomeMessage: "Welcome to the Gaming Hub connection! Keep it clean and have fun!",
      connections: [
        { name: "Gaming Bros Discord", channel: "#global-chat", connected: true },
        { name: "Esports Arena", channel: "#hub-link", connected: true },
        { name: "Retro Console Hub", channel: "#bridge-chat", connected: false }
      ],
      chatLogs: [
        { sender: "xX_Slayer_Xx", origin: "Gaming Bros Discord", text: "Yo, is the Valorant server up? 🎮", badge: "VIP" },
        { sender: "cyber_girl", origin: "Esports Arena", text: "Matches start in 10 mins, check announcements", badge: "" },
        { sender: "ModCoder", origin: "Retro Console Hub", text: "I've added the connection here, it works!", badge: "MOD" },
        { sender: "Kummerfeldt", origin: "Gaming Bros Discord", text: "Welcome! Let's check the latency rules.", badge: "OWNER" }
      ]
    },
    "tech-sandbox": {
      nsfw: false,
      locked: false,
      profanityFilter: true,
      appealCooldown: 72,
      antiSwearRules: [
        { id: "4d", pattern: "spambot", matchType: "wildcard", actions: ["BLOCK_MESSAGE", "BAN"] },
        { id: "5e", pattern: "coinleak", matchType: "wildcard", actions: ["BLOCK_MESSAGE", "WARN"] }
      ],
      welcomeMessage: "Welcome to the Dev Network. Compile your bots and share progress!",
      connections: [
        { name: "Tech Sandbox Discord", channel: "#dev-interchat", connected: true },
        { name: "Open Source Club", channel: "#global-dev", connected: true }
      ],
      chatLogs: [
        { sender: "linus_dev", origin: "Tech Sandbox Discord", text: "Vite 6 is compiled and running extremely fast", badge: "VIP" },
        { sender: "AliceInCode", origin: "Open Source Club", text: "Check out our repo link in the pins", badge: "MOD" }
      ]
    },
    "midnight-cafe": {
      nsfw: true,
      locked: true,
      profanityFilter: false,
      appealCooldown: 24,
      antiSwearRules: [
        { id: "6f", pattern: "drama", matchType: "wildcard", actions: ["SEND_ALERT"] },
        { id: "7g", pattern: "raid", matchType: "wildcard", actions: ["BLOCK_MESSAGE", "BAN"] }
      ],
      welcomeMessage: "Cozy vibes only. Make yourself at home in the lofi stream.",
      connections: [
        { name: "Midnight Cafe Discord", channel: "#cozy-bridge", connected: false }
      ],
      chatLogs: [
        { sender: "lofi_dreamer", origin: "Midnight Cafe Discord", text: "Rain sounds + slow jazz is the ultimate coding combo. 🌧️☕", badge: "VIP" }
      ]
    }
  });

  const mockFallbackHub = {
    id: "empty-state",
    name: "No Hubs Found",
    avatarUrl: "",
    bannerUrl: "",
    verified: false,
    partnered: false,
    weeklyMsgs: "0"
  };

  const activeHub = hubs.find(h => h.id === selectedHubId) || hubs[0] || mockFallbackHub;
  const activeConfig = activeHub.id !== "empty-state" && configs[activeHub.id as keyof typeof configs]
    ? configs[activeHub.id as keyof typeof configs] 
    : configs["gaming-bros"]; // Fallback to mocked config

  const handleToggleConfig = (field: "nsfw" | "locked" | "profanityFilter") => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      return { ...prev, [selectedHubId]: { ...hubConfig, [field]: !hubConfig[field] } };
    });
  };

  const handleNumberConfigChange = (field: "appealCooldown", value: number) => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      return { ...prev, [selectedHubId]: { ...hubConfig, [field]: isNaN(value) ? 0 : value } };
    });
  };

  const handleTextConfigChange = (field: "welcomeMessage", value: string) => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      return { ...prev, [selectedHubId]: { ...hubConfig, [field]: value } };
    });
  };

  const handleToggleConnection = (guildName: string) => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      const updated = hubConfig.connections.map(c => c.name === guildName ? { ...c, connected: !c.connected } : c);
      return { ...prev, [selectedHubId]: { ...hubConfig, connections: updated } };
    });
  };

  const handleDisconnectConnection = (guildName: string) => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      const updated = hubConfig.connections.filter(c => c.name !== guildName);
      return { ...prev, [selectedHubId]: { ...hubConfig, connections: updated } };
    });
  };

  const handleAddConnection = () => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      if (hubConfig.connections.some(c => c.name === "Community Guild")) return prev;
      return {
        ...prev,
        [selectedHubId]: {
          ...hubConfig,
          connections: [...hubConfig.connections, { name: "Community Guild", channel: "#hub-stream", connected: true }]
        }
      };
    });
  };

  const handleAddAntiSwearRule = (rule: AntiSwearRule) => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      return { ...prev, [selectedHubId]: { ...hubConfig, antiSwearRules: [...hubConfig.antiSwearRules, rule] } };
    });
  };

  const handleRemoveAntiSwearRule = (id: string) => {
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      return { ...prev, [selectedHubId]: { ...hubConfig, antiSwearRules: hubConfig.antiSwearRules.filter(r => r.id !== id) } };
    });
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setConfigs(prev => {
      const hubConfig = prev[selectedHubId as keyof typeof prev];
      const newMsg = { sender: "Kummerfeldt", origin: "Gaming Bros Discord", text: chatInput.trim(), badge: "OWNER" };
      return { ...prev, [selectedHubId]: { ...hubConfig, chatLogs: [...hubConfig.chatLogs, newMsg] } };
    });
    setChatInput("");
  };

  return (

    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Main Grid Workspace */}
      <Row gutter={[24, 24]} style={{ height: '100%' }}>
        
        {/* Hub Selector */}
        <Col xs={24} lg={6} style={{ paddingTop: 24, height: "100%", display: "flex", flexDirection: "column" }}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>My Interchat Hubs</Text>
                <Button type="primary" size="small" icon={<PlusOutlined />} style={{ background: "#9146ff", border: "none", borderRadius: 4, fontWeight: 600 }} onClick={() => setIsWizardOpen(true)}>New</Button>
              </div>
            }
            variant="borderless" 
            styles={{ body: { padding: 0, overflowY: 'auto', flex: 1 }, header: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px' } }}
            style={{ background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={hubs}
              locale={{ 
                emptyText: (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>You don't own any hubs yet.</Text>
                    <Button type="primary" icon={<PlusOutlined />} style={{ background: '#9146ff' }}>Create Hub</Button>
                  </div>
                ) 
              }}
              renderItem={hub => {
                const hubConfig = configs[hub.id as keyof typeof configs] || configs["gaming-bros"];
                const isActive = hubConfig.connections.some(c => c.connected);
                const isSelected = selectedHubId === hub.id;
                return (
                  <List.Item 
                    onClick={() => setSelectedHubId(hub.id)}
                    style={{ 
                      padding: '16px 20px', 
                      cursor: 'pointer', 
                      background: isSelected ? 'rgba(145, 70, 255, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #9146ff' : '3px solid transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot color="#4ade80" offset={[-4, 38]} style={{ display: isActive ? 'block' : 'none' }}>
                           <Avatar shape="square" size={44} src={hub.avatarUrl} style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
                        </Badge>
                      }
                      title={<Text strong style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{hub.name}</Text>}
                      description={<Text type="secondary" style={{ fontSize: '0.8rem' }}>{hub.weeklyMsgs} msgs/wk</Text>}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* Center & Right Config Layout */}
        <Col xs={24} lg={18} style={{ paddingTop: 24, height: '100%', overflowY: 'auto', paddingRight: 12, position: 'relative' }}>
          <div style={hubs.length === 0 ? { filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.3, transition: 'all 0.3s ease' } : { transition: 'all 0.3s ease' }}>
          <Tabs 
            defaultActiveKey="moderation"
            items={[
              {
                key: 'moderation',
                label: <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', padding: '0 8px' }}>Moderation & Safety</span>,
                children: (
                  <GridTabContent layout={layouts.moderation} onLayoutChange={(l: any, allLayouts: any) => handleLayoutChange('moderation', l, allLayouts)}>
                    <GridItemWrapper key="liveFeed">
                      <Card 
                        variant="borderless"
                        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {/* Visual Banner Area */}
                        <div style={{ height: 120, flexShrink: 0, position: 'relative', background: `linear-gradient(to top, rgba(14,14,17,1) 0%, rgba(14,14,17,0.4) 100%), url('${activeHub.bannerUrl}') center/cover` }}>
                           <div style={{ position: 'absolute', bottom: -16, left: 20, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                             <Avatar shape="square" size={64} src={activeHub.avatarUrl} style={{ borderRadius: 14, border: '3px solid #0e0e11', background: 'rgba(0,0,0,0.5)' }} />
                             <div style={{ paddingBottom: 18 }}>
                               <Title level={4} style={{ margin: 0, color: 'white', lineHeight: 1, paddingRight: 32 }}>{activeHub.name}</Title>
                               <Space size="small" style={{ marginTop: 8 }}>
                                 {activeHub.verified && <Tag color="blue" variant="filled" icon={<SafetyCertificateFilled />}>Verified</Tag>}
                                 {activeHub.partnered && <Tag color="gold" variant="filled" icon={<CrownFilled />}>Partner</Tag>}
                               </Space>
                             </div>
                           </div>
                        </div>
                        
                        {/* Feed content */}
                        <div style={{ padding: '36px 20px 20px', background: 'rgba(0,0,0,0.3)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', flexShrink: 0 }}>
                             <Text strong style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hub Live Feed</Text>
                             <Badge status="processing" text={<span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>MONITORING</span>} color="#4ade80" />
                          </div>
                          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 8 }}>
                             {activeConfig.chatLogs.map((msg, i) => (
                               <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                 <Dropdown 
                                   menu={{ 
                                     items: [
                                       { key: 'warn', label: 'Issue Warning' },
                                       { key: 'mute', label: 'Mute User', danger: true },
                                       { type: 'divider' },
                                       { key: 'ban', label: 'Ban from Hub', danger: true }
                                     ],
                                     onClick: (e) => message.success(`Action '${e.key}' queued for ${msg.sender}`)
                                   }}
                                   trigger={['click']}
                                   placement="bottomLeft"
                                 >
                                   <Avatar style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:scale-105">
                                     {msg.sender.substring(0, 2).toUpperCase()}
                                   </Avatar>
                                 </Dropdown>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                     <Text strong style={{ color: msg.badge === "OWNER" ? "#fadb14" : msg.badge === "MOD" ? "#a78bfa" : "white" }}>
                                       {msg.sender}
                                     </Text>
                                     {msg.badge === "MOD" && <Tag color="purple" variant="filled" style={{ margin: 0, fontSize: '0.6rem', padding: '0 4px', lineHeight: '16px' }}>MOD</Tag>}
                                     {msg.badge === "VIP" && <Tag color="cyan" variant="filled" style={{ margin: 0, fontSize: '0.6rem', padding: '0 4px', lineHeight: '16px' }}>VIP</Tag>}
                                     {msg.badge === "OWNER" && <Tag color="gold" variant="filled" style={{ margin: 0, fontSize: '0.6rem', padding: '0 4px', lineHeight: '16px' }}>OWNER</Tag>}
                                     <Text type="secondary" style={{ fontSize: '0.7rem', marginLeft: 4 }}>Today at 09:44 AM</Text>
                                     <Tag variant="filled" color="default" style={{ margin: 0, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)' }}>from {msg.origin}</Tag>
                                   </div>
                                   <Text style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{msg.text}</Text>
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                        
                        {/* Injection input */}
                        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
                          <Space.Compact style={{ width: '100%' }}>
                            <Input 
                              placeholder="Inject mock chat message into the global hub..." 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onPressEnter={handleSendChat}
                              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d2d34' }}
                            />
                            <Button type="primary" onClick={handleSendChat} style={{ background: '#9146ff', border: '1px solid #9146ff', boxShadow: 'none' }}>Send</Button>
                          </Space.Compact>
                        </div>
                      </Card>
                    </GridItemWrapper>

                    <GridItemWrapper key="safetyKnobs">
                      <Card 
                        title={<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Hub Safety Knobs</Text>}
                        variant="borderless" 
                        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)' }, body: { flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <List split={false} style={{ marginBottom: 16 }}>
                          <List.Item extra={<Switch checked={activeConfig.nsfw} onChange={() => handleToggleConfig('nsfw')} style={{ background: activeConfig.nsfw ? '#9146ff' : 'rgba(255,255,255,0.2)' }} />}>
                            <List.Item.Meta 
                              title={<Text strong style={{ color: 'white' }}>Global NSFW Block</Text>} 
                              description={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Block explicit media and NSFW content.</Text>} 
                            />
                          </List.Item>
                          <List.Item extra={<Switch checked={activeConfig.locked} onChange={() => handleToggleConfig('locked')} style={{ background: activeConfig.locked ? '#9146ff' : 'rgba(255,255,255,0.2)' }} />}>
                            <List.Item.Meta 
                              title={<Text strong style={{ color: 'white' }}>Broadcast Lock</Text>} 
                              description={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Freeze chat forwarding across all guilds.</Text>} 
                            />
                          </List.Item>
                          <List.Item extra={<Switch checked={activeConfig.profanityFilter} onChange={() => handleToggleConfig('profanityFilter')} style={{ background: activeConfig.profanityFilter ? '#9146ff' : 'rgba(255,255,255,0.2)' }} />}>
                            <List.Item.Meta 
                              title={<Text strong style={{ color: 'white' }}>Anti-Swear Rules</Text>} 
                              description={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Automatically censor profanities and offensive text.</Text>} 
                            />
                          </List.Item>
                        </List>
                        <Divider style={{ margin: '0 0 16px 0', borderColor: 'rgba(255,255,255,0.05)' }} />
                        <div>
                          <Text strong style={{ color: 'white' }}>Appeal Cooldown Period (Hours)</Text>
                          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '4px 0 12px' }}>Hours before banned servers can appeal infractions.</p>
                          <Input type="number" value={activeConfig.appealCooldown} onChange={(e) => handleNumberConfigChange('appealCooldown', parseInt(e.target.value))} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d2d34' }} />
                        </div>
                      </Card>
                    </GridItemWrapper>

                    <GridItemWrapper key="blockedWords">
                      <Card 
                        title={<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Automod: Blocked Words</Text>}
                        variant="borderless" 
                        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)' }, body: { flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                         <BlockedWordsManager 
                           rules={activeConfig.antiSwearRules as AntiSwearRule[]}
                           onAddRule={handleAddAntiSwearRule}
                           onRemoveRule={handleRemoveAntiSwearRule}
                         />
                      </Card>
                    </GridItemWrapper>

                    <GridItemWrapper key="infractions">
                      <Card 
                        title={<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Recent Infractions</Text>}
                        variant="borderless" 
                        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)' }, body: { padding: '12px 20px', flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <List
                          itemLayout="horizontal"
                          dataSource={[
                            { user: 'toxic_player', action: 'Muted', reason: 'Profanity rules violation', time: '10 mins ago', active: true },
                            { user: 'spambot44', action: 'Banned', reason: 'Automod: Blocked link', time: '1 hour ago', active: true },
                            { user: 'angry_guy', action: 'Warned', reason: 'Harassment', time: '5 hours ago', active: false }
                          ]}
                          renderItem={item => (
                            <List.Item
                              actions={[
                                <Button size="small" type="text" danger={item.active} disabled={!item.active} style={{ background: item.active ? 'rgba(245, 34, 45, 0.1)' : 'transparent', border: item.active ? '1px solid rgba(245, 34, 45, 0.2)' : 'none' }}>
                                  {item.active ? 'Revoke' : 'Expired'}
                                </Button>
                              ]}
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            >
                              <List.Item.Meta
                                avatar={<Avatar style={{ background: item.action === 'Banned' ? 'rgba(245, 34, 45, 0.2)' : item.action === 'Muted' ? 'rgba(250, 173, 20, 0.2)' : 'rgba(22, 119, 255, 0.2)', color: item.action === 'Banned' ? '#f5222d' : item.action === 'Muted' ? '#faad14' : '#1677ff' }}>{item.action[0]}</Avatar>}
                                title={<Space><Text strong style={{ color: 'white' }}>{item.user}</Text> <Tag color={item.action === 'Banned' ? 'red' : item.action === 'Muted' ? 'warning' : 'processing'} variant="filled" style={{ margin: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{item.action}</Tag></Space>}
                                description={<Text type="secondary" style={{ fontSize: '0.8rem' }}>{item.reason} • {item.time}</Text>}
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </GridItemWrapper>

                    <GridItemWrapper key="staff">
                      <Card 
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Staff Management</Text>
                            <Button type="primary" size="small" icon={<PlusOutlined />} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, fontWeight: 600 }}>Add Staff</Button>
                          </div>
                        }
                        variant="borderless" 
                        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 20px' }, body: { padding: '12px 20px', flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                         <List
                           itemLayout="horizontal"
                           dataSource={[
                             { user: 'Kummerfeldt', role: 'OWNER', avatar: 'K' },
                             { user: 'xX_Slayer_Xx', role: 'MANAGER', avatar: 'X' },
                             { user: 'AliceInCode', role: 'MODERATOR', avatar: 'A' }
                           ]}
                           renderItem={staff => (
                             <List.Item
                               actions={[
                                 <Button size="small" danger type="text" disabled={staff.role === 'OWNER'} style={{ background: staff.role !== 'OWNER' ? 'rgba(245, 34, 45, 0.1)' : 'transparent', border: staff.role !== 'OWNER' ? '1px solid rgba(245, 34, 45, 0.2)' : 'none' }}>
                                   {staff.role === 'OWNER' ? 'Owner' : 'Remove'}
                                 </Button>
                               ]}
                               style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                             >
                               <List.Item.Meta
                                 avatar={<Avatar style={{ background: 'rgba(255,255,255,0.1)' }}>{staff.avatar}</Avatar>}
                                 title={<Text strong style={{ color: 'white' }}>{staff.user}</Text>}
                                 description={<Tag color={staff.role === 'OWNER' ? 'gold' : staff.role === 'MANAGER' ? 'cyan' : 'purple'} variant="filled" style={{ margin: 0, fontSize: '0.65rem' }}>{staff.role}</Tag>}
                               />
                             </List.Item>
                           )}
                         />
                      </Card>
                    </GridItemWrapper>
                  </GridTabContent>
                )
              },
              {
                key: 'general',
                label: <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', padding: '0 8px' }}>General Settings</span>,
                children: (
                  <GridTabContent layout={layouts.general} onLayoutChange={(l: any, allLayouts: any) => handleLayoutChange('general', l, allLayouts)}>
                    <GridItemWrapper key="connections">
                      <Card 
                        title={<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Connected Discord Guilds ({activeConfig.connections.length})</Text>}
                        variant="borderless"
                        extra={<Button type="link" icon={<PlusOutlined />} onClick={handleAddConnection} style={{ color: '#a78bfa', paddingRight: 24 }}>Connect Guild</Button>}
                        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)' }, body: { flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                         <List 
                           dataSource={activeConfig.connections}
                           renderItem={conn => (
                             <List.Item
                               style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid #2d2d34', marginBottom: 8 }}
                               actions={[
                                 <Button size="small" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }} icon={conn.connected ? <PauseOutlined /> : <CaretRightOutlined />} onClick={() => handleToggleConnection(conn.name)}>{conn.connected ? "Pause" : "Resume"}</Button>,
                                 <Button danger size="small" type="text" style={{ background: 'rgba(245, 34, 45, 0.1)' }} icon={<DisconnectOutlined />} onClick={() => handleDisconnectConnection(conn.name)}>Disconnect</Button>
                               ]}
                             >
                                <List.Item.Meta 
                                   avatar={<Badge status={conn.connected ? 'success' : 'default'} style={{ marginTop: 12 }} />}
                                   title={<Text strong style={{ color: 'white' }}>{conn.name}</Text>}
                                   description={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Channel: {conn.channel}</Text>}
                                />
                             </List.Item>
                           )}
                         />
                      </Card>
                    </GridItemWrapper>

                    <GridItemWrapper key="profile">
                      <Card 
                        title={<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Hub Profile & Settings</Text>}
                        variant="borderless" 
                        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)' }, body: { flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(20, 20, 25, 0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                         <Text strong style={{ color: 'white' }}>Global Welcome message</Text>
                         <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '4px 0 12px' }}>Welcoming text sent when a Discord server binds to this Hub.</p>
                         <Input.TextArea rows={3} value={activeConfig.welcomeMessage} onChange={e => handleTextConfigChange('welcomeMessage', e.target.value)} style={{ marginBottom: 32, background: 'rgba(0,0,0,0.3)', border: '1px solid #2d2d34', resize: 'none' }} />
       
                         <Row gutter={16}>
                           <Col span={12}>
                             <Text strong style={{ fontSize: '0.8rem', color: 'white' }}>Language</Text>
                             <Select defaultValue="English" style={{ width: '100%', marginTop: 8 }} options={[{label: 'English', value: 'English'}, {label: 'Spanish', value: 'Spanish'}]} />
                           </Col>
                           <Col span={12}>
                             <Text strong style={{ fontSize: '0.8rem', color: 'white' }}>Region</Text>
                             <Select defaultValue="North America" style={{ width: '100%', marginTop: 8 }} options={[{label: 'North America', value: 'North America'}, {label: 'Europe', value: 'Europe'}]} />
                           </Col>
                         </Row>
                      </Card>
                    </GridItemWrapper>

                    <GridItemWrapper key="dangerZone">
                      <Card 
                        title={<Text style={{ color: "#ff4d4f", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Danger Zone</Text>}
                        variant="borderless" 
                        styles={{ header: { borderBottom: '1px solid rgba(245, 34, 45, 0.2)' }, body: { flex: 1, overflowY: 'auto' } }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(245, 34, 45, 0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(245, 34, 45, 0.2)' }}
                      >
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(245, 34, 45, 0.1)' }}>
                           <div>
                             <Text strong style={{ color: 'white', display: 'block' }}>Transfer Ownership</Text>
                             <Text type="secondary" style={{ fontSize: '0.75rem' }}>Transfer this hub to another server.</Text>
                           </div>
                           <Button danger ghost>Transfer</Button>
                         </div>
                         
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div>
                             <Text strong style={{ color: 'white', display: 'block' }}>Delete Hub</Text>
                             <Text type="secondary" style={{ fontSize: '0.75rem' }}>Permanently destroy this hub.</Text>
                           </div>
                           <Button danger type="primary" style={{ background: '#f5222d', borderColor: '#f5222d' }}>Delete Hub</Button>
                         </div>
                      </Card>
                    </GridItemWrapper>
                  </GridTabContent>
                )
              }
            ]}
          />
          </div>
          {hubs.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ 
                  background: 'rgba(24, 24, 28, 0.65)', 
                  padding: '50px 70px', 
                  borderRadius: 24, 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(145, 70, 255, 0.2) 0%, rgba(145, 70, 255, 0.05) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid rgba(145, 70, 255, 0.3)'
                    }}>
                      <GlobalOutlined style={{ fontSize: 28, color: '#b685ff' }} />
                    </div>
                    <Title level={2} style={{ margin: 0, marginBottom: 12, color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>Ready to connect?</Title>
                    <Text type="secondary" style={{ marginBottom: 36, fontSize: '1.15rem', textAlign: 'center', maxWidth: 360, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
                      Create your first hub to start moderating and linking chat across multiple communities.
                    </Text>
                    <Button type="primary" size="large" icon={<PlusOutlined />} style={{ 
                      background: 'linear-gradient(135deg, #9146ff 0%, #7c2aff 100%)', 
                      border: 'none', 
                      height: 52, 
                      padding: '0 40px', 
                      fontSize: '1.1rem', 
                      fontWeight: 600,
                      borderRadius: 26,
                      boxShadow: '0 8px 16px rgba(145, 70, 255, 0.25)'
                    }}
                    onClick={() => setIsWizardOpen(true)}
                    >
                      Create Hub
                    </Button>
                </div>
            </div>
          )}
        </Col>

      </Row>
      <HubWizard open={isWizardOpen} onCancel={() => setIsWizardOpen(false)} isFirstHub={hubs.length === 0} />
    </div>
  );
}


function HubWizard({ open, onCancel, isFirstHub }: { open: boolean, onCancel: () => void, isFirstHub: boolean }) {
  const fetcher = useFetcher<typeof action>();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", description: "", language: "English", region: "US East" });

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setFormData({ name: "", description: "", language: "English", region: "US East" });
    }
  }, [open]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      message.success("Hub created successfully!");
      onCancel();
    } else if (fetcher.state === "idle" && fetcher.data?.error) {
      message.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data, onCancel]);

  const handleNext = () => {
    if (currentStep === 0 && (!formData.name || !formData.description)) {
      message.error("Please fill out both name and description.");
      return;
    }
    setCurrentStep(c => c + 1);
  };

  const handleSubmit = () => {
    fetcher.submit(
      { ...formData, intent: "create_hub" },
      { method: "post" }
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      width={600}
      title={null}
      styles={{ 
        body: { background: 'rgba(25, 25, 30, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' },
        mask: { background: 'rgba(0,0,0,0.8)' }
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(145, 70, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(145, 70, 255, 0.3)' }}>
              <GlobalOutlined style={{ fontSize: 24, color: '#b685ff' }} />
            </div>
            <Typography.Title level={3} style={{ margin: 0, color: 'white' }}>
            {isFirstHub ? "Welcome to Interchat!" : "Create a New Hub"}
            </Typography.Title>
        </div>
        
        <Typography.Text type="secondary" style={{ display: 'block', paddingBottom: 24, paddingLeft: 64, borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '1.05rem' }}>
          {isFirstHub ? "Let's set up your very first hub to get started." : "Add another hub to manage a different set of communities."}
        </Typography.Text>

        <Steps 
          current={currentStep} 
          style={{ margin: '32px 0 40px' }}
          items={[
            { title: 'Basics', icon: <GlobalOutlined /> },
            { title: 'Region', icon: <SettingOutlined /> },
            { title: 'Ready', icon: <CheckCircleOutlined /> },
          ]}
        />

        {currentStep === 0 && (
          <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Typography.Text strong style={{ display: 'block', marginBottom: 8, color: 'white', fontSize: '1.05rem' }}>Hub Name <span style={{color: '#ff4d4f'}}>*</span></Typography.Text>
              <Input 
                size="large" 
                placeholder="e.g. Gaming Network" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d2d34', color: 'white', height: 48, fontSize: '1.1rem' }}
              />
            </div>
            <div>
              <Typography.Text strong style={{ display: 'block', marginBottom: 8, color: 'white', fontSize: '1.05rem' }}>Description <span style={{color: '#ff4d4f'}}>*</span></Typography.Text>
              <Input.TextArea 
                size="large" 
                rows={4}
                placeholder="What is this hub about? (Used for global searches)" 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d2d34', color: 'white', resize: 'none', fontSize: '1.1rem' }}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Typography.Text strong style={{ display: 'block', marginBottom: 8, color: 'white', fontSize: '1.05rem' }}>Primary Language</Typography.Text>
              <Select 
                size="large" 
                value={formData.language} 
                onChange={v => setFormData({ ...formData, language: v })}
                options={[{label: 'English', value: 'English'}, {label: 'Spanish', value: 'Spanish'}, {label: 'French', value: 'French'}]}
                style={{ width: '100%', height: 48 }}
                dropdownStyle={{ background: '#1c1c21' }}
              />
            </div>
            <div>
              <Typography.Text strong style={{ display: 'block', marginBottom: 8, color: 'white', fontSize: '1.05rem' }}>Server Region</Typography.Text>
              <Select 
                size="large" 
                value={formData.region} 
                onChange={v => setFormData({ ...formData, region: v })}
                options={[{label: 'US East', value: 'US East'}, {label: 'US West', value: 'US West'}, {label: 'Europe', value: 'Europe'}, {label: 'Asia', value: 'Asia'}]}
                style={{ width: '100%', height: 48 }}
                dropdownStyle={{ background: '#1c1c21' }}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(145, 70, 255, 0.1)', border: '1px solid rgba(145, 70, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <CheckCircleOutlined style={{ fontSize: 40, color: '#b685ff' }} />
            </div>
            <Typography.Title level={3} style={{ color: 'white', margin: 0, marginBottom: 12 }}>You're all set!</Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: '1.1rem' }}>
              Click below to blast off "{formData.name || 'your new hub'}" and manage it immediately from your Interchat dashboard.
            </Typography.Text>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {currentStep > 0 && (
            <Button size="large" onClick={() => setCurrentStep(c => c - 1)} disabled={isSubmitting} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: 48, padding: '0 24px' }}>
              Back
            </Button>
          )}
          {currentStep < 2 ? (
            <Button size="large" type="primary" onClick={handleNext} style={{ background: '#9146ff', border: 'none', height: 48, padding: '0 32px' }}>
              Next Step
            </Button>
          ) : (
            <Button size="large" type="primary" onClick={handleSubmit} loading={isSubmitting} style={{ background: '#9146ff', border: 'none', height: 48, padding: '0 32px' }}>
              Launch Hub
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
