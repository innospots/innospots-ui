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
import _ from 'lodash';

import {renderNodeIcon} from '../NodeIcon';

import styles from './index.less';

const Node = ({node}) => {
  const nodeInfo = _.get(node, 'data', {});

  return (
    <div className={styles.nodeWrapper}>
      <div className={styles.nodeInner}>
        {renderNodeIcon(nodeInfo)}
      </div>
      <div className={styles.nodeName}>{nodeInfo.displayName || nodeInfo.name}</div>
    </div>
  );
};

export default React.memo(Node);
