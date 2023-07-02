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

import React, {useRef, useContext, useState, forwardRef, useImperativeHandle} from 'react';
import cls from 'classnames';
import { useForm } from 'form-render';

// import CustomFormRender from '@/pages/Workflow/Builder/components/CustomFormRender';
import ConfigFormRender from '@/pages/Workflow/Builder/components/NodeDataConfig/ConfigFormRender';

import DataContext from '../../../DataContext';
import NavTabs from '../../../components/NavTabs';

import InputData from './InputData';

import styles from './style.less';

const CodeConfig = forwardRef((props, ref) => {
  const form = useRef<{
    validateFields: () => any
  }>();
  const { appValue } = useContext(DataContext);
  const [tabKey, setTabKey] = useState('param');

  useImperativeHandle(ref, () => ({
    validateFields: () => new Promise((resolve, reject) => {
      form.current?.validateFields().then(values => {
        resolve(values)
      }).catch(errorInfo => reject(errorInfo))
    }),
  }));


  const renderForms = () => {
    return (
      <div
        className={cls(styles.content, 'custom-scrollbar')}
        style={{display: tabKey === 'param' ? '' : 'none'}}
      >
        <div className={styles.inner}>
          <ConfigFormRender
            ref={form}
            nodeId={appValue.nodeId}
            schema={appValue.config}
            appData={appValue}
          />
        </div>
      </div>
    )
  }

  const renderInputData = () => {
    return (
      <div
        style={{display: tabKey === 'input' ? '' : 'none'}}
        className={cls(styles.content, 'custom-scrollbar')}
      >
        <div className={styles.inner}>
          <InputData />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <NavTabs
          activeKey={tabKey}
          items={[{
            key: 'param',
            label: '配置参数'
          }, {
            key: 'input',
            label: '输入数据'
          }]}
          onChange={setTabKey}
        />
      </div>
      { renderForms() }
      { renderInputData() }
    </div>
  )
})

export default CodeConfig;