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

import React, {useRef, useMemo, useEffect, useState, useContext} from 'react';

import {Typography, Row, Col, Tooltip} from 'antd';
import {QuestionCircleOutlined} from '@ant-design/icons';

import _ from 'lodash';
import {useModel} from 'umi';
import {useDeepCompareEffect, useDebounceFn} from 'ahooks'

import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import LS from '@/common/utils/LocalStorage'

import CurContext from '../../common/context';
import NodeConfigModal from '../NodeConfigModal';

import ConfigPreview from './ConfigPreview';
import WidgetFormRender from './WidgetFormRender';
import InstructionModal, {MODAL_NAME} from './Instruction/Modal';

import styles from './index.less';

const SIZE_KEYS = {
  left: 'NODE_DATA_CONFIG_LEFT_SIZE',
  right: 'NODE_DATA_CONFIG_RIGHT_SIZE'
}

const {Title} = Typography;

const minSize = 480;
const maxSize = 560;
const modalWidth = 1300;
const SIZE_DATA = {
  left: {
    minSize,
    maxSize,
    initialSize: minSize
  },
  right: {
    minSize: modalWidth - maxSize,
    maxSize: modalWidth - minSize,
    initialSize: modalWidth - minSize
  }
};

const defaultPaneSize = {
  left: LS.get(SIZE_KEYS.left),
  right: LS.get(SIZE_KEYS.right)
}

const sizeKeys = ['formWidth', 'formMinWidth', 'formMaxWidth'];

