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
import { Tag } from 'antd';

import useI18n from '@/common/hooks/useI18n';
import { transform } from '@/common/utils/I18nMap';

import styles from './style.less';

export const STATUS_TAG_COLORS = {
  ONLINE: {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  OFFLINE: {
    color: '#959EAD',
    bgColor: '#E9EDF1',
  },
  SUCCESS: {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  FAILURE: {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
};

export type Status = 'ONLINE' | 'OFFLINE' | 'SUCCESS' | 'FAILURE';

export type StatusTagProps = {
  status: Status;
  onClick?: () => void;
};

const StatusTag: React.FC<StatusTagProps> = (props) => {
  const { status, onClick } = props;

  const { t } = useI18n('common');
  const colors = STATUS_TAG_COLORS[status] || {};

  if (status) {
    return (
      <Tag
        color={colors.bgColor}
        style={{
          color: colors.color,
          cursor: onClick ? 'pointer' : 'default',
        }}
        className={styles.tag}
        onClick={onClick}
      >
        {t(`common.options.${transform(status)}`)}
      </Tag>
    );
  }

  return null;
};

export default StatusTag;
