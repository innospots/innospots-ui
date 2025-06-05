import _ from 'lodash'
import cls from 'classnames'
import {useModel} from 'umi';
import React, {useMemo, useEffect, forwardRef, useState} from 'react';
import {useControllableValue, useRequest} from 'ahooks'

import { Select, message } from 'antd'

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor'

import ReadOnlyWidget from '../ReadOnlyWidget';

import styles from '../../style.less'
import * as Service from '@/services/Credential';

type Props = {
  inForm?: boolean
} & WidgetItemType

const KeyFieldSelect:React.FC<Props> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const {t} = useI18n('common');
  const { formValues } = useModel('AppEditor', (model) => ({
    formValues: model.currentFormValues
  }));
  const [schemaFields, setSchemaFields] = useState<any[]>([]);
  const [curValue, setCurValue] = useControllableValue(props)
  const inputProps = useMemo(() => {
    const selectProps = _.pick(settings, [
      'disabled',
      'placeholder'
    ])

    if (!selectProps.placeholder) {
      selectProps.placeholder = t('common.select.placeholder')
    }

    return selectProps
  }, [ settings ])

  const node: any = null
  const inputFields: any[] = []

  const fetchSchemaFieldsRequest = useRequest<any, any[]>(Service.fetchSchemaFields, {
    manual: true,
    onSuccess: (result) => {
      if (result) {
        setSchemaFields(result)
      }
    },
  });

  const selectOptions = useMemo(() => {
    return _.map(schemaFields, item => ({
      value: item.code,
      label: item.name
    }))
  }, [ schemaFields ]);

  const curNodeData = {};

  const { tableName, dependencies } = settings
  const curTableName = formValues[tableName];
  const curDataSourceId = formValues[dependencies];

  const tableNameVal = curTableName || curNodeData[tableName];
  const dataSourceIdVal = curDataSourceId || curNodeData[dependencies];

  const getTableData = async () => {
    let error;

    if (!dataSourceIdVal || !tableNameVal || fetchSchemaFieldsRequest.loading) {
      // error = t('workflow.sql.datasource.placeholder')
      return;
    }

    if (error) {
      message.error(error);
    } else {
      fetchSchemaFieldsRequest.run({
        tableName: tableNameVal,
        credentialKey: dataSourceIdVal
      });
    }
  };

  useEffect(() => {
    getTableData();
  }, [tableNameVal, dataSourceIdVal]);

  const getParentInputFields = () => {
    if (!node) return [];

    const edges = node._model.graph.getIncomingEdges(node);
    const fields: any[] = [];
    _.map(edges, edge => {
      const source = edge.source;
      if (source && source.cell) {
        const field = _.find(inputFields, item => item.nodeKey === source.cell);
        if (field) {
          fields.push(field)
        }
      }
    });

    return fields
  }

  if (widgetType === 'view') {
    return (
      <ReadOnlyWidget options={selectOptions} { ...props } />
    )
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <Select
            value={curValue}
            options={selectOptions}
            style={{width: '100%'}}
            { ...inputProps }
            onChange={setCurValue}
          />
        </div>
      </div>
    </div>
  )
})

export default KeyFieldSelect

