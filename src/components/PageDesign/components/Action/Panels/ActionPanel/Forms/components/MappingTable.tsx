import _ from 'lodash';
import { useModel } from 'umi';
import React, { useEffect, useMemo } from 'react';
import { useRequest, useControllableValue } from 'ahooks';

import { Form, Table, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { randomString } from '@/common/utils';
import { fetchWorkflowInstance } from '@/services/Workflow';

import WidgetSelect from './WidgetSelect';
// import { ExpressionInput } from '@/components/Expression'

import { SettingFormItemProps } from '../../types';

const EXCLUDE_WIDGET_TYPE = ['Form', 'Table', 'Button', 'Switch', 'Image'];

const MappingTable: React.FC<SettingFormItemProps> = (props) => {
  const { currentFormData } = useModel('Action', model => ({
    currentFormData: model.currentActionFormData
  }))

  const tableValue = currentFormData.table || {};
  const [tableMapping, setTableMapping] = useControllableValue(props);
  const workflowInstanceRequest = useRequest(fetchWorkflowInstance, {
    manual: true,
    onSuccess: (result: any) => {
      if (result) {
        setTableMapping({
          configs: result.configs,
          schemaFields: _.map(result.schemaFields, (item) => {
            const current = _.find(tableMapping?.schemaFields, field => (field.code === item.code)) || {}
            return _.assign({
              key: randomString(4),
              code: item.code
            }, current)
          }),
        });
      }
    },
  });

  useEffect(() => {
    if (tableValue?.registryType === 'WORKFLOW') {
      workflowInstanceRequest.run(tableValue.value);
    }
  }, [tableValue?.registryType, tableValue?.value]);

  const columns:any = [
    {
      title: '表字段',
      dataIndex: 'code',
    },
    {
      width: '50%',
      title: '映射字段',
      dataIndex: 'value',
      render: (text: string, record, index) => (
        <WidgetSelect
          size="small"
          value={text}
          excludeTypes={EXCLUDE_WIDGET_TYPE}
          onChange={(value) => {
            if (tableMapping && tableMapping.schemaFields[index]) {
              tableMapping.schemaFields[index].value = value;
              setTableMapping({
                ...tableMapping,
              });
            }
          }}
        />
      ),
    },
    {
      width: 60,
      align: 'center',
      title: '操作',
      dataIndex: 'action',
      render: (text: string, record, index) => (
        <Popconfirm
          title="是否删除此项?"
          okText="是"
          cancelText="否"
          onConfirm={() => {
            tableMapping.schemaFields.splice(index, 1);
            tableMapping.schemaFields = [...tableMapping.schemaFields];
            setTableMapping({
              ...tableMapping,
            });
          }}
        >
          <span className="g-button">
            <DeleteOutlined />
          </span>
        </Popconfirm>
      ),
    },
  ];

  const dataSource = tableMapping?.schemaFields || [];

  return <Table size="small" columns={columns} dataSource={dataSource} pagination={false} />;
};

export default MappingTable;
