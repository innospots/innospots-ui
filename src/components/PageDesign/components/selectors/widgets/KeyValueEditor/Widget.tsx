import _ from 'lodash';
import { Table, Input } from 'antd';
import React, { useMemo, useState, useContext, forwardRef } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { useControllableValue, useDebounceEffect } from 'ahooks';

import type { WidgetItemType } from '@/models/AppEditor';
import { randomString } from '@/common/utils';

import { WidgetContext } from '../../WidgetProvider';

const KeyValueEditor: React.FC<Partial<WidgetItemType>> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const [options, setOptions] = useControllableValue<any[]>(props, {
    defaultValue: [],
  });
  const [tableScroll, setTableScroll] = useState<{
    x: true | string | number;
    y: string | number;
  }>({
    x: true,
    y: 140,
  });
  const readOnly = widgetType === 'view';
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

  const addNewOption = () => {
    const ops = options || [];
    ops.push({
      key: randomString(4),
    });
    setOptions([].concat(ops));
  };

  const deleteOption = (index) => () => {
    const ops = options || [];
    ops.splice(index, 1);
    setOptions([].concat(ops));
  };

  const changeOption = (index, type) => (event) => {
    const ops = options || [];
    ops[index][type] = event.target.value;
    setOptions(_.cloneDeep(ops));
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'label',
        title: '名称',
        dataIndex: 'label',
        render: (text, record, index) => {
          if (readOnly) {
            return text
          }

          return (
            <Input
              value={text}
              size="small"
              style={{ width: '100%' }}
              placeholder="请输入"
              onChange={changeOption(index, 'label')}
            />
          )
        },
      },
      {
        key: 'value',
        title: '值',
        dataIndex: 'value',
        render: (text, record, index) => {
          if (readOnly) {
            return text
          }

          return (
            <Input
              size="small"
              value={text}
              style={{ width: '100%' }}
              placeholder="请输入"
              onChange={changeOption(index, 'value')}
            />
          )
        },
      },
    ];
    if (!readOnly) {
      cols.push({
        key: 'action',
        title: () => (
          <span className="b-button" onClick={addNewOption}>
            +新增
          </span>
        ),
        dataIndex: 'action',
        width: 60,
        align: 'center',
        render: (text, record, index) => (
          <span className="g-button" onClick={deleteOption(index)}>
            <DeleteOutlined />
          </span>
        ),
      });
    }

    return cols
  }, [readOnly, options]);

  return (
    <div>
      <Table
        size="small"
        scroll={tableScroll}
        pagination={false}
        columns={columns}
        dataSource={options}
        locale={{
          emptyText: settings.placeholder,
        }}
      />
    </div>
  );
})

export default KeyValueEditor;
