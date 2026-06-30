import { useState } from "react";
import { Typography, Space, Tag, Input, Button, Modal, Form, Select, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface AutomodRule {
  id: string;
  pattern: string;
  matchType: "prefix" | "suffix" | "wildcard" | "exact";
  actions: any[];
}

interface BlockedWordsManagerProps {
  rules: AutomodRule[];
  onAddRule: (rule: AutomodRule) => void;
  onRemoveRule: (id: string) => void;
}

export function BlockedWordsManager({ rules, onAddRule, onRemoveRule }: BlockedWordsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const handleAdd = (values: any) => {
    onAddRule({
      id: Math.random().toString(36).slice(2, 11),
      pattern: values.pattern.trim(),
      matchType: values.matchType,
      actions: values.actions,
    });
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredRules = rules.filter(r => r.pattern.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <Text strong style={{ color: 'white' }}>AutoMod Patterns</Text>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
            Scale up to 10,000 regex & wildcard matches.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#9146ff', border: 'none', boxShadow: "none" }}
        >
          New Rule
        </Button>
      </div>

      <Input
        prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.25)' }} />}
        placeholder="Filter rules..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 16,
          color: "white"
        }}
      />

      <div className="dark-scrollbar" style={{
        flex: 1,
        overflowY: "auto",
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        display: "flex",
        flexDirection: "column"
      }}>
        {filteredRules.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.45)" }}>
            <WarningOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <p>No rules found.</p>
          </div>
        ) : (
          filteredRules.map(rule => (
            <div key={rule.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.02)",
              transition: "background 0.2s"
            }} className="hover:bg-[rgba(255,255,255,0.02)]">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Text strong style={{ color: 'white', fontSize: "0.95rem" }}>{rule.pattern}</Text>
                <Tag color="blue" style={{ background: 'rgba(255,255,255,0.05)', border: "1px solid rgba(255,255,255,0.1)", margin: 0 }}>
                  {rule.matchType.toUpperCase()}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Space size={[0, 4]} wrap>
                  {rule.actions.map(action => {
                    let color = "default";
                    if (action === 'BLOCK_MESSAGE') color = "orange";
                    if (action === 'WARN') color = "gold";
                    if (action === 'MUTE') color = "volcano";
                    if (action === 'BAN') color = "red";
                    if (action === 'SEND_ALERT') color = "cyan";
                    return <Tag color={color} variant="filled" key={action}>{action}</Tag>;
                  })}
                </Space>
                <Popconfirm
                  title="Delete rule?"
                  onConfirm={() => onRemoveRule(rule.id)}
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} style={{ color: "rgba(245, 34, 45, 0.7)" }} />
                </Popconfirm>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        title={<span style={{ color: "white" }}>Add AutoMod Rule</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        styles={{
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          },
          body: {
            background: "rgba(20, 20, 25, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            padding: 24,
            overflow: "hidden",
            position: "relative",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: 16,
            marginBottom: 16
          }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="pattern" label={<span style={{ color: "rgba(255,255,255,0.65)" }}>Pattern/Word</span>} rules={[{ required: true, message: 'Please enter a pattern' }]}>
            <Input placeholder="e.g. *scam* or https://*" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
          </Form.Item>

          <Form.Item name="matchType" label={<span style={{ color: "rgba(255,255,255,0.65)" }}>Match Type</span>} initialValue="wildcard">
            <Select
              options={[
                { value: "exact", label: "Exact Match" },
                { value: "wildcard", label: "Wildcard Contains" },
                { value: "prefix", label: "Prefix Match" },
                { value: "suffix", label: "Suffix Match" },
              ]}
              styles={{
                popup: {
                  root: {
                    background: "#1e1e24",
                    border: "1px solid rgba(255,255,255,0.1)",
                  },
                },
              }}
            />
          </Form.Item>

          <Form.Item name="actions" label={<span style={{ color: "rgba(255,255,255,0.65)" }}>Automated Actions</span>} initialValue={['BLOCK_MESSAGE', 'SEND_ALERT']}>
            <Select
              mode="multiple"
              placeholder="Select consequence"
              dropdownStyle={{ background: "#1e1e24", border: "1px solid rgba(255,255,255,0.1)" }}
              onChange={(value: string[]) => {
                // Enforce mutual exclusivity
                if (value.includes('CENSOR_WORD') && value.includes('BLOCK_MESSAGE')) {
                  const lastAdded = value[value.length - 1];
                  const newValues = value.filter(v =>
                    lastAdded === 'CENSOR_WORD' ? v !== 'BLOCK_MESSAGE' : v !== 'CENSOR_WORD'
                  );
                  form.setFieldsValue({ actions: newValues });
                }
              }}
            >
              <Select.Option value="BLOCK_MESSAGE">Block Message</Select.Option>
              <Select.Option value="CENSOR_WORD">Censor Word</Select.Option>
              <Select.Option value="WARN">Warn User</Select.Option>
              <Select.Option value="MUTE">Mute User</Select.Option>
              <Select.Option value="BAN">Ban User</Select.Option>
              <Select.Option value="SEND_ALERT">Send Mod Alert</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#9146ff', border: "none" }}>Add Rule</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
