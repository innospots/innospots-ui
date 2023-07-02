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
import { history } from 'umi';
import _ from 'lodash';
import cls from 'classnames';
import { Tooltip, PopconfirmProps, Popconfirm } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import InnoIcon from '@/components/Icons/InnoIcon';
import { usePermission, permissionWarning } from '@/components/PermissionSection';

import styles from './style.less';

export type IconButtonProps = {
  icon: string | React.ReactNode;
  href?: string;
  tooltip?: string;
  disabled?: boolean;
  permissions?: string;
  onClick?: () => void;
  popConfirm?: PopconfirmProps;
} & React.HTMLAttributes<any>;

const IconButton: React.FC<IconButtonProps> = (props) => {
  const { icon, href, tooltip, disabled, onClick, className, popConfirm, permissions, ...rest } =
    props;

  const { t } = useI18n(['common']);

  const [hasAuth] = usePermission(permissions);

  const handleClick = () => {
    if (disabled) return;

    if (!hasAuth) {
      permissionWarning({
        title: t('common.tips.title'),
        content: t('common.error_message.no_auth_warning'),
      });
      return;
    }

    if (href) {
      history.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  const renderIconButton = () => {
    return (
      <div
        className={cls(styles.iconButtonWrapper, className, {
          [styles.disabled]: disabled,
        })}
        onClick={handleClick}
        {...rest}
      >
        <div className={styles.iconButton}>
          {_.isString(icon) ? <InnoIcon type={icon} /> : icon}
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    return <Tooltip title={tooltip}>{rootNode}</Tooltip>;
  };

  const renderPopConfirm = () => {
    return (
      // @ts-ignore
      <Popconfirm {...popConfirm}>{rootNode}</Popconfirm>
    );
  };

  let rootNode = renderIconButton();

  if (tooltip && !disabled) {
    rootNode = renderTooltip();
  }

  if (popConfirm && hasAuth && !disabled) {
    rootNode = renderPopConfirm();
  }

  return rootNode;
};

export default IconButton;
