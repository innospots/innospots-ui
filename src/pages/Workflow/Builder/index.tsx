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

import React, {useRef, useState} from 'react';
import {useModel} from 'umi';
import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';

import Canvas from './components/Canvas/Canvas';
import PageHeader from './components/Header';

import useI18n from '@/common/hooks/useI18n';
import PageHelmet from '@/components/PageHelmet';

import styles from './index.less';

const Page = ({location}) => {
  const canvasRef = useRef<any>();
  const {t} = useI18n(['workflow', 'common']);

  const [nodeChange, setNodeChange] = useState(false);
  const [flowInstance, setFlowInstance] = useState<any>({});

  const {instanceId: workflowInstanceId} = location.query;
  const {
    publishBuilderRequest,
    saveBuilderDraftRequest
  } = useModel('Builder');
  const {workflow, saveWorkflowRequest} = useModel('Workflow');

  const saveWorkflowInfo = (values: any) => {
    saveWorkflowRequest.run('edit', {
      ...workflow,
      ...values
    });
  };

  const handleHeaderClick = (type, values) => {
    switch (type) {
      case 'save':
        canvasRef.current?.saveFlowInstance();
        saveWorkflowInfo(values);
        break;

      case 'publish':
        canvasRef.current?.publishFlowInstance();
        break;
    }
  };

  const saveLoading = saveBuilderDraftRequest.loading;
  const publishLoading = publishBuilderRequest.loading;

  return (
    <div className={styles.wrapper}>
      <span id="workflow-form-modal" style={{position: 'relative', zIndex: 1001}}/>
      <PageHelmet title={t('workflow.builder.page.title')}/>
      <PageHeader
        detail={workflow}
        saveButton={{
          loading: saveLoading,
          disabled: saveLoading
        }}
        publishButton={{
          loading: publishLoading,
          disabled: !!(publishLoading || nodeChange || !flowInstance?.workflowInstanceId)
        }}
        onClick={handleHeaderClick}
      />
      <div className={styles.content}>
        <Canvas
          ref={canvasRef}
          workflowInstanceId={workflowInstanceId}
          onNodeChange={isChange => setNodeChange(isChange)}
          onGetFlowInstance={instance => setFlowInstance(instance || {})}
        />
      </div>
    </div>
  );
};

export default Page;
