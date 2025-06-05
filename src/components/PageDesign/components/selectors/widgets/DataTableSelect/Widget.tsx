import _ from 'lodash';
import { useModel } from 'umi';
import { Row, Col, Select, message } from 'antd';
import React, { useEffect, useState, useMemo, forwardRef } from 'react';
import { useControllableValue, useRequest } from 'ahooks';

import * as Service from '@/services/DataSource';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { IconFont } from '@/components/Nice/NiceIcon';

import KafkaTableModal, {MODAL_NAME} from '@/components/KafkaTableModal';

import type { WidgetItemType } from '@/models/AppEditor'

import ReadOnlyWidget from '../ReadOnlyWidget';

import styles from './index.less';

const DataTableSelect:React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const [curValue, setCurValue] = useControllableValue<any[]>(props);

  const [modal] = useModal(MODAL_NAME);

  const [dataSetList, setDataSetList] = useState<any[]>([]);

  const { formValues } = useModel('AppEditor', (model) => ({
    formValues: model.currentFormValues
  }));
  const {simpleCredentials} = useModel('Credential', (model) => _.pick(model, ['simpleCredentials']));

  const isConfig = true
  const curDataSourceId = useMemo(() => {
    if (settings.dependencies) {
      return formValues[settings.dependencies]
    }
    return {}
  }, [ settings.dependencies, formValues ]);

  const dataSourceList = useMemo(() => {
    if (settings.dbType) {
      return _.filter(simpleCredentials, (item) => item.dbType === settings.dbType);
    } else {
      return simpleCredentials;
    }
  }, [simpleCredentials]);

  const updateTable = useMemo(() => _.find(dataSetList, (item) => item.code === curValue || item.registryId === curValue), [dataSetList, curValue]);
  const curDataSource = useMemo(
    () => _.find(dataSourceList, (item) => item.credentialId === curDataSourceId),
    [dataSourceList, curDataSourceId]
  );

  const getDataSetList = useRequest<any, any[]>(Service.fetchSchemaRegistryTopics, {
    manual: true,
    debounceWait: 300,
    onSuccess: (result, params) => {
      if (result) {
        setDataSetList(_.map(result, item => ({
          value: item.code,
          label: item.name
        })));
      }
    }
  });

  const tableOptions = useMemo(() => {
    return curDataSource
      ? _.map(dataSetList, (item) => {
        return {
          label: item.name,
          value: item.code
        };
        // const sourceType = curDataSource.sourceType;
        //
        // if (sourceType === 'QUEUE') {
        //     return {
        //         value: item.registryId,
        //         label: item.name
        //     }
        // } else {
        //     return {
        //         value: item.code,
        //         label: item.name
        //     }
        // }
      })
      : [];
  }, [curDataSource, dataSetList]);

  const _getDataSetList = () => {
    if (curDataSourceId) {
      getDataSetList.run(curDataSourceId, {
        // includeField: true
      });
    }
  };

  useEffect(() => {
    _getDataSetList()
  }, [ curDataSourceId ])

  const toggleTableModal = (type) => () => {
    if (!isConfig) return;

    if (!curDataSource) {
      message.error(t('workflow.kafka.select.datasource.error_message'));
      return;
    } else if (type === 'edit' && !updateTable) {
      message.error(t('workflow.kafka_trigger.select.schemas.error_message'));
      return;
    }

    modal.show({
      modalType: type,
      initValues: updateTable
    });
  };

  const getTableModal = () => {
    // if (!isConfig) return null;

    return (
      //@ts-ignore
      <KafkaTableModal dataSource={curDataSource} onSuccess={() => {
        modal.hide();
        _getDataSetList();
      }}/>
    );
  };

  if (widgetType === 'view') {
    return (
      <ReadOnlyWidget options={tableOptions} { ...props } />
    )
  }

  return (
    <div className={styles.container}>
      {
        settings.showAddButton && (
          <div className={styles.createBtn}>
            <span className="b-button" onClick={toggleTableModal('add')}>+ 新建</span>
          </div>
        )
      }
      <Row align="middle">
        <Col flex="auto">
          <Select
            value={curValue}
            options={dataSetList}
            placeholder="请选择"
            style={{ width: '100%' }}
            onChange={setCurValue}
          />
        </Col>
        {
          settings.showEditButton && (
            <Col flex="30px" style={{ textAlign: 'right' }}>
              <span className="g-button" onClick={toggleTableModal('edit')}>
                <IconFont type="innospot-icon-edit" className={styles.editIcon} />
              </span>
            </Col>
          )
        }
      </Row>
      { getTableModal() }
    </div>
  );
})

export default DataTableSelect
