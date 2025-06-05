import _ from 'lodash';
import { Table } from 'antd'
import { useSize } from 'ahooks';
import React, { useRef, useMemo } from 'react';

import { KeyValues } from '@/common/types/Types';

import styles from './style.less';

const DataTable: React.FC<{
  dataSource: {
    list: KeyValues[];
    schemaFields: KeyValues[];
    pagination: KeyValues;
  }
}> = ({ dataSource: { list, schemaFields, pagination } }) => {
  const wrapperRef = useRef(null);
  const size = useSize(wrapperRef);

  const scroll = useMemo(() => {
    if (!size) return {}

    return {
      x: size.width - 40,
      y: size.height - 130
    }
  }, [ size ])

  const columns = useMemo(() => _.map(schemaFields, item => ({
    title: item.name,
    dataIndex: item.code
  })), [schemaFields]);

  return (
    <div ref={wrapperRef} className={styles.tableWrapper}>
      <Table
        scroll={scroll}
        columns={columns}
        dataSource={list}
        pagination={pagination}
      />
    </div>
  );
};

export default DataTable;
