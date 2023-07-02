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

import { useState } from 'react';
import _ from 'lodash';

import { KeyValues, HandleType } from '@/common/types/Types';

export type ModalInfoType = {
  visible?: boolean;
  modalType?: HandleType;
  initValues?: KeyValues;
};

export type ModalMapType = {
  [key: string]: ModalInfoType;
};

const cache = {};

export default () => {
  const [modalMap, setModalMap] = useState<ModalMapType>({});

  const updateModalInfo = (name: string, props: ModalInfoType) => {
    modalMap[name] = {
      ...modalMap[name],
      ...props,
    };

    setModalMap({
      ...modalMap,
    });
  };

  const getModalInfo = (name: string) => modalMap[name] || {};

  const getModal = (name: string) => {
    if (!cache[name]) {
      cache[name] = {
        show: (props?: KeyValues | HandleType) => {
          if (_.isString(props)) {
            props = {
              modalType: props,
            };
          } else if (props && !props.modalType) {
            props = {
              modalType: 'edit',
              initValues: props,
            };
          }

          const info: ModalInfoType = {
            modalType: 'add',
            initValues: {},
            ...props,
          };

          updateModalInfo(name, {
            ...info,
            visible: true,
          });
        },

        hide: () => {
          updateModalInfo(name, {
            visible: false,
            initValues: {},
          });
        },
      };
    }

    return cache[name];
  };

  return {
    modalMap,
    setModalMap,

    getModal,
    getModalInfo,
    updateModalInfo,
  };
};
