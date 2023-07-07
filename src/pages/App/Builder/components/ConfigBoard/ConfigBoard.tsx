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

import React, {useRef, useMemo, useEffect, useState, useCallback, useContext} from 'react';
import Generator from 'fr-generator';
import {RedoOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {Modal, message} from 'antd';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import { useDeepCompareEffect } from 'ahooks';

import * as Widgets from '@/pages/Workflow/Builder/components/NodeDataConfig/Widgets/widgets';
import CustomSwitch from '@/pages/Workflow/Builder/components/NodeDataConfig/Widgets/CustomSwitch';
import FormContext from '@/pages/Workflow/Builder/components/NodeDataConfig/Widgets/FormContext';

import getDefaultSchema from './settings/defaultSchema';
import DataContext from '../../DataContext';

import styles from './style.less';

const WidgetList: any = {
  ...Widgets
};

WidgetList.switch = CustomSwitch;

const ConfigBoard:React.FC = () => {
  const { setFormSchema } = useModel('App', model => ({
    setFormSchema: model.setFormSchema,
  }));
  const { appValue, appDetail, onAppValueChange } = useContext(DataContext);

  const schemaRef = useRef(null);
  const generatorRef = useRef<any>(null);
  const [ setting, setSetting ] = useState<any>({});

  const formSchema = useMemo(() => appValue.config, []);

  useDeepCompareEffect(() => {
    if (schemaRef.current !== appValue.config) {
      schemaRef.current = {
        ...appValue.config
      };
      setFormSchema(schemaRef.current)
    }
  }, [ appValue.config, schemaRef.current ]);

  useEffect(() => {
    const settings = require('./settings/zh-CN/index');
    setSetting(settings);
  }, []);

  const updateFormSchema = _.debounce((schema) => {
    appValue.config = schema;
    // schemaRef.current = schema;
    onAppValueChange(appValue)
  }, 200);

  const handleSchemaChange = (schema) => {
    _.each(schema?.properties, schemaItem => {
      if (schemaItem.widget === 'AuthSelect' && !schemaItem.nodeId) {
        schemaItem.nodeId = appDetail?.nodeId;
      }
    })

    updateFormSchema(schema);
  }

  const handleDataChange = useCallback((data) => {
  }, [])

  const getDeleteProps = (formData) => {
    const canDelete = (formData?.canDelete !== false);

    if (!canDelete) {
      message.error('不能删除默认组件');
    }

    return canDelete;
  }

  const fieldWrapperRender = (schema, isSelected, children, originNode) => {
    return React.cloneElement(originNode, {
      className: cls(originNode.props.className, styles.fieldWrapper, {
        [styles.isDefault]: schema.isDefault
      })
    })
  }

  const resetFormSchema = () => {
    Modal.confirm({
      title: '重置表单',
      icon: <ExclamationCircleOutlined />,
      content: '重置表单将使数据丢失！是否需要重置？',
      onOk() {
        appValue.config = getDefaultSchema(appValue.connectorName, appDetail?.primitive === 'trigger')
        onAppValueChange(appValue);
      },
    });
  }

  return (
    <div className={styles.configBoard}>
      <div className={styles.resetButton} onClick={resetFormSchema}>
        <RedoOutlined />
        <span>重置表单</span>
      </div>
      <FormContext.Provider value={{
        appData: appDetail,
        formValues: {},
        initialValues: {},
        errorFields: [],
        viewType: 'config'
      }}>
        <Generator
          ref={generatorRef}
          widgets={WidgetList}
          // mapping={Mapping}
          canDelete={getDeleteProps}
          settings={setting.default}
          defaultValue={formSchema}
          globalSettings={setting.globalSettings}
          extraButtons={[false, false, false, false]}
          commonSettings={setting.commonSettings}
          onChange={handleDataChange}
          onSchemaChange={handleSchemaChange}
          fieldWrapperRender={fieldWrapperRender}
        />
      </FormContext.Provider>
    </div>
  )
}

export default ConfigBoard;