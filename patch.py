import re

file_path = "/Users/chanakan5591/Developments/interchat-web/app/routes/dashboard/index.tsx"
with open(file_path, "r") as f:
    text = f.read()

# 1. Provide mockFallbackHub and fix activeConfig
replace1_old = """  const activeHub = hubs.find(h => h.id === selectedHubId) || hubs[0];
  const activeConfig = activeHub ? configs[activeHub.id as keyof typeof configs] || configs["gaming-bros"] : configs["gaming-bros"];

  if (!activeHub) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", flexDirection: "column" }}>
        <Title level={2}>No Hubs Found</Title>
        <Text type="secondary">You don't own any hubs yet.</Text>
      </div>
    );
  }"""
  
replace1_new = """  const mockFallbackHub = {
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
    : configs["gaming-bros"]; // Fallback to mocked config"""

if replace1_old in text:
    text = text.replace(replace1_old, replace1_new)
else:
    print("Could not find block 1")

# 2. Fix the list renderer to prevent undefined configs and add emptyText
replace2_old = """              itemLayout="horizontal"
              dataSource={hubs}
              renderItem={hub => {
                const isActive = configs[hub.id as keyof typeof configs].connections.some(c => c.connected);"""

replace2_new = """              itemLayout="horizontal"
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
                const isActive = hubConfig.connections.some(c => c.connected);"""

if replace2_old in text:
    text = text.replace(replace2_old, replace2_new)
else:
    print("Could not find block 2")

with open(file_path, "w") as f:
    f.write(text)
print("Patch applied")
