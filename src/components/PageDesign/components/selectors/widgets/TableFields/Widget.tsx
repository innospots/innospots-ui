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
import cls from 'classnames';
import { Table, Input, TableColumnsType } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useState, forwardRef } from 'react';

import { useControllableValue, useDebounceEffect } from 'ahooks';

import type { KeyValues } from '@/common/types/Types';
import type { WidgetItemType } from '@/models/AppEditor';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';
import { WidgetContext } from '../../WidgetProvider';

import styles from '../../style.less';

type ResponseFieldItem = Record<string, any>

const DEFAULT_COLUMNS = [
  {
    title: 'workflow.extract.field.label',
    dataIndex: 'code',
  },
  {
    width: 80,
    align: 'center',
    title: 'common.table.column.action',
    dataIndex: 'operate',
  },
];

const getDefaultField = (o?: any) => ({
  code: randomString(4),
  ...o,
});

const TableFields: React.FC<WidgetItemType> = forwardRef(({ settings = {}, ...props }) => {
  const { t } = useI18n(['workflow', 'common']);
  const inputFields: any[] = [];
  const readOnly = false

  const [fields, setFields] = useControllableValue<ResponseFieldItem[]>(props, {
    defaultValue: [getDefaultField()],
  });

  const [tableScroll, setTableScroll] = useState<{
    x: true | string | number;
    y: string | number;
  }>({
    x: true,
    y: 140,
  });
  const { size } = useContext(WidgetContext);

  useDebounceEffect(
    () => {
      if (size?.height) {
        setTableScroll({
          x: size.width - 80,
          y: size.height - 74,
        });
      }
    },
    [size],
    {
      wait: 100,
    },
  );

  useEffect(() => {
    setFields(fields || []);
  }, [fields]);

  const updateParam = (index, key, value) => {
    const list: ResponseFieldItem[] = _.cloneDeep(fields) || [];
    list[index][key] = value;
    setFields([...list]);
  };

  const addField = () => {
    const list: ResponseFieldItem[] = _.cloneDeep(fields) || [];
    list.push(getDefaultField());
    setFields([...list]);
  };

  const columns: TableColumnsType<KeyValues> = [
    {
      title: settings.codeTitle || t('workflow.webhook.form.response.column.field'),
      dataIndex: 'code',
      render: (text, record, index) =>
        readOnly ? (
          <span>{text || '-'}</span>
        ) : (
          <Input
            size="small"
            value={text}
            style={{ width: '100%' }}
            placeholder={t('common.input.placeholder')}
            onChange={(event) => updateParam(index, 'code', event.target.value)}
          />
        ),
    },
    {
      title: settings.valueTitle || t('workflow.webhook.form.response.column.value'),
      dataIndex: 'value',
      render: (text, record, index) =>
        readOnly ? (
          <span>{text || '-'}</span>
        ) : (
          <Input
            size="small"
            value={text}
            style={{ width: '100%' }}
            placeholder={t('common.input.placeholder')}
            onChange={(event) => updateParam(index, 'value', event.target.value)}
          />
        ),
    },
  ];

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <div className={styles.expandBtn}>
            <span className="cur-btn" onClick={addField}>
              + <span>{t('common.button.add')}</span>
            </span>
          </div>
          <Table
            size="small"
            scroll={tableScroll}
            columns={columns}
            pagination={false}
            dataSource={fields}
          />
        </div>
      </div>
    </div>
  );
})

export default TableFields;
