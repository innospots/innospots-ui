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

import { Modal } from 'antd';
import React, { useState, useEffect } from 'react';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'))

const CodeEditorModal: React.FC<Record<string, any>> = ({ code, visible, isViewInfo, codeType, editorProps, onSubmit, ...rest }) => {
  const { t } = useI18n(['workflow', 'common']);
  const [codeValue, setCodeValue] = useState('')

  useEffect(() => {
    if (visible) {
      setCodeValue(code)
    } else {
      setCodeValue('')
    }
  }, [ code, visible ])

  const saveCode = () => {
    if (onSubmit) {
      onSubmit(codeValue);
    }
  };

  const handleContentChange = (newValue: string) => {
    setCodeValue(newValue)
  }

  return (
    <Modal
      width={840}
      open={visible}
      title={t('workflow.script.button.edit')}
      maskClosable={false}
      onOk={saveCode}
      okButtonProps={{
        style: { display: isViewInfo ? 'none' : '' },
      }}
      {...rest}
    >
      <div className={styles.codeContainer}>
        {
          visible && (
            <AceCodeEditor
              mode={codeType}
              name="ModalCodeEditor"
              value={codeValue}
              readOnly={!!isViewInfo}
              placeholder={t('common.input.placeholder')}
              onChange={handleContentChange}
              {...(editorProps || {})}
            />
          )
        }
      </div>
    </Modal>
  );
};

export default React.memo(CodeEditorModal);
