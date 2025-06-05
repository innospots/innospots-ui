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

import { useDeepCompareEffect } from 'ahooks';
import { Button, Col, Popconfirm, Row, Space, Tabs, Typography } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';

import useI18n from '@/common/hooks/useI18n';
import CurContext from '../../common/context';

import { getItemByType } from './ExecutionItems';

import styles from './ExecutionItems/index.less';

const { Title } = Typography;

const SchemaFields = {
  type: 'SchemaFields',
  label: '输出字段',
};

const DEFAULT_CONFIG_DATA = {
  enableExecute: true,
  elements: [
    {
      tabs: [
        'RESULT',
        'JSON',
        'LOG',
        'ATTACHMENT',
        {
          ...SchemaFields,
        },
      ],
    },
  ],
};

const ConfigPreview: React.FC<any> = (props) => {
  const {
    configData,
    confirmLoading,
    onExecute: onCustomExecute,
    onClose,
    onSubmit,
  } = props;
  const { node, nodeId, nodeData, onExecute, allExecuteData } =
    useContext(CurContext);

  const { workflowType, executeLoading, nodeExecutions, setNodeExecutions } =
    useModel('Builder', (model) => ({
      workflowType: model.workflowType,
      executeLoading: model.executeLoading,
      nodeExecutions: model.nodeExecutions,
      setNodeExecutions: model.setNodeExecutions,
    }));

  const [tabKey, setTabKey] = useState('RESULT');
  const [execution, setExecution] = useState<Record<string, any>>({});

  const isApprovalOrSchedule = useMemo(
    () => ['approval', 'job'].includes(workflowType),
    [workflowType],
  );

  useDeepCompareEffect(() => {
    const nodeExecutionId = allExecuteData?.[nodeId]?.nodeExecutionId;
    const executionData = nodeExecutions?.[nodeExecutionId] || {};
    if (!executionData.schemaFields?.length) {
      executionData.schemaFields = nodeData?.outputFields || [];
    }
    setExecution(executionData);
  }, [nodeId, nodeData, allExecuteData, nodeExecutions]);

  const { t } = useI18n(['workflow', 'common']);

  const testDataRef = useRef(null);
  const fieldsRef = useRef<any>({});

  useEffect(
    () => () => {
      testDataRef.current = null;
    },
    [],
  );

  const curConfigData = useMemo(() => {
    let defaultData = {};

    if (!isApprovalOrSchedule) {
      defaultData = {
        ...DEFAULT_CONFIG_DATA,
      };
    } else {
      defaultData = {
        enableExecute: true,
        elements: [
          {
            tabs: [
              {
                ...SchemaFields,
              },
            ],
          },
        ],
      };
    }
    if (!configData) {
      return {
        ...defaultData,
      };
    }

    return {
      ...defaultData,
      ...configData,
    };
  }, [configData, isApprovalOrSchedule]);

  useEffect(() => {
    if (isApprovalOrSchedule) {
      setTabKey('SchemaFields');
    }
  }, [isApprovalOrSchedule]);

  const configElements = useMemo(
    () => curConfigData.elements || [],
    [curConfigData.elements],
  );

  const formatDataTabs = (tabs: any[]): any[] => {
    return _.map(
      tabs,
      (
        item:
          | string
          | {
              id?: string | number;
              type: string;
              label?: string;
            },
      ) => {
        if (_.isString(item)) {
          return {
            id: item,
            type: item,
            label: t(`workflow.builder.execution.${item.toLowerCase()}`),
          };
        } else if (_.isObject(item)) {
          const id = item.id || item.type;
          return {
            ...item,
            id,
            label: item.label || t(`workflow.builder.execution.${id}`),
          };
        }
        return item;
      },
    );
  };

  const onPreviewRun = (postData?: any) => {
    if (onCustomExecute) {
      onCustomExecute(node, true, postData);
    } else {
      onExecute(node, true);
    }
  };

  const onDataChange = (testData?: any) => {
    testDataRef.current = testData;
  };

  const onResetSchemaFields = () => {
    if (execution.outputFields && execution.originFields.length > 0) {
      execution.schemaFields = execution.originFields;
      setExecution({
        ...execution,
      });
    }
  };

  /**
   * 将最新的输出字段覆盖到 instance 的schemaFields上
   */
  const onOverWriteSchemaFields = () => {
    execution.schemaFields = execution.outputFields;
    setExecution({
      ...execution,
    });
  };

  const onFieldsChange = (fields: any[]) => {
    fieldsRef.current[nodeId] = fields;
  };

  const onConfigSubmit = () => {
    if (fieldsRef.current[nodeId]) {
      const nodeExecutionId = allExecuteData?.[nodeId]?.nodeExecutionId;
      if (nodeExecutions[nodeExecutionId]) {
        nodeExecutions[nodeExecutionId].schemaFields =
          fieldsRef.current[nodeId];
        setNodeExecutions(nodeExecutions);
      }
    }
    onSubmit?.(testDataRef.current);
    testDataRef.current = null;
  };

  const footer = (
    <div className={styles.previewFooter}>
      <Button onClick={onClose} className="bordered" style={{ marginRight: 8 }}>
        {t('common.button.cancel')}
      </Button>
      <Button
        type="primary"
        onClick={onConfigSubmit}
        loading={confirmLoading}
        disabled={confirmLoading}
      >
        {t('common.button.confirm')}
      </Button>
    </div>
  );

  const renderPreviewContent = () => {
    return _.map(configElements, (elItem: any, index: number) => {
      if (_.isString(elItem)) {
        elItem = {
          type: elItem,
        };
      }

      // @ts-ignore
      if (_.isObject(elItem) && elItem && elItem?.type) {
        // @ts-ignore
        const elItemType = elItem.type;
        const ElItem = getItemByType(elItemType);
        return (
          ElItem && (
            <ElItem
              key={elItemType}
              executeData={execution}
              onExecute={onPreviewRun}
              onChange={onDataChange}
            />
          )
        );
      } else if (elItem.tabs) {
        return (
          <Tabs
            key={`c-${index}`}
            activeKey={tabKey}
            onChange={setTabKey}
            tabBarExtraContent={
              !isApprovalOrSchedule && (
                <Space>
                  {tabKey === 'SchemaFields' && (
                    <Popconfirm
                      title="是否重置到初始输出字段?"
                      okText="是"
                      cancelText="否"
                      onConfirm={onResetSchemaFields}
                    >
                      <Button size="small">重置</Button>
                    </Popconfirm>
                  )}
                  {tabKey === 'SchemaFields' && (
                    <Popconfirm
                      title="是否覆盖输出字段?"
                      okText="是"
                      cancelText="否"
                      onConfirm={onOverWriteSchemaFields}
                    >
                      <Button size="small">覆盖</Button>
                    </Popconfirm>
                  )}
                  {curConfigData.enableExecute && (
                    <Button
                      size="small"
                      color="cyan"
                      variant="solid"
                      loading={executeLoading}
                      disabled={executeLoading}
                      onClick={() => onPreviewRun()}
                    >
                      {t('common.button.run')}
                    </Button>
                  )}
                </Space>
              )
            }
            items={_.map(formatDataTabs(elItem.tabs), (item) => {
              const Content = getItemByType(item.type);

              return {
                key: item.id,
                label: item.label,
                children: Content && (
                  <Content
                    executeData={execution}
                    onFieldsChange={onFieldsChange}
                  />
                ),
              };
            })}
          />
        );
      }
    });
  };

  return (
    <div className={styles.previewNode}>
      <Row
        className={styles.previewHeader}
        justify="space-between"
        align="middle"
      >
        <Col>
          <Title level={5}>{t('workflow.builder.execution.preview')}</Title>
        </Col>
      </Row>
      <div
        className={cls(
          styles.previewContent,
          styles[`configEls${configElements.length}`],
        )}
      >
        {renderPreviewContent()}
      </div>
      {footer}
    </div>
  );
};

export default ConfigPreview;
