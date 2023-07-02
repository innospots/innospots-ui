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

import { Modal, ModalProps } from 'antd';
import cls from 'classnames';

import { HandleType } from '@/common/types/Types';

import styles from './style.less';

export type ModalType = HandleType;

interface Props {
  type?: ModalType;
  simple?: boolean;
  initValues?: null | any;
  onSuccess?: (type?: ModalType, result?: any) => void;
}

export type NiceModalProps = Props & ModalProps;

export type NiceModalFC = {
  MODAL_NAME?: string;
};

const NiceModal: React.FC<NiceModalProps> = ({ children, simple, visible, ...rest }) => {
  return (
    <Modal
      destroyOnClose
      open={visible}
      keyboard={false}
      maskClosable={false}
      {...rest}
      wrapClassName={cls(
        styles.niceModal,
        {
          [styles.simple]: simple,
        },
        rest.wrapClassName,
      )}
    >
      {children}
    </Modal>
  );
};

export default NiceModal;
