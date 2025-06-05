import React, { useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import { useModel } from 'umi';
import { Row, Col, Tabs, Menu, Input, Select, Button, Divider, Pagination, Dropdown, Spin } from 'antd';
import {
  PlusOutlined,
  CalculatorOutlined,
  HolderOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';

import { ReactSortable } from 'react-sortablejs';
import { useRequest, useDebounceEffect, useDeepCompareEffect, useControllableValue } from 'ahooks';

import * as Service from '@/services/Credential';
import { randomString } from '@/common/utils';
import { KeyValues, ArrayType } from '@/common/types/Types';

import { getDefaultColumn, TableColumnType } from '../../index'

import ColumnSetting from './ColumnSetting';

import styles from '../style.less';

type DataQueryValue = Record<string, any>;

interface DataQueryProps {
  value?: DataQueryValue;
  onChange?: (value: DataQueryValue) => void;
}

const DataQuery: React.FC<DataQueryProps> = (props) => {
  const [ tableCache, setTableCache ] = useState({})
  const [ editColumnIndex, setEditColumnIndex ] = useState(-1)
  const [ credentials, setCredentials ] = useState<ArrayType>([]);
  const { appState } = useModel('AppData', (model) => ({
    appState: model.appState
  }));
  const { appDataset } = useModel('App', (model) => ({
    appDataset: model.appDataset,
  }));
  const {
    selectedWidget,
    updateSelectedWidgetProps
  } = useModel('AppEditor', model => ({
    selectedWidget: model.selectedWidget,
    updateSelectedWidgetProps: model.updateSelectedWidgetProps
  }))
  const { fetchSchemaRegistryTopicsRequest } = useModel('Credential', (model) => ({
    fetchSchemaRegistryTopicsRequest: model.fetchSchemaRegistryTopicsRequest
  }));

  const [ curColumns, setCurColumns ] = useState<TableColumnType[]>([])

  const widgetId = useMemo(() => selectedWidget?.id || '', [ selectedWidget?.id ])
  const widgetData = useMemo(() => (appState.widgetData[widgetId] || {}), [ appState.widgetData[widgetId] ])
  const defaultColumns = useMemo<TableColumnType[]>(() => _.cloneDeep(widgetData?.columns || []), [ widgetData?.columns ])
  
  const [ valueState, setValueState ] = useControllableValue<{
    type: string,
    value: any[],
    columns: TableColumnType[]
  }>(props, {
    defaultValue: {
      type: '',
      value: [],
      columns: []
    }
  })

  useDeepCompareEffect(() => {
    if (valueState?.columns) {
      setCurColumns([
        ...valueState?.columns
      ])
    }
  }, [ valueState?.columns ])

  const selectValue = useMemo(() => {
    if (valueState?.type === 'table') {
      return valueState.value?.[0]
    }
  }, [ valueState ])

  /**
   * 获取凭证列表
   */
  const credentialsRequest = useRequest<ArrayType, KeyValues[]>(Service.fetchCredentials, {
    manual: true,
    onSuccess: (result: ArrayType) => {
      setCredentials(_.map(result, item => ({
        key: item.credentialKey,
        label: item.name,
        popupClassName: 'credential-submenu',
        children: [{
          key: 'loading',
          label: (<Spin size="small" />)
        }]
      })));
    },
  });

  useEffect(() => {
    credentialsRequest.run({
      connectType: 'JDBC'
    });
  }, []);

  const triggerChange = (newValue) => {
    setValueState({
      ...valueState,
      ...newValue
    });
  };

  const triggerColumnsChange = (newColumns: TableColumnType[]) => {
    triggerChange({
      columns: [
        ...newColumns
      ]
    });
  };

  const handleColumnsSortEnd = () => {
    triggerColumnsChange(curColumns)
  }

  useDebounceEffect(() => {
    if (!_.isEmpty(defaultColumns) && _.isEmpty(valueState?.columns)) {
      triggerColumnsChange(defaultColumns)
    }
  }, [defaultColumns, valueState?.columns], {
    wait: 1000,
  })

  const addColumn = () => {
    curColumns.push(getDefaultColumn({
      id: ['Col', randomString(4)].join('-'),
      name: `列${curColumns.length + 1}`,
    }));
    triggerColumnsChange(curColumns);
  };

  const changeColumn = (index, key) => (event) => {
    curColumns[index][key] = event.target.value;
    triggerColumnsChange(curColumns);
  };

  const toggleColumnVisible = (index: number) => () => {
    curColumns[index].visible = !curColumns[index].visible
    triggerColumnsChange(curColumns);
  }

  const handleSelectTable = ({ keyPath }) => {
    const values = {
      type: 'table',
      value: keyPath,
      columns: []
    }
    updateSelectedWidgetProps({
      settings: {
        dataOptions: {
          ...values
        }
      }
    }, true)

    triggerChange(values)
    setCurColumns([])
  };

  const handleTableOpenChange = async (openKeys) => {
    const credentialKey = openKeys[0]
    if (credentialKey && credentialKey !== 'loading' && !tableCache[credentialKey]) {
      const result = await fetchSchemaRegistryTopicsRequest.runAsync(credentialKey)
      setTableCache({
        ...tableCache,
        [credentialKey]: result
      })
      const parentMenu = _.find(credentials, item => item.key === credentialKey)
      parentMenu.children = _.map(result || [], (item: Record<string, string>) => ({
        key: item.code,
        label: item.name
      }))

      setCredentials([
        ...credentials
      ])
    }
  }

  const handleColumnChange = (column) => {
    if (editColumnIndex > -1) {
      curColumns[editColumnIndex] = column
      setCurColumns([
        ...curColumns
      ])
      triggerColumnsChange(curColumns);
    }
  }

  const handleCloseColumnSetting = () => {
    setEditColumnIndex(-1)
  }

  const renderSelectTable = () => {

    return (
      <div className={styles.container}>
        <div>
          <Input placeholder="请输入表名" />
        </div>
        <div className={styles.menuList}>
          <Menu mode="vertical" items={credentials} className={styles.credentialMenu} onOpenChange={handleTableOpenChange} onSelect={handleSelectTable} />
        </div>
        <Divider style={{ marginBottom: 8 }} />
        <div>
          <Button block type="text" icon={<PlusOutlined />}>
            新建数据源
          </Button>
        </div>
      </div>
    );
  };

  const renderSelectQuery = () => {
    const items = _.map(appDataset, (item) => {
      return {
        key: item.registryId,
        label: item.name,
      };
    });
    const dropdownItems = [
      {
        key: '1',
        label: '新建SQL查询',
      },
      {
        key: '2',
        label: '新建HTTP查询',
      },
      {
        key: '3',
        label: '新建工作流查询',
      },
    ];
    return (
      <div className={styles.container}>
        <div>
          <Input placeholder="请输入表名" />
        </div>
        <div className={styles.menuList}>
          <Menu mode="vertical" items={items} style={{ border: 0 }} />
        </div>
        <div>
          <Pagination simple size="small" total={50} />
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div>
          <Dropdown
            menu={{
              items: dropdownItems,
            }}
          >
            <Button block type="text" icon={<PlusOutlined />}>
              新建查询
            </Button>
          </Dropdown>
        </div>
      </div>
    );
  };

  const dropdownRender = () => {
    const items = [
      { label: '表格', key: 'table', children: renderSelectTable() },
      { label: '查询', key: 'query', children: renderSelectQuery() },
    ];

    return (
      <div style={{ minWidth: 300 }}>
        <Tabs size="small" items={items} tabBarStyle={{ paddingLeft: 12, paddingRight: 12 }} />
      </div>
    );
  };

  const renderTableCols = () => {
    return (
      <div className={styles.colContainer}>
        <Row justify="space-between">
          <Col>
            <p>表格字段</p>
          </Col>
          <Col>
            <span className="b-button" onClick={addColumn}>
              <PlusOutlined />
              新建
            </span>
          </Col>
        </Row>
        {curColumns.length < 1 ? (
          <p className={styles.emptyText}>请选择关联数据</p>
        ) : (
          <ReactSortable
            tag="ul"
            list={curColumns}
            handle={`.${styles.listDrag}`}
            setList={setCurColumns}
            className={styles.colList}
            onEnd={handleColumnsSortEnd}
          >
            {curColumns.map((item, index) => (
              <li key={item.id} className={styles.colListItem}>
                <div className={styles.listDrag}>
                  <HolderOutlined />
                </div>
                <div className={styles.text}>
                  <Input
                    key={item.id}
                    bordered={false}
                    value={item.name}
                    onChange={changeColumn(index, 'name')}
                  />
                </div>
                <div className={styles.options}>
                  <span className="g-button" onClick={() => setEditColumnIndex(index)}>
                    <SettingOutlined />
                  </span>
                  <span className="g-button" onClick={toggleColumnVisible(index)}>
                    {
                      !item.visible ? (
                        <EyeInvisibleOutlined />
                      ) : (
                        <EyeOutlined />
                      )
                    }
                  </span>
                </div>
              </li>
            ))}
          </ReactSortable>
        )}
      </div>
    );
  };

  const renderDataSelect = () => {
    return (
      <div className={styles.select}>
        <Row>
          <Col flex="30px">
            <Row align="middle" justify="center" style={{ height: '100%' }}>
              <Col>
                <CalculatorOutlined />
              </Col>
            </Row>
          </Col>
          <Col flex="auto">
            <Select
              bordered={false}
              value={selectValue}
              style={{ width: '100%' }}
              placeholder="请选择关联数据"
              dropdownMatchSelectWidth={false}
              dropdownRender={dropdownRender}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const renderColumnSetting = () => {
    const visible = editColumnIndex > -1
    // const editColumn = curColumns[editColumnIndex]

    return (
      <ColumnSetting open={visible} value={editColumnIndex} onChange={handleColumnChange} onClose={handleCloseColumnSetting} />
    )
  }

  return (
    <div>
      {renderDataSelect()}
      {renderTableCols()}
      {renderColumnSetting()}
    </div>
  );
};

export default DataQuery;
