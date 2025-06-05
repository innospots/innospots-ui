import React, { useEffect, useMemo } from 'react';
import { Table } from 'antd';
import { useModel } from 'umi';

import ListTable from '@/components/ListTable';

interface RegistryProps {
  registryType: string;
}

const RegistryList: React.FC<RegistryProps> = ({ registryType }) => {
  const { registryListPage, registryListRequest } = useModel('App', (model) => ({
    registryListPage: model.registryListPage,
    registryListRequest: model.registryListRequest,
  }));

  useEffect(() => {
    registryListRequest.run(registryType);
  }, [registryType]);

  const columns = useMemo(() => {
    // 名称（name），标识（code），更新时间（updateTime）
    return [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '标识',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
      },
    ];
  }, [registryListPage]);

  return (
    <ListTable
      size="small"
      columns={columns}
      rowKey="registryId"
      locale={{
        emptyText: '点击 + 按钮创建',
      }}
      dataSource={registryListPage?.list}
      loading={registryListRequest.loading}
    />
  )
}

export default RegistryList;
