import re

file_path = "/Users/chanakan5591/Developments/interchat-web/app/routes/dashboard/index.tsx"
with open(file_path, "r") as f:
    text = f.read()

old_tabs_end = """          />
        </Col>"""

new_tabs_end = """          />
          </div>
          {hubs.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ background: 'rgba(20, 20, 25, 0.8)', padding: '40px 60px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(16px)' }}>
                    <Title level={2} style={{ margin: 0, marginBottom: 8 }}>Ready to connect?</Title>
                    <Text type="secondary" style={{ marginBottom: 32, fontSize: '1.1rem' }}>Create your first hub to start moderating chat across communities.</Text>
                    <Button type="primary" size="large" icon={<PlusOutlined />} style={{ background: '#9146ff', border: 'none', height: 48, padding: '0 32px', fontSize: '1.1rem', fontWeight: 600 }}>Create Hub</Button>
                </div>
            </div>
          )}
        </Col>"""

if old_tabs_end in text:
    text = text.replace(old_tabs_end, new_tabs_end)
else:
    print("Could not find tabs end")

with open(file_path, "w") as f:
    f.write(text)
print("Patch 3 applied")
