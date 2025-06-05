import _ from 'lodash';
import React, { useMemo } from 'react';
import { Table } from 'antd';

import { ViewProps } from './type';

const TableView: React.FC<ViewProps> = ({ dataSource, extProps }) => {
  const { columns, data } = dataSource;

  const formattedColumns = useMemo(() => {
    return _.map(columns, (column) => ({
      ...column,
      title: column.title || column.name,
      dataIndex: column.dataIndex || column.code,
    }));
  }, [columns]);

  const formattedData = useMemo(() => {
    return _.map(data, (item) => {
      return {
        ...item,
        __key: _.uniqueId('table_row_'),
      };
    });
  }, [data]);

  const renderTable = useMemo(() => {
    return (
      <Table
        size="small"
        rowKey="__key"
        pagination={false}
        dataSource={formattedData}
        columns={formattedColumns}
        scroll={{ y: 200, x: 'max-content' }}
        {...extProps}
      />
    );
  }, [formattedData, formattedColumns, extProps]);

  return <div>{renderTable}</div>;
};

export default TableView;
