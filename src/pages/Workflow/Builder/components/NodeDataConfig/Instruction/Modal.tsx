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

import React from 'react';
import {Button} from 'antd';

import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';
import useI18n from '@/common/hooks/useI18n';

import CustomReactMarkdown from '@/components/CustomReactMarkdown';

export const MODAL_NAME = 'InstructionModal';

const InstructionModal:React.FC<{
  value: string
}> = ({ value }) => {

  const { t } = useI18n(['common']);
  const [modal, modalInfo] = useModal(MODAL_NAME);

  return (
    <NiceModal
      width={1000}
      destroyOnClose
      title={t(`common.tooltip.instructions`)}
      style={{ top: 20 }}
      visible={modalInfo.visible}
      onCancel={modal.hide}
      footer={(
        <Button onClick={modal.hide}>{t('common.button.close')}</Button>
      )}
    >
      <CustomReactMarkdown value={value} />
    </NiceModal>
  )
}

export default InstructionModal;