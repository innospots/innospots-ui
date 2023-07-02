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

import { Avatar, AvatarProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import cls from 'classnames';

import styles from './style.less';

export type NiceAvatarProps = {
  label?: string;
  length?: number;
  upperCase?: boolean;
};

const NiceAvatar: React.FC<NiceAvatarProps & AvatarProps> = (props) => {
  const { label, length = 3, upperCase = true, ...rest } = props;

  if (!rest.src && !rest.icon) {
    rest.icon ??= <UserOutlined />;
  }

  // if (label || !rest.icon) {
  //     content = label?.substr(0, length);
  //     if (upperCase && content) {
  //         content = (
  //             <div className={styles.label}>{ content.toUpperCase() }</div>
  //         );
  //     }
  // }

  return <Avatar {...rest} className={cls(styles.icon, rest.className)} />;
};

export default NiceAvatar;
