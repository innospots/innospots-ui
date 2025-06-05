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

import { useModel } from 'umi';
import React, { useRef, useEffect } from 'react';

import SnapshotGraph from './graph';

import styles from './style.less';

const NodeSnapshot:React.FC = () => {
  const { nodeInfo, getNodePorts } = useModel('FlowNode', (model) => ({
    nodeInfo: model.nodeInfo,
    getNodePorts: model.getNodePorts
  }));

  const nodeRef = useRef<any>(null);
  const graphRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const updateNodeEdges = (inPorts, outPorts) => {
    graphRef.current.updateNodeEdges(inPorts, outPorts)
  }

  const updateNodeData = () => {
    if (!nodeRef.current) {
      nodeRef.current = graphRef.current.createFlowNode({
        id: 'a11',
        data: nodeInfo
      })
    } else {
      nodeRef.current.updateData(nodeInfo)
    }
  }

  const createGraph = () => {
    graphRef.current = new SnapshotGraph({
      container: containerRef.current
    });
  }

  useEffect(() => {
    if (!graphRef.current) {
      createGraph()
    }

    const inPorts = getNodePorts('inPorts');
    const outPorts = getNodePorts('outPorts');

    updateNodeData();
    updateNodeEdges(inPorts, outPorts);
  }, [ nodeInfo, graphRef.current ]);

  return (
    <div className={styles.snapshot}>
      <div ref={containerRef} style={{width: '100%', height: '100%'}} />
    </div>
  )
}

export default NodeSnapshot;