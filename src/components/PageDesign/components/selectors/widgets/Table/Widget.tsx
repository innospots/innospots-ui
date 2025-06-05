import React, { useState, useMemo, useContext, forwardRef } from 'react';
import _ from 'lodash';
import cls from 'classnames';

import { useModel } from 'umi';

import { Spin, Table as AntdTable, TableColumnType } from 'antd';
import { useRequest, useDeepCompareEffect, useDebounceEffect } from 'ahooks';

import type { WidgetItemType } from '@/models/AppEditor';
import { fetchSchemaRegistry } from '@/services/Credential';

import { getDefaultColumn } from './index'

import { WidgetContext } from '../../WidgetProvider';

import styles from '../../style.less';

type Props = {} & WidgetItemType;

const Widget: React.FC<Props> = forwardRef((widgetProps, ref) => {
  const [tableScroll, setTableScroll] = useState<{
    x: true | string | number
    y: string | number
  }>({
    x: true,
    y: 'auto'
  })
  const { size } = useContext(WidgetContext)
  const { id: widgetId, settings = {} } = widgetProps;
  const { appState, setWidgetData } = useModel('AppData', (model) => ({
    appState: model.appState,
    setWidgetData: model.setWidgetData,
  }));

  const widgetData = useMemo(() => (appState.widgetData[widgetId] || {}), [ appState.widgetData[widgetId]] )
  const tableDataSource = useMemo(
    () => {
      const dataSource = widgetData.dataSource || []
      return _.map(dataSource, (item, index) => ({
        __rowKey: `${widgetId}_${index}`,
        ...item
      }))
    },
    [ widgetData.dataSource ],
  );
  const defaultColumns = useMemo(() => widgetData.columns || [], [ widgetData.columns ])
  const updatedColumns = useMemo(() => settings.dataOptions?.columns || [], [ settings.dataOptions?.columns ])

  const tableHeight = useMemo(() => {
    if (size?.height) {
      return size.height - (settings.label ? 36 : 0)
    }
    return 0
  }, [ size?.height, settings.label ])

  useDebounceEffect(() => {
    if (tableHeight) {
      setTableScroll({
        x: size?.width - 24,
        y: tableHeight
      })
    }
  }, [ size, tableHeight ], {
    wait: 100
  })

  const tableColumns = useMemo(() => {
    const columns: any[] = []
    const newCols = _.isEmpty(updatedColumns) ? defaultColumns : updatedColumns
    _.map(newCols, (item) => {
      const { id, name, visible } = item
      if (visible) {
        let width = item.width * 1
        if (_.isNaN(width)) {
          width = 120
        }
        const column: TableColumnType<any> = {
          width,
          key: id,
          title: name,
          dataIndex: id,
          align: item.align,
          ellipsis: !item.isWrap,
          render: (text: any) => {
            let value: string;
            try {
              if (_.isNil(text)) {
                value = '-';
              } else if (_.isArray(text) || _.isPlainObject(text)) {
                value = JSON.stringify(text);
              } else {
                value = text + '';
              }
            } catch (e) {
              value = '-';
            }
    
            return value;
          },
        }

        columns.push(column)
      }
    });
    return columns
  }, [defaultColumns, updatedColumns]);

  const fetchSchemaRegistryRequest = useRequest<any, any>(fetchSchemaRegistry, {
    manual: true,
  });
  const dataLoading = useMemo(() => fetchSchemaRegistryRequest.loading, [ fetchSchemaRegistryRequest.loading ])

  const getDefaultColumns = (dataSource) => {
    if (!_.isEmpty(dataSource)) {
      return _.map(dataSource[0], (v, k) => (getDefaultColumn({
        id: k,
        name: k,
        isDefault: true
      })))
    }
    return []
  }

  const fetchTableData = async (dataOptions) => {
    if (dataOptions.type === 'table') {
      const values = dataOptions.value || [];
      if (values.length === 2) {
        const result = await fetchSchemaRegistryRequest.runAsync({
          credentialKey: values[1],
          tableName: values[0],
        });
        if (result) {
          const dataSource = result.schemaFields || []
          setWidgetData(widgetId, {
            dataSource,
            columns: getDefaultColumns(dataSource)
          });
        }
      }
    }
  };

  useDeepCompareEffect(() => {
    fetchTableData(settings.dataOptions || {});
  }, [settings.dataOptions?.value]);

  const renderTable = () => {
    return (
      <AntdTable
        size="middle"
        rowKey="__rowKey"
        pagination={false}
        scroll={tableScroll}
        loading={dataLoading}
        columns={tableColumns}
        dataSource={tableDataSource}
      />
    );
  };

  const renderEmptyTable = () => {
    return (
      <div className={styles.placeholder} style={{height: tableHeight}}>
        <div className={styles.empty}>
          <p className={styles.text}>点击按钮关联数据来展示数据</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cls(styles.node, styles.table, 'editor-node-widget', { [styles.isLoading]: dataLoading || tableScroll.y === 'auto' })}>
      <Spin spinning={fetchSchemaRegistryRequest.loading}>
        <div className={styles.inner}>
          {renderTable()}
          {/* {tableDataSource.length ? renderTable() : renderEmptyTable()} */}
        </div>
      </Spin>
    </div>
  );
})

export default Widget;
