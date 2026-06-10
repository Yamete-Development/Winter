import { useState } from "react";
import { Typography, Space, Tag, Input, Button, Table, Modal, Form, Select, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface AntiSwearRule {
  id: string;
  pattern: string;
  matchType: string;
  actions: string[];
}

interface BlockedWordsManagerProps {
  rules: AntiSwearRule[];
  onAddRule: (rule: AntiSwearRule) => void;
  onRemoveRule: (id: string) => void;
}

export function BlockedWordsManager({ rules, onAddRule, onRemoveRule }: BlockedWordsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const handleAdd = (values: any) => {
    onAddRule({
      id: Math.random().toString(36).substr(2, 9),
      pattern: values.pattern.trim(),
      matchType: values.matchType,
      actions: values.actions,
    });
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredRules = rules.filter(r => r.pattern.toLowerCase().includes(searchText.toLowerCase()));

  const columns = [
    {
      title: 'Pattern',
      dataIndex: 'pattern',
      key: 'pattern',
      render: (text: string) => <Text strong style={{ color: 'white' }}>{text}</Text>,
    },
    {
      title: 'Match Type',
      dataIndex: 'matchType',
      key: 'matchType',
      render: (type: string) => (
        <Tag color="blue" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (actions: string[]) => (
        <Space size={[0, 4]} wrap>
          {actions.map(action => {
            let color = "default";
            if (action === 'BLOCK_MESSAGE') color = "orange";
            if (action === 'WARN') color = "gold";
            if (action === 'MUTE') color = "volcano";
            if (action === 'BAN') color = "red";
            if (action === 'SEND_ALERT') color = "cyan";
            return <Tag color={color} variant="filled" key={action}>{action}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: '',
      key: 'delete',
      width: 60,
      render: (_: any, record: AntiSwearRule) => (
        <Popconfirm
          title="Delete rule?"
          onConfirm={() => onRemoveRule(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
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
          style={{ background: '#9146ff', border: 'none' }}
        >
          New Rule
        </Button>
      </div>

      <Input 
        prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.25)' }} />} 
        placeholder="Filter rules..." 
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }} 
      />

      <Table 
        dataSource={filteredRules} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 4, size: 'small', style: { marginBottom: 0 } }}
        size="small"
        scroll={{ y: 240 }}
        style={{ 
          background: 'rgba(0,0,0,0.2)', 
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 8
        }}
        components={{
          header: {
            cell: (props: any) => <th {...props} style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }} />
          },
          body: {
            row: (props: any) => <tr {...props} className="hover:bg-[rgba(255,255,255,0.02)]" />,
            cell: (props: any) => <td {...props} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} />
          }
        }}
      />

      <Modal 
        title="Add AutoMod Rule" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="pattern" label="Pattern/Word" rules={[{ required: true, message: 'Please enter a pattern' }]}>
            <Input placeholder="e.g. *scam* or https://*" />
          </Form.Item>
          
          <Form.Item name="matchType" label="Match Type" initialValue="wildcard">
            <Select>
              <Select.Option value="exact">Exact Match</Select.Option>
              <Select.Option value="wildcard">Wildcard Contains</Select.Option>
              <Select.Option value="prefix">Prefix Match</Select.Option>
              <Select.Option value="suffix">Suffix Match</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="actions" label="Automated Actions" initialValue={['BLOCK_MESSAGE', 'SEND_ALERT']}>
            <Select mode="multiple" placeholder="Select consequence">
              <Select.Option value="BLOCK_MESSAGE">Block Message</Select.Option>
              <Select.Option value="WARN">Warn User</Select.Option>
              <Select.Option value="MUTE">Mute User</Select.Option>
              <Select.Option value="BAN">Ban User</Select.Option>
              <Select.Option value="SEND_ALERT">Send Mod Alert</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#9146ff' }}>Add Rule</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
