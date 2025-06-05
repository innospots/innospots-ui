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

import { useRef, useState } from 'react';
import { useUpdateEffect } from 'ahooks';
import { history, useModel, useParams, useSearchParams } from 'umi';
import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';

import Canvas from './components/Canvas/Canvas';
import PageHeader from './components/Header';

import useI18n from '@/common/hooks/useI18n';
import PageHelmet from '@/components/PageHelmet';
import PageLoading from '@/components/PageLoading';

import styles from './index.less';

const Page = () => {
  const canvasRef = useRef<any>();
  const { t, loading: i18nLoading } = useI18n(['workflow', 'common']);

  const [dataLoading, setDataLoading] = useState(true);

  const { workflowType } = useParams<{ workflowType: string }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [nodeChange, setNodeChange] = useState(false);
  const [flowInstance, setFlowInstance] = useState<any>({});

  const workflowInstanceId = searchParams.get('instanceId');
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const mode = searchParams.get('mode');

  const pageMode = mode || 'preview';
  const { publishBuilderRequest, saveBuilderDraftRequest, fetchWorkflowBuilderRequest } = useModel('Builder', (model) => ({
    publishBuilderRequest: model.publishBuilderRequest,
    saveBuilderDraftRequest: model.saveBuilderDraftRequest,
    fetchWorkflowBuilderRequest: model.fetchWorkflowBuilderRequest,
  }));
  const { workflow, saveWorkflowRequest } = useModel('Workflow', (model) => ({
    workflow: model.workflow,
    saveWorkflowRequest: model.saveWorkflowRequest,
  }));

  useUpdateEffect(() => {
    setDataLoading(fetchWorkflowBuilderRequest.loading);
  }, [fetchWorkflowBuilderRequest.loading]);

  const saveWorkflowInfo = (values: any) => {
    saveWorkflowRequest.run(workflowType, 'edit', {
      ...workflow,
      ...values,
    });
  };

  const changePageMode = (mode: 'preview' | 'edit') => {
    setDataLoading(true);
    setSearchParams({
      mode,
      page: page || '',
      size: size || '',
      instanceId: workflowInstanceId || '',
    });
  };

  const handleHeaderClick = (type, values) => {
    switch (type) {
      case 'save':
        canvasRef.current?.saveFlowInstance();
        saveWorkflowInfo(values);
        break;

      case 'edit':
        changePageMode('edit');
        break;

      case 'cancel':
        changePageMode('preview');
        break;

      case 'publish':
        canvasRef.current?.publishFlowInstance();
        break;

      case 'pageBack':
        const query = {
          page,
          size,
          category: workflow.categoryId,
        };
        history.replace({ pathname: `/workflow/${workflowType}`, query });
        break;
    }
  };

  const saveLoading = saveBuilderDraftRequest.loading;
  const publishLoading = publishBuilderRequest.loading;

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div className={styles.wrapper}>
      <span id="workflow-form-modal" style={{ position: 'relative', zIndex: 1001 }} />
      <PageHelmet title={t('workflow.builder.page.title')} />
      <PageHeader
        mode={pageMode}
        detail={workflow}
        dataLoading={dataLoading}
        saveButton={{
          loading: saveLoading,
          disabled: saveLoading,
        }}
        publishButton={{
          loading: publishLoading,
          disabled: !!(publishLoading || nodeChange || !flowInstance?.workflowInstanceId),
        }}
        onClick={handleHeaderClick}
      />
      <div className={styles.content}>
        <Canvas
          ref={canvasRef}
          key={pageMode}
          mode={pageMode}
          workflowInstanceId={workflowInstanceId}
          onNodeChange={(isChange) => setNodeChange(isChange)}
          onGetFlowInstance={(instance) => setFlowInstance(instance || {})}
          onMounted={() => setDataLoading(false)}
        />
      </div>
    </div>
  );
};

export default Page;
