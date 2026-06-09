import re

path = '/Users/chanakan5591/Developments/interchat-web/app/routes/dashboard/index.tsx'

with open(path, 'r') as f:
    content = f.read()

# Add Tabs to import
content = content.replace(
    'import { Typography, Button, Card, Row, Col, List, Avatar, Tag, Space, Switch, Input, Select, Badge, Divider } from "antd";',
    'import { Typography, Button, Card, Row, Col, List, Avatar, Tag, Space, Switch, Input, Select, Badge, Divider, Tabs } from "antd";'
)

# Extract components
feed_card_match = re.search(r'(<Card \n                bordered={false}\n                styles={{ body: { padding: 0 } }}.*?</Card>)', content, re.DOTALL)
connections_card_match = re.search(r'(<Card \n                title={<Text.*?>Connected Discord Guilds.*?</Card>)', content, re.DOTALL)
safety_card_match = re.search(r'(<Card \n                 title={<Text.*?>Hub Safety Knobs.*?</Card>)', content, re.DOTALL)
blocked_words_card_match = re.search(r'(<Card \n                 title={<Text.*?>Automod: Blocked Words.*?</Card>)', content, re.DOTALL)
profile_card_match = re.search(r'(<Card \n                 title={<Text.*?>Hub Profile & Settings.*?</Card>)', content, re.DOTALL)

feed = feed_card_match.group(1).replace('\n', '\n                      ')
conn = connections_card_match.group(1).replace('\n', '\n                      ')
safe = safety_card_match.group(1).replace('\n', '\n                      ')
block = blocked_words_card_match.group(1).replace('\n', '\n                      ')
prof = profile_card_match.group(1).replace('\n', '\n                      ')

old_row_match = re.search(r'<Row gutter=\{\[24, 24\]\}>\n            \n            \{\/\* Center: Live Feed & Connections \*\/}.*?</Row>', content, re.DOTALL)

tabs_jsx = f"""<Tabs 
            defaultActiveKey="moderation"
            items={{[
              {{
                key: 'moderation',
                label: <span style={{{{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', padding: '0 8px' }}}}>Moderation & Safety</span>,
                children: (
                  <Row gutter={{[24, 24]}} style={{{{ marginTop: 8 }}}}>
                    <Col xs={{24}} xl={{13}} style={{{{ display: 'flex', flexDirection: 'column', gap: 24 }}}}>
                      {feed}
                    </Col>
                    <Col xs={{24}} xl={{11}} style={{{{ display: 'flex', flexDirection: 'column', gap: 24 }}}}>
                      {safe}
                      {block}
                    </Col>
                  </Row>
                )
              }},
              {{
                key: 'general',
                label: <span style={{{{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', padding: '0 8px' }}}}>General Settings</span>,
                children: (
                  <Row gutter={{[24, 24]}} style={{{{ marginTop: 8 }}}}>
                    <Col xs={{24}} xl={{13}} style={{{{ display: 'flex', flexDirection: 'column', gap: 24 }}}}>
                      {conn}
                    </Col>
                    <Col xs={{24}} xl={{11}} style={{{{ display: 'flex', flexDirection: 'column', gap: 24 }}}}>
                      {prof}
                    </Col>
                  </Row>
                )
              }}
            ]}}
          />"""

content = content.replace(old_row_match.group(0), tabs_jsx)

with open(path, 'w') as f:
    f.write(content)

print("Restructured successfully")
