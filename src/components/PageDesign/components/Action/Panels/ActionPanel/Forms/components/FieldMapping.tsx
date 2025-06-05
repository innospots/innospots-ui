import _ from 'lodash';
import { useModel } from 'umi';
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useControllableValue } from 'ahooks';

import { Table, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { randomString } from '@/common/utils';

import WidgetSelect from './WidgetSelect';

import { SettingFormItemProps } from '../../types';

const EXCLUDE_WIDGET_TYPE = ['Form', 'Table', 'Button', 'Switch', 'Image'];

const FieldMapping: React.FC<SettingFormItemProps> = (props) => {
  const { actionFormIns, currentFormData, updateActionFormData } = useModel('Action', (model) => ({
    actionFormIns: model.actionFormIns,
    currentFormData: model.currentActionFormData,
    updateActionFormData: model.updateActionFormData,
  }));
  const { currentPage } = useModel('AppEditor', (model) => ({
    currentPage: model.currentPage,
  }));

  const changedIndex = useRef<number>(-1);
  const [schemaFields, setSchemaFields] = useState<any[]>([]);

  const widgetOptions = useMemo(() => {
    if (currentPage) {
      const options: any[] = [];
      _.each(currentPage.components, (item) => {
        if (!(EXCLUDE_WIDGET_TYPE || []).includes(item.type)) {
          options.push({
            value: item.name,
            label: item.settings?.label || item.name,
          });
        }
      });
      return options;
    }
    return [];
  }, [currentPage]);

  useEffect(() => {
    const fields = currentFormData.table?.schemaFields || [];
    const changed = changedIndex.current > -1;
    const newSchemaFields = _.map(fields, (item) => {
      const widget = widgetOptions.find((widget) => widget.value === item.code);
      let widgetValue = widget?.value;
      if (changed) {
        widgetValue = item.widget;
      } else {
        if ('widget' in item) {
          widgetValue = item.widget;
        }
      }

      return {
        key: randomString(4),
        ...item,
        widget: widgetValue,
      }
    })
    setSchemaFields(newSchemaFields);

    if (!changed) {
      triggerChange(newSchemaFields);
    }
  }, [currentFormData.table]);

  const triggerChange = (fields: any[]) => {
    actionFormIns.current?.setFieldsValue({
      table: {
        ...currentFormData.table,
        schemaFields: fields,
      },
    });
  }

  const changeSchemaFields = (index: number) => (value: string) => {
    changedIndex.current = index;
    const newSchemaFields = [...schemaFields];
    newSchemaFields[index].widget = value || '';
    triggerChange(newSchemaFields);
  };

  const columns: any = [
    {
      width: '50%',
      title: '提交字段',
      dataIndex: 'code',
    },
    {
      width: '50%',
      title: '表单字段',
      dataIndex: 'widget',
      render: (text: string, record, index) => (
        <WidgetSelect
          allowClear
          size="small"
          value={text || undefined}
          widgets={widgetOptions}
          onChange={changeSchemaFields(index)}
        />
      ),
    },
    // {
    //   width: 60,
    //   align: 'center',
    //   title: '操作',
    //   dataIndex: 'action',
    //   render: (text: string, record, index) => (
    //     <Popconfirm
    //       title="是否删除此项?"
    //       okText="是"
    //       cancelText="否"
    //       onConfirm={() => {
    //         tableMapping.schemaFields.splice(index, 1);
    //         tableMapping.schemaFields = [...tableMapping.schemaFields];
    //         setTableMapping({
    //           ...tableMapping,
    //         });
    //       }}
    //     >
    //       <span className="g-button">
    //         <DeleteOutlined />
    //       </span>
    //     </Popconfirm>
    //   ),
    // },
  ];

  return <Table size="small" columns={columns} dataSource={schemaFields} pagination={false} />;
};

export default FieldMapping;
