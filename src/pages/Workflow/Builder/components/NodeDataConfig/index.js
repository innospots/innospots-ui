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
import { useModel } from 'umi';

import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import CurContext from '../../common/context';
import NodeConfigModal from '../NodeConfigModal';

import ConfigPreview from './ConfigPreview';
import ConfigFormRender from './ConfigFormRender';
import InstructionModal, { MODAL_NAME } from './Instruction/Modal'

import styles from './index.less';

const {Title} = Typography;

const minSize = 480;
const maxSize = 560;
const modalWidth = 1300;
const SIZE_DATA = {
  left: {
    minSize, maxSize, initialSize: minSize,
  }, right: {
    minSize: modalWidth - maxSize, maxSize: modalWidth - minSize, initialSize: modalWidth - minSize,
  },
};

const sizeKeys = ['width', 'minWidth', 'maxWidth'];

const NodeDataConfig = ({visible, onClose}) => {
  const {node, nodeData, onChange, onExecute} = useContext(CurContext);

  const configFormRef = useRef();
  const [instructionModal] = useModal(MODAL_NAME);

  const [errorFields, setErrorFields] = useState([]);

  const {
    appInfoRequest,
    currentAppInfo,
    setCurrentAppInfo
  } = useModel('App', model => ({
    appInfoRequest: model.appInfoRequest,
    currentAppInfo: model.currentAppInfo,
    setCurrentAppInfo: model.setCurrentAppInfo
  }));

  const nodeInfo = _.cloneDeep(_.get(node, 'data', {}));

  const configData = nodeData.configData || {};
  const formConfig = configData.config || {};
  const previewConfig = configData.executionPreview || {};

  const {t} = useI18n(['workflow', 'common']);

  useEffect(() => {
    getAppInfo(configData.nodeId)
  }, [ configData.nodeId ]);

  const getAppInfo = async (nodeId) => {
    if (nodeId) {
      const result = await appInfoRequest.runAsync(nodeId);
      if (result) {
        setCurrentAppInfo(result)
      }
    }
  }

  const curPosData = useMemo(() => {
    const dd = {};
    if (_.isUndefined(formConfig.position) && _.isUndefined(previewConfig.position)) {
      _.extend(dd, {
        left: {
          formConfig,
        }, right: {
          previewConfig,
        },
      });
    } else {
      if (_.isUndefined(formConfig.position) && previewConfig.position) {
        if (previewConfig.position === 'left') {
          _.extend(dd, {
            left: {
              previewConfig,
            }, right: {
              formConfig,
            },
          });
        } else {
          _.extend(dd, {
            left: {
              formConfig,
            }, right: {
              previewConfig,
            },
          });
        }
      } else if (_.isUndefined(previewConfig.position) && formConfig.position) {
        if (formConfig.position === 'left') {
          _.extend(dd, {
            left: {
              formConfig,
            }, right: {
              previewConfig,
            },
          });
        } else {
          _.extend(dd, {
            left: {
              previewConfig,
            }, right: {
              formConfig,
            },
          });
        }
      } else {
        _.extend(dd, {
          [formConfig.position]: formConfig, [previewConfig.position]: previewConfig,
        });
      }
    }

    const leftType = _.keys(dd.left)[0];
    const rightType = _.keys(dd.right)[0];

    return {
      left: {
        type: leftType, ..._.pick(dd.left[leftType], sizeKeys),
      }, right: {
        type: rightType, ..._.pick(dd.right[rightType], sizeKeys),
      },
    };
  }, [formConfig, previewConfig]);

  const curSizeData = useMemo(() => {
    const leftSize = curPosData.left;
    const rightSize = curPosData.right;
    const defLeftSize = SIZE_DATA.left;
    const defRightSize = SIZE_DATA.right;
    const sizeData = {
      left: {
        ...defLeftSize,
      }, right: {
        ...defRightSize,
      },
    };

    if (_.isUndefined(leftSize.width) && !_.isUndefined(rightSize.width)) {
      sizeData.left.initialSize = modalWidth - rightSize.width;
    }

    if (_.isUndefined(rightSize.width) && !_.isUndefined(leftSize.width)) {
      sizeData.right.initialSize = modalWidth - leftSize.width;
    }

    if (_.isUndefined(leftSize.minWidth) && !_.isUndefined(rightSize.maxWidth)) {
      sizeData.left.minSize = modalWidth - rightSize.maxWidth;
    }

    if (_.isUndefined(rightSize.minWidth) && !_.isUndefined(leftSize.maxWidth)) {
      sizeData.right.minSize = modalWidth - leftSize.maxWidth;
    }

    if (_.isUndefined(leftSize.maxWidth) && !_.isUndefined(rightSize.minWidth)) {
      sizeData.left.maxSize = modalWidth - rightSize.minWidth;
    }

    if (_.isUndefined(rightSize.maxWidth) && !_.isUndefined(leftSize.minWidth)) {
      sizeData.right.maxSize = modalWidth - leftSize.minWidth;
    }

    return sizeData;
  }, [curPosData]);

  const initialValues = useMemo(() => {
    return {
      ...nodeData.data, displayName: nodeData.displayName,
    };
  }, [nodeData.data, nodeData.displayName]);

  const validateFormValues = (success) => {
    configFormRef.current.validateFields().then((values) => {
      if ('displayName' in values) {
        nodeInfo.displayName = values.displayName;
      }

      nodeInfo.data = values;

      if (_.isFunction(success)) {
        success(nodeInfo);
      }
    }).catch((errorInfo) => {
      setErrorFields(errorInfo.errorFields);
    });
  };

  const handleClose = () => {
    onClose && onClose();
  };

  const handleSubmit = () => {
    validateFormValues((nodeInfo) => {
      onChange && onChange(nodeInfo, {
        overwrite: true,
      });
      onClose && onClose();
    });
  };

  const handleExecute = (node, force, postData) => {
    validateFormValues((nodeInfo) => {
      onExecute && onExecute(node, force, nodeInfo, postData);
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
          {
            !!instruction && (
              <Col>
                <Tooltip title={t('common.tooltip.instructions')}>
                  <QuestionCircleOutlined
                    className={styles.qs}
                    onClick={instructionModal.show}
                  />
                </Tooltip>
              </Col>
            )
          }
        </Row>
        <ConfigFormRender
          viewType="config"
          ref={configFormRef}
          appData={currentAppInfo}
          errorFields={errorFields}
          {...configData}
          schema={configData.config}
          initialValues={initialValues}
          onValuesChange={handleValuesChange}
        />
        { !!instruction && <InstructionModal value={instruction}/> }
      </div>
    );
  };

  return (
    <NodeConfigModal open={visible} width={modalWidth} onCancel={handleClose}>
      <SplitPane split="vertical" className="SplitPane">
        {_.map(['left', 'right'], (position) => {
          const sd = curSizeData[position];
          const cd = curPosData[position] || {};

          return (
            <Pane
              key={`${position}-${cd.type}`}
              minSize={`${cd.minWidth || sd.minSize}px`}
              maxSize={`${cd.maxWidth || sd.maxSize}px`}
              initialSize={`${cd.width || sd.initialSize}px`}
              className={`Pane ${position} ${cd.type}`}
            >
              {cd.type === 'formConfig' ? renderConfigForm() : renderPreviewNode()}
            </Pane>
          );
        })}
      </SplitPane>
    </NodeConfigModal>
  );
};

export default NodeDataConfig;
