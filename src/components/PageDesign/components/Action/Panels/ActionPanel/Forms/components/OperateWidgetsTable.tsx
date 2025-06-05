import _ from 'lodash';
import { useModel } from 'umi';
import React, { useEffect, useMemo } from 'react';
import { useRequest, useControllableValue } from 'ahooks';

import { Table, Button, Space, Popconfirm, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { randomString } from '@/common/utils';

import WidgetSelect from './WidgetSelect';
// import { ExpressionInput } from '@/components/Expression'

import { SettingFormItemProps } from '../../types';

const EXCLUDE_WIDGET_TYPE = ['Form', 'Table', 'Button', 'Switch', 'Image'];
const STATUS_OPTIONS = [
  {
    label: '隐藏',
    value: 'hidden'
  },
  {
    label: '显示',
    value: 'visible'
  },
  {
    label: '重置值',
    value: 'reset'
  },
  {
    label: '可编辑',
    value: 'editable'
  }
]

type WidgetItem = {
  widget?: string;
  status: string;
  key: string;
}

const getWidgetItem = (widget?: string, status: string = 'hidden'): WidgetItem => {
  return {
    widget,
    status,
    key: randomString(4)
  }
}

const OperateWidgetsTable: React.FC<SettingFormItemProps> = (props) => {
  const { currentPage } = useModel('AppEditor', (model) => ({
    currentPage: model.currentPage,
  }));

  const [widgets, setWidgets] = useControllableValue<WidgetItem[]>(props, {
    defaultValue: [getWidgetItem()]
  });

  // useEffect(() => {
  //   if (_.isUndefined(widgets)) {
  //     setWidgets([getWidgetItem()]);
  //   }
  // }, [widgets]);

  const widgetOptions = useMemo(() => {
    if (currentPage) {
      const options: any[] = [];
      _.each(currentPage.components, (item) => {
        const exist = _.find(widgets, w => w.widget === item.name);
        options.push({
          value: item.name,
          disabled: exist,
          label: item.settings?.label || item.name,
        });
      });
      return options;
    }
    return [];
  }, [currentPage, widgets]);

  const handleAddWidget = () => {
    setWidgets([...(widgets || []), getWidgetItem()]);
  }

  const columns:any = [
    {
      title: '组件',
      dataIndex: 'widget',
      render: (text: string, record, index) => (
        <WidgetSelect
          size="small"
          value={text}
          widgets={widgetOptions}
          onChange={(value) => {
            if (widgets && widgets[index]) {
              widgets[index].widget = value;
              setWidgets([...widgets]);
            }
          }}
        />
      ),
    },
    {
      title: '组件状态',
      dataIndex: 'status',
      render: (text: string, record, index) => (
        <Select
          size="small"
          value={text}
          options={STATUS_OPTIONS}
          placeholder="请选择"
          onChange={(value) => {
            if (widgets && widgets[index]) {
              widgets[index].status = value;
              setWidgets([...widgets]);
            }
          }}
        />
      ),
    },
    {
      width: 100,
      align: 'center',
      title: () => (
        <Space>
          <span>操作</span>
          <Button type="link" size="small" onClick={handleAddWidget}>添加</Button>
        </Space>
      ),
      dataIndex: 'action',
      render: (text: string, record, index) => (
        <Popconfirm
          title="是否删除此项?"
          okText="是"
          cancelText="否"
          onConfirm={() => {
            widgets.splice(index, 1);
            setWidgets([...widgets]);
          }}
        >
          <span className="g-button">
            <DeleteOutlined />
          </span>
        </Popconfirm>
      ),
    },
  ];

  return <Table size="small" columns={columns} dataSource={widgets} pagination={false} />;
};

export default OperateWidgetsTable;
