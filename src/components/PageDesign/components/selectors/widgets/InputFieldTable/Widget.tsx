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
import { useModel } from 'umi'
import cls from 'classnames';
import { Table, Cascader } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useState, forwardRef } from 'react';

import { useControllableValue, useDebounceEffect } from 'ahooks';

import type { WidgetItemType } from '@/models/AppEditor';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';
import { WidgetContext } from '../../WidgetProvider';
import InputFieldCascader from '../InputFieldCascader';

import styles from '../../style.less';

const DEFAULT_COLUMNS: any[] = [
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

const InputFieldTable: React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const { fieldSource } = settings || {};
  
  const readOnly = widgetType === 'view'
  const [fields, setFields] = useControllableValue<Record<string, any>[]>(props, {
    defaultValue: [],
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

  const updateFields = (index) => (value) => {
    let fieldData = {};
    if (value) {
      fieldData = getDefaultField({
        opt: 'EQUAL',
        ...value
      });

      if (index > -1) {
        fields[index] = fieldData;
      } else {
        fields.push(fieldData);
      }
    } else {
      fields.splice(index, 1);
    }

    setFields([...fields]);
  };

  const addField = () => {
    // if (!isConfig) return;

    fields.push(getDefaultField());
    setFields([...fields]);
  };

  const formatColumns = () => {
    const _render = (value) => {
      if (value === '' || _.isUndefined(value)) {
        return '-';
      }
      return value;
    };

    const cols: any[] = [].concat(DEFAULT_COLUMNS)

    if (readOnly) {
      cols.splice(1, 1)
    }

    return _.map(cols, (col) => {
      if (_.isString(col)) {
        col = {
          title: col,
          dataIndex: col,
          render: _render,
        };
      } else if (col.title) {
        col.title = t(col.title);
      }

      if (col?.dataIndex === 'code') {
        col.render = (code, record, index) => {
          const fieldNodes = record.fieldNodes || []
          let viewValue = code

          if (fieldNodes.length) {
            viewValue = _.map(fieldNodes, item => item.label)
            viewValue = viewValue.join(' - ')
          }

          if (col.isView) {
            return <span style={{ wordBreak: 'break-all' }}>{viewValue}</span>;
          }

          if (readOnly) {
            return <span style={{ wordBreak: 'break-all' }}>{viewValue || '-'}</span>;
          }

          return (
            <InputFieldCascader
              value={record}
              fieldSource={fieldSource}
              onChange={updateFields(index)}
            />
          );
        };
      } else if (col?.dataIndex === 'operate') {
        col.render = (key, record, index) => {
          return (
            <span
              className="g-button"
              onClick={() => {
                fields.splice(index, 1);
                setFields([...fields]);
              }}
            >
              <DeleteOutlined />
            </span>
          );
        };
      }

      return col;
    });
  };

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          {
            !readOnly && (
              <div className={styles.expandBtn}>
                <span className="cur-btn" onClick={addField}>
                  + <span>{t('common.button.add')}</span>
                </span>
              </div>
            )
          }
          <Table
            size="small"
            rowKey="code"
            pagination={false}
            scroll={tableScroll}
            columns={formatColumns()}
            dataSource={fields}
          />
        </div>
      </div>
    </div>
  );
})

export default InputFieldTable;
