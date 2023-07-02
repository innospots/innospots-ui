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
import { createFromIconfontCN } from '@ant-design/icons';
import {Image} from 'antd';
import _ from 'lodash';

import {formatImagePath} from '@/common/utils';

import styles from './index.less';

//https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=2511846
const NodeIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2511846_2yqi0vs7069.js',
});

export const renderNodeIcon = (nodeInfo) => {
  const icon = nodeInfo.icon || '';
  const isImg = /^\/image/i.test(icon) || /^\//.test(icon) || /^data:image\//.test(icon);
  const isStringIcon = _.isString(icon);

  if (!isStringIcon) {
    return icon;
  }

  if (!icon) {
    return (
      <DefaultNodeIcon name={nodeInfo.name} />
    )
  }

  if (isImg) {
    return (
      <div className="node-image-icon">
        <Image height="100%" alt={nodeInfo.code} src={formatImagePath(icon)} preview={false} />
      </div>
    );
  }

  return (
    <NodeIcon
      type={`flow-node-${icon}`}
      className="node-icon"
    />
  );
}

export const DefaultNodeIcon = ({ name }) => {

  return (
    <span className={styles.nodeIcon}>{ (name || '').toUpperCase().charAt(0) }</span>
  )
}

export default NodeIcon;