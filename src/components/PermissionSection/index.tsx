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

import React, { useMemo } from 'react';
import { useModel } from 'umi';
import _ from 'lodash';
import { Modal } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import { IS_DEV } from '@/common/constants';

const IS_DEBUG = IS_DEV;

export const permissionWarning = (data: { title?: string; content: string }) => {
  Modal.warning(data);
};

export const usePermission = (itemKey?: string | string[]) => {
  const allMenuOpts = useModel('Menu', (model) => model.allMenuOpts);
  const hasAuth = useMemo(() => {
    if (!itemKey) return true;

    const keys = !_.isArray(itemKey) ? [itemKey] : itemKey;

    return IS_DEBUG || !!_.find(allMenuOpts, (o: { itemKey: string }) => keys.includes(o.itemKey));
  }, [itemKey, allMenuOpts]);

  return [hasAuth];
};

type PermissionType = {
  itemKey?: string | string[];
}

const PermissionSection: React.FC<PermissionType> = ({ itemKey, children }) => {
  const allMenuOpts = useModel('Menu', (model) => model.allMenuOpts);

  const { t } = useI18n(['common']);

  const hasAuth = useMemo(() => {
    if (!itemKey) return true;

    const keys = !_.isArray(itemKey) ? [itemKey] : itemKey;

    return IS_DEBUG || !!_.find(allMenuOpts, (o: { itemKey: string }) => keys.includes(o.itemKey));
  }, [itemKey, allMenuOpts]);

  const handleNoAuthClicked = (e) => {
    permissionWarning({
      title: t('common.tips.title'),
      content: t('common.error_message.no_auth_warning'),
    });
  };

  if (!hasAuth) {
    return (
      <>
        {
          React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement, {
              onClick: handleNoAuthClicked,
            }),
          )
        }
      </>
    );
  }

  return hasAuth && <React.Fragment>{children}</React.Fragment>;
};

export default PermissionSection;
