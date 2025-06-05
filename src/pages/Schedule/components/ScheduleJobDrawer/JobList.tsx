import _ from 'lodash';
import { useRequest } from 'ahooks';
import { Input, Table, TableProps, Row, Col } from 'antd';
import { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';

import { fetchJobFlows } from '@/services/Workflow';

import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

type RecordType = {
  flowKey: string;
  name: string;
  // ...其他字段
};

const JobList = ({
  value,
  isView,
  onChange,
}: {
  value?: RecordType;
  onChange?: (selectedItem: RecordType) => void;
  isView?: boolean;
}) => {
  const [selectedKey, setSelectedKey] = useState<string>();

  const [queryData, setQueryData] = useState<any>({
    ...DEFAULT_PAGINATION_SETTINGS,
  });

  const jobFlowRequest = useRequest(fetchJobFlows, {
    manual: true,
  });

  useEffect(() => {
    jobFlowRequest.run(queryData);
  }, [queryData]);

  useEffect(() => {
    if (value) {
      setSelectedKey(value.flowKey);
    }
  }, [value]);

  const flowList = useMemo(() => {
    const list = jobFlowRequest.data?.list || [];
    if (!isView) {
      return list;
    } else if (value?.flowKey) {
      return _.filter(list, (item) => item.flowKey === value.flowKey);
    }
    return [];
  }, [jobFlowRequest.data, value, isView]);

  const handleSearch = (value: string) => {
    setQueryData({
      ...queryData,
      queryInput: value,
    });
  };

  const columns: TableProps<RecordType>['columns'] = [
    {
      title: 'Key',
      dataIndex: 'flowKey',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
  ];

  return (
    <div style={{ margin: '12px 0' }}>
      {/* 顶部操作栏 - 修改为Row/Col布局 */}
      <Row 
        justify="space-between" 
        align="middle" 
        gutter={0}
        style={{ marginBottom: '8px' }}
      >
        <Col>
          <span>调度作业</span>
        </Col>
        <Col>
          <Input.Search
            size="small"
            allowClear
            placeholder="搜索作业"
            onSearch={handleSearch}
          />
        </Col>
      </Row>

      {/* 表格区域 */}
      <Table
        size="small"
        rowKey="flowKey"
        columns={columns}
        dataSource={flowList}
        loading={jobFlowRequest.loading}
        pagination={jobFlowRequest.data?.pagination}
        rowClassName={(record) => 
          classNames('cursor-pointer hover:bg-blue-50', {
            'bg-blue-100': record.flowKey === selectedKey
          })
        }
        rowSelection={!isView ? {
          type: 'radio',
          selectedRowKeys: selectedKey ? [selectedKey] : [],
          onChange: (selectedRowKeys, selectedRows) => {
            const key = selectedRowKeys[0];
            setSelectedKey(key);
            onChange?.(selectedRows[0]);
          },
        } : undefined}
        scroll={{ y: 400 }}
      />
    </div>
  );
};

export default JobList;
