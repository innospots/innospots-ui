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
import React, { useRef, useMemo } from 'react';

import { COLUMNS_WIDTH } from './config';
import { ExecuteType } from './index';
import DataList from './DataList';

interface LogsProps {
  type: ExecuteType;
  dataSource: any;
}

const FLOW_COLUMNS = [{
  title: 'id',
  dataIndex: 'id',
  width: 220,
}, {
  title: 'level',
  dataIndex: 'level',
  width: 100,
}, {
  title: 'log_time',
  dataIndex: 'log_time',
  width: 180,
}, {
  title: 'message',
  dataIndex: 'message',
  width: 'auto',
}];

const Logs:React.FC<LogsProps> = ({ type, dataSource }) => {

  const getResultList = useMemo(() => {

    const dataList = _.isArray(dataSource) ? dataSource : [dataSource];

    const dataRow = {
      ...dataList[0],
    };

    delete dataRow.__key;

    if (_.isEmpty(dataRow)) {
      return null;
    }

    const columns = type === 'flow' ? FLOW_COLUMNS : _.map(_.keys(dataRow), (k) => ({
      key: k,
      title: k,
      dataIndex: k,
      width: COLUMNS_WIDTH[k] || 'auto'
    }));

    return (
      <DataList columns={columns} dataSource={dataList} />
    );
  }, [ type, dataSource ]);

  return getResultList
};

export default Logs;
