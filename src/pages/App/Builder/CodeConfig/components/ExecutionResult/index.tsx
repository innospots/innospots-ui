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

import { getItemByType } from '@/pages/Workflow/Builder/components/NodeDataConfig/ExecutionItems';

import styles from './style.less';

const ExecutionResult:React.FC<{
  itemType?: string
  executeData?: Record<string, any>
}> = ({ itemType, executeData }) => {

  const RenderElement = useMemo(() => {
    return getItemByType(itemType || 'log')
  }, [ itemType ])

  return (
    <div className={styles.container}>
      <RenderElement executeData={executeData} />
    </div>
  )
}

export default ExecutionResult;