import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Button, Space, message, Row, Col } from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import IconButton from '@/components/IconButton';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

const JobParams: React.FC<{
  value?: KeyValuePair[];
  title?: string;
  onChange: (value: KeyValuePair[]) => void;
  isView?: boolean; 
}> = ({ value, onChange, isView, title }) => {
  const { t } = useI18n(['common', 'schedule']);

  const [data, setData] = useState<KeyValuePair[]>([]);
  const [editingData, setEditingData] = useState<KeyValuePair | null>(null);

  useEffect(() => {
    setData(value || []);
  }, [value]);

  const handleAdd = () => {
    const newData = {
      id: Date.now().toString(),
      key: '',
      value: '',
    };
    const newParams = [...data, newData];
    setData(newParams);
    setEditingData(newData);
  };

  const handleDelete = (id: string) => {
    const newData = data.filter((item) => item.id !== id);
    setData(newData);
    onChange(newData);
  };

  const handleEdit = (record: KeyValuePair) => {
    if (editingData) return;
    setEditingData({ ...record });
  };

  const handleSave = (id: string) => {
    if (!editingData) return;
    
    // 验证逻辑
    const isKeyDuplicate = data.some(item => item.id !== id && item.key === editingData.key);
    if (!editingData.key.trim()) {
      message.error(t('schedule.error_message.key.required'));
      return;
    }
    if (isKeyDuplicate) {
      message.error(t('schedule.error_message.key.duplicate'));
      return;
    }
    if (!editingData.value.trim()) {
      message.error(t('schedule.error_message.value.required'));
      return;
    }

    const newData = data.map(item => 
      item.id === id ? { ...editingData } : item
    );
    setData(newData);
    setEditingData(null);
    onChange(newData);
  };

  const handleCancel = (id: string, index: number) => {
    const current = data[index];
    if (current.key === '' && current.value === '') {
      const newData = data.filter(item => item.id !== id);
      setData(newData);
    }
    setEditingData(null);
  };

  // 更新输入处理
  const handleInputChange = (id: string, field: 'key' | 'value', value: string) => {
    if (!editingData) return;
    
    // 实时验证key格式
    if (field === 'key' && /\s/.test(value)) {
      message.error(t('schedule.error_message.key.space'));
      return;
    }

    editingData[field] = value;
    setEditingData(editingData);
  };

  // 使用useMemo优化columns定义
  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      render: (text: string, record: KeyValuePair) => {
        const isEditing = editingData?.id === record.id;
        return isEditing ? (
          <Input
            key={`${record.id}-key`}
            size="small"
            defaultValue={editingData.key}
            onChange={(e) => handleInputChange(record.id, 'key', e.target.value)}
            placeholder="Key"
            className="w-full"
            onPressEnter={() => handleSave(record.id)}
          />
        ) : (
          <div className="px-2 py-1">{text}</div>
        );
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (text: string, record: KeyValuePair) => {
        const isEditing = editingData?.id === record.id;
        return isEditing ? (
          <Input
            key={`${record.id}-value`}
            size="small"
            defaultValue={editingData.value}
            onChange={(e) => handleInputChange(record.id, 'value', e.target.value)}
            placeholder="Value"
            className="w-full"
            onPressEnter={() => handleSave(record.id)}
          />
        ) : (
          <div className="px-2 py-1">{text}</div>
        );
      },
    },
    {
      width: 80,
      align: 'center',
      title: t('common.table.column.action'),
      dataIndex: 'operation',
      render: (_: any, record: KeyValuePair, index: number) => {
        const editable = editingData?.id === record.id;
        return editable ? (
          <Space>
            <IconButton
              icon={<CheckOutlined />}
              disabled={isView}
              tooltip={t('common.tooltip.confirm')}
              onClick={() => handleSave(record.id)}
            />
            <IconButton
              icon={<CloseOutlined />}
              disabled={isView}
              tooltip={t('common.tooltip.cancel')}
              onClick={() => handleCancel(record.id, index)}
            />
          </Space>
        ) : (
          <Space>
            <IconButton
              icon={<EditOutlined />}
              tooltip={t('common.tooltip.edit')}
              onClick={() => handleEdit(record)}
              disabled={editingData !== null || isView}
            />
            <IconButton
              icon={<DeleteOutlined />}
              disabled={isView}
              tooltip={t('common.tooltip.delete')}
              onClick={() => handleDelete(record.id)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
        <Col>
          <span className="text-base font-medium">{title || t('schedule.job_params.title')}</span>
        </Col>
        {
          !isView && (
            <Col>
              <IconButton
                icon={<PlusOutlined />}
                onClick={handleAdd}
              />
            </Col>
          )
        }
      </Row>
      <Table
        components={{
          body: {
            cell: ({ children, ...props }: any) => (
              <td {...props} className="p-2 align-middle">
                {children}
              </td>
            ),
          },
        }}
        size="small"
        rowKey="id"
        scroll={{ y: 200 }}
        columns={columns}
        dataSource={data}
        pagination={false}
        rowClassName={() => 'editable-row'}
      />
    </div>
  );
};

export default JobParams;
