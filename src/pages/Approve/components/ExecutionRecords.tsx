import React, { useState, useEffect } from 'react';
import { Table, Space, Badge } from 'antd';

import * as ApproveService from '@/services/Approve';
import useI18n from '@/common/hooks/useI18n';
import UserAvatar from '@/components/UserAvatar';

import { STATUS_MAP } from '@/pages/Approve/utils';

const getColumnConfig = (key: string) => {
  if (key === 'sequenceNumber') {
    return {
      width: 90,
    };
  } else if (key === 'userName') {
    return {
      // width: 150,
      render: (text: string, record: any) => {
        return (
          <Space size={0}>
            <div style={{ width: 42, height: 42 }}>
              <UserAvatar size={42} userInfo={record} />
            </div>
            <span style={{ marginLeft: 8 }}>{text}</span>
          </Space>
        )
      },
    };
  } else if (key === 'executionStatus') {
    return {
      render: (text: string) => (
        <Badge status={STATUS_MAP[text]} text={text} />
      ),
    };
  } else if (key === 'result') {
    return {
      width: 'auto',
    };
  }
  return {};
};

const ExecutionRecords: React.FC<{ listType?: string, approveInstanceKey: any } & any> = ({
  listType,
  approveInstanceKey,
  ...rest
}) => {
  const { t, loading: i18nLoading } = useI18n(['common', 'approve']);

  const [loading, setLoading] = useState(false);
  const [recordList, setRecordList] = useState<any[]>([]);

  const getExecutionRecord = async () => {
    try {
      setLoading(true);
      const result = await ApproveService[listType === 'instance' ? 'fetchInstanceExecutions' : 'fetchExecutionRecords'](approveInstanceKey);
      setRecordList(result as any[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (approveInstanceKey) {
      getExecutionRecord();
    } else {
      setRecordList([]);
    }
  }, [approveInstanceKey]);

  const renderRecordList = () => {
    const jsonData = {
      sequenceNumber: 'approve.execution.seq',
      nodeName: 'approve.execution.nodeName',
      userName: 'approve.execution.userName',
      approveResult: 'approve.execution.approveResult',
      executionStatus: 'approve.execution.status',
      message: 'approve.execution.message',
      startTime: 'approve.execution.startTime',
      endTime: 'approve.execution.endTime',
      result: 'approve.execution.result',
    };

    // 定义表格列
    const columns = Object.entries(jsonData).map(([key, value]) => ({
      title: t(value),
      dataIndex: key,
      width: 150,
      key,
      render: (text: string) => text || '-',
      ...getColumnConfig(key),
    }));

    return (
      <Table
        loading={loading}
        rowKey="approveExecutionId"
        columns={columns}
        dataSource={recordList}
        // scroll={{ x: 'max-content', y: 400 }}
        pagination={false}
        {...rest}
      />
    );
  };

  return renderRecordList();
};

export default ExecutionRecords;
