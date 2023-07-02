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

import React, { useEffect } from 'react';
import { Card, Table } from 'antd';
import useI18n from '@/common/hooks/useI18n';

const Index: React.FC = (props) => {
  let appWidgetConfig = {};
  let dataSource = [];

  const { t } = useI18n('workspace');

  const columns = [
    {
      title: t('workflow.overview.operation_log.operate_time'),
      key: 'operateTime',
      dataIndex: 'operateTime',
    },
    {
      title: t('workflow.overview.operation_log.user'),
      key: 'username',
      dataIndex: 'username',
    },
    {
      title: t('workflow.overview.operation_log.operation'),
      key: 'detail',
      dataIndex: 'detail',
    },
  ];

  return (
    <Card
      title={t('workflow.overview.operation_log.title')}
      bordered={true}
      extra={<a href="#">{t('workflow.overview.operation_log.more')}...</a>}
      style={{ width: '100%', border: '1px solid #000' }}
    >
      <Table size="small" columns={columns} pagination={false} dataSource={dataSource} />
    </Card>
  );
};
export default Index;
