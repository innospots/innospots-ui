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
import React, { useMemo } from 'react';

import DataList from './DataList';

interface LogsProps {
  dataSource: any[];
}

const FLOW_COLUMNS = [{
  title: 'id',
  dataIndex: 'id',
  width: 150,
}, {
  title: 'userId',
  dataIndex: 'userId',
  width: 120,
}, {
  title: 'userName',
  dataIndex: 'userName',
  width: 120,
}, {
  title: 'icon',
  dataIndex: 'icon',
  width: 150,
}, {
  title: 'viewType',
  dataIndex: 'viewType',
  width: 120,
}, {
  title: 'title',
  dataIndex: 'title',
  width: 120,
}, {
  title: 'viewId',
  dataIndex: 'viewId',
  width: 150,
}, {
  title: 'data',
  dataIndex: 'data',
  width: 500,
}, {
  title: 'src',
  dataIndex: 'src',
  width: 150,
}, {
  title: 'description',
  dataIndex: 'description',
  width: 150,
}, {
  title: 'previewUrl',
  dataIndex: 'previewUrl',
  width: 150,
}, {
  title: 'downloadUrl',
  dataIndex: 'downloadUrl',
  width: 150,
}];

const Message:React.FC<LogsProps> = ({ dataSource }) => {

  const getResultList = useMemo(() => {

    if (_.isEmpty(dataSource)) {
      return null;
    }

    return (
      <DataList columns={FLOW_COLUMNS} dataSource={dataSource} />
    );
  }, [ dataSource ]);

  return getResultList
};

export default Message;
