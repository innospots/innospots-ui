/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import _ from 'lodash';
import { useSize } from 'ahooks';
import React, { useRef, useMemo } from 'react';
import type { TableProps } from 'antd';

import ListTable from '@/components/ListTable';

import styles from './index.less';

const DataList: React.FC<TableProps<any>> = ({ columns, dataSource }) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const size = useSize(resultRef);

  const getValue = (v: any) => {
    if (v === '' || v === undefined || v === null) {
      return '-';
    } else if (_.isArray(v)) {
      return v.map((item, index) => {
        return <span key={index}>{getValue(item)}</span>;
      });
    } else if (_.isObject(v)) {
      return JSON.stringify(v);
    }
    return v.toString();
  };

  const getColumns = useMemo(() => {
    if (_.isEmpty(columns)) {
      return [];
    }

    return _.map(columns, (column) => ({
      ...column,
      render: getValue,
    }));
  }, [ columns ]);

  return (
    <div className={styles.resultList} ref={resultRef}>
      <ListTable
        zebra
        noSpacing
        size="small"
        rowKey="id"
        columns={getColumns}
        dataSource={dataSource}
        key={`data-list-${size?.height}`}
        scroll={{
          y: size?.height ? size?.height - 42 : 170,
          x: size?.width ? size.width - 48 : 'max-content',
        }}
      />
    </div>
  );
};

export default DataList;