const NodeDataConfig = ({visible, onClose}) => {
  const {node, nodeData, onChange, onExecute} = useContext(CurContext);
  const {
    formValues,
    updateFormValue,
    initAppResources
  } = useModel('AppEditor', model => ({
    formValues: model.formValues,
    updateFormValue: model.updateFormValue,
    initAppResources: model.initAppResources
  }));
  const {
    setNodeInfo,
    flowNodeConfigState
  } = useModel('FlowNode', model => ({
    setNodeInfo: model.setNodeInfo,
    flowNodeConfigState: model.flowNodeConfigState
  }));

  const configFormRef = useRef<any>();
  const [instructionModal] = useModal(MODAL_NAME);

  const [errorFields, setErrorFields] = useState([]);

  const {appInfoRequest, currentAppInfo, setCurrentAppInfo} = useModel('App', (model) => ({
    appInfoRequest: model.appInfoRequest,
    currentAppInfo: model.currentAppInfo,
    setCurrentAppInfo: model.setCurrentAppInfo
  }));

  const nodeInfo = _.cloneDeep(_.get(node, 'data', {}));

  const configData = nodeData.configData || {};
  const formConfig = configData.settings || {};
  const previewConfig = configData.executionPreview || {};

  const {t} = useI18n(['workflow', 'common']);

  const getAppInfo = async (nodeId) => {
    if (nodeId) {
      const result = await appInfoRequest.runAsync(nodeId);
      if (result) {
        setCurrentAppInfo(result);
      }
    }
  };

  useEffect(() => {
    setNodeInfo(configData);
    initAppResources(configData.resources)
  }, [configData.nodeId]);

  const curPosData = useMemo(() => {
    const dd: any = {};
    if (_.isUndefined(formConfig.position) && _.isUndefined(previewConfig.position)) {
      _.extend(dd, {
        left: {
          formConfig
        },
        right: {
          previewConfig
        }
      });
    } else {
      if (_.isUndefined(formConfig.position) && previewConfig.position) {
        if (previewConfig.position === 'left') {
          _.extend(dd, {
            left: {
              previewConfig
            },
            right: {
              formConfig
            }
          });
        } else {
          _.extend(dd, {
            left: {
              formConfig
            },
            right: {
              previewConfig
            }
          });
        }
      } else if (_.isUndefined(previewConfig.position) && formConfig.position) {
        if (formConfig.position === 'left') {
          _.extend(dd, {
            left: {
              formConfig
            },
            right: {
              previewConfig
            }
          });
        } else {
          _.extend(dd, {
            left: {
              previewConfig
            },
            right: {
              formConfig
            }
          });
        }
      } else {
        _.extend(dd, {
          [formConfig.position]: formConfig,
          [previewConfig.position]: previewConfig
        });
      }
    }

    const leftType = _.keys(dd.left)[0];
    const rightType = _.keys(dd.right)[0];

    const posData = {
      left: {
        type: leftType,
        ..._.pick(dd.left[leftType], sizeKeys)
      },
      right: {
        type: rightType,
        ..._.pick(dd.right[rightType], sizeKeys)
      }
    };

    return posData
  }, [formConfig, previewConfig]);

  const curSizeData = useMemo(() => {
    const isn = _.isUndefined
    const leftSize: any = curPosData.left;
    const rightSize: any = curPosData.right;
    const defLeftSize = SIZE_DATA.left;
    const defRightSize = SIZE_DATA.right;
    const sizeData = {
      left: {
        ...defLeftSize
      },
      right: {
        ...defRightSize
      }
    };

    if (!isn(leftSize.formWidth)) {
      sizeData.left.initialSize = leftSize.formWidth
    }

    if (!isn(leftSize.formMinWidth)) {
      sizeData.left.minSize = leftSize.formMinWidth
    }

    if (!isn(leftSize.formMaxWidth)) {
      sizeData.left.maxSize = leftSize.formMaxWidth
    }

    if (isn(leftSize.formWidth) && !isn(rightSize.formWidth)) {
      sizeData.left.initialSize = modalWidth - rightSize.formWidth;
    }

    if (isn(rightSize.formWidth) && !isn(leftSize.formWidth)) {
      sizeData.right.initialSize = modalWidth - leftSize.formWidth;
    }

    if (isn(leftSize.formMinWidth) && !isn(rightSize.formMaxWidth)) {
      sizeData.left.minSize = modalWidth - rightSize.formMaxWidth;
    }

    if (isn(rightSize.formMinWidth) && !isn(leftSize.formMaxWidth)) {
      sizeData.right.minSize = modalWidth - leftSize.formMaxWidth;
    }

    if (isn(leftSize.formMaxWidth) && !isn(rightSize.formMinWidth)) {
      sizeData.left.maxSize = modalWidth - rightSize.formMinWidth;
    }

    if (isn(rightSize.formMaxWidth) && !isn(leftSize.formMinWidth)) {
      sizeData.right.maxSize = modalWidth - leftSize.formMinWidth;
    }

    return sizeData;
  }, [curPosData]);

  const initialValues = useMemo(() => {
    return {
      ...nodeData.data,
      displayName: nodeData.displayName
    };
  }, [nodeData.data, nodeData.displayName]);

  useDeepCompareEffect(() => {
    formValues.currentValues = {
      ...formValues.initialValues,
      ...initialValues
    }
    updateFormValue()
  }, [initialValues])

  const validateFormValues = (success) => {
    const formInstance = flowNodeConfigState.formInstance
    if (!formInstance) return

    formInstance
      .validateFields()
      .then((values) => {
        if ('displayName' in values) {
          nodeInfo.displayName = values.displayName;
        }

        nodeInfo.data = values;

        if (_.isFunction(success)) {
          success(nodeInfo);
        }
      })
      .catch((errorInfo) => {
        setErrorFields(errorInfo.errorFields);
      });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }

    formValues.editValues = {}
    updateFormValue()
  };

  const handleSubmit = (testData) => {
    validateFormValues((nodeInfo) => {
      if (testData) {
        nodeInfo.data.webhook_config = testData;
      }
      if (onChange) {
        onChange(nodeInfo, {
          overwrite: true
        })
      }
      if (onClose) {
        onClose();
      }
    });
  };

  const handleExecute = (node, force, postData) => {
    validateFormValues((nodeInfo) => {
      if (onExecute) {
        onExecute(node, force, nodeInfo, postData);
      }
    });
  };

  const handleValuesChange = (changedValues) => {
    try {
      const changedKey = _.keys(changedValues)[0];
      const index = errorFields.findIndex((item) => item.name.includes(changedKey));
      if (index > -1) {
        errorFields.splice(index, 1);
        setErrorFields([...errorFields]);
      }
    } catch (e) {
    }
  };

  const getNumber = (s: string) => (
    // @ts-ignore
    s.replace(/px/, '') * 1
  )

  const updatePaneSize = useDebounceFn((sizes: string[]) => {
    const l = getNumber(sizes[0])
    const r = getNumber(sizes[1])
    LS.set(SIZE_KEYS.left, l)
    LS.set(SIZE_KEYS.right, r)
    defaultPaneSize.left = l
    defaultPaneSize.right = r
  }, {
    wait: 500
  })

  /**
   * 执行预览
   */
  const renderPreviewNode = () => {
    return (
      <ConfigPreview
        onClose={handleClose}
        onSubmit={handleSubmit}
        onExecute={handleExecute}
        configData={configData?.executionPreview}
      />
    );
  };

  const renderConfigForm = () => {
    if (!configData.config) {
      configData.config = {};
    }

    const instruction = configData.config.instruction;

    return (
      <div className={styles.configForm}>
        <Row align="middle" gutter={8}>
          <Col>
            <Title level={4}>{configData.name}</Title>
          </Col>
          {!!instruction && (
            <Col>
              <Tooltip title={t('common.tooltip.instructions')}>
                <QuestionCircleOutlined className={styles.qs} onClick={instructionModal.show}/>
              </Tooltip>
            </Col>
          )}
        </Row>
        <WidgetFormRender initialValues={initialValues}/>
        {!!instruction && <InstructionModal value={instruction}/>}
      </div>
    );
  };

  return (
    <NodeConfigModal open={visible} width={modalWidth} onCancel={handleClose}>
      {
        visible && (
          <SplitPane
            split="vertical"
            className="SplitPane"
            allowResize={!formConfig.isFixedWidth}
            onChange={updatePaneSize.run}
          >
            {_.map(['left', 'right'], (position) => {
              const sd = curSizeData[position];
              const cd = curPosData[position] || {};
              const ds = defaultPaneSize[position]
              let initialSize = cd.width || sd.initialSize

              if (ds) {
                if (position === 'left') {
                  initialSize = Math.max(ds, sd.minSize)
                } else {
                  initialSize = Math.min(ds, sd.maxSize)
                }
              }

              return (
                <Pane
                  key={`${position}-${cd.type}`}
                  minSize={`${cd.minWidth || sd.minSize}px`}
                  maxSize={`${cd.maxWidth || sd.maxSize}px`}
                  initialSize={`${initialSize}px`}
                  className={`Pane ${position} ${cd.type}`}
                >
                  {cd.type === 'formConfig' ? renderConfigForm() : renderPreviewNode()}
                </Pane>
              );
            })}
          </SplitPane>
        )
      }
    </NodeConfigModal>
  );
};

export default NodeDataConfig;
