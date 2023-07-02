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

import React, { useRef, useEffect, useContext } from 'react';

import DataContext from '../../DataContext';
import SnapshotGraph from './graph';

import styles from './style.less';

const NodeSnapshot:React.FC = () => {
  const { appValue } = useContext(DataContext);

  const nodeRef = useRef<any>(null);
  const graphRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const { inPorts, outPorts } = appValue;

  useEffect(() => {
    if (!graphRef.current) {
      createGraph()
    }

    updateNodeData();
    updateNodeEdges();
  }, [ appValue, inPorts, outPorts, graphRef.current ]);

  const createGraph = () => {
    graphRef.current = new SnapshotGraph({
      container: containerRef.current
    });
  }

  const updateNodeEdges = () => {
    graphRef.current.updateNodeEdges(inPorts, outPorts)
  }

  const updateNodeData = () => {
    if (!nodeRef.current) {
      nodeRef.current = graphRef.current.createFlowNode({
        id: 'a11',
        data: appValue
      })
    } else {
      nodeRef.current.updateData(appValue)
    }
  }

  return (
    <div className={styles.snapshot}>
      <div ref={containerRef} style={{width: '100%', height: '100%'}} />
    </div>
  )
}

export default NodeSnapshot;