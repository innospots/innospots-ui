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

import _ from 'lodash';
import { Graph } from '@antv/x6';
import { SnapshotNode } from '@/pages/Workflow/Builder/Graph/shape/node';
import { getEdgeAttrs } from '@/pages/Workflow/Builder/Graph/shape/edge';

const edgeAttrs = getEdgeAttrs('#b6c7dd');

export default class SnapshotGraph {
  private node: any;
  private graph: any;
  private options: any;

  constructor(options) {
    this.options = options;
    this.createGraph();
  }

  createGraph() {
    this.graph = new Graph({
      panning: false,
      interacting: {
        nodeMovable: false,
        edgeMovable: false,
        edgeLabelMovable: false,
        arrowheadMovable: false,
        magnetConnectable: false
      },
      ...this.options
    });
    return this.graph;
  }

  createFlowNode(options) {
    // @ts-ignore
    const node = this.node = new SnapshotNode(options);
    this.graph.addNode(node);
    this.graph.centerContent();

    return node;
  }

  updateNodeEdges(inPorts, outPorts) {
    const groups = {
      'in': inPorts,
      'out': outPorts
    };
    const node = this.node;
    const graph = this.graph;

    node.removePorts();

    let newPorts = [];

    _.each(groups, (ports, group) => {
      const ps = _.map(ports, p => ({ id: p.id, group}));
      // @ts-ignore
      newPorts = newPorts.concat(ps);
    })

    node.addPorts(newPorts);

    const nodeSize = node.getSize();
    const nodePosition = node.position();
    const startY = nodePosition.y;
    const inPortStep = (nodeSize.height / (inPorts.length || 1)) / 2;
    const outPortStep = (nodeSize.height / (outPorts.length || 1)) / 2;

    _.each(inPorts, (port, index: number) => {
      const n: number = index + 1;

      graph.addEdge({
        source: { x: nodePosition.x - 60, y: startY + n * inPortStep + index * inPortStep },
        target: {
          cell: node,
          port: port.id
        },
        labels: [ port.label || '' ],
        ...edgeAttrs
      })
    })

    _.each(outPorts, (port, index: number) => {
      const n: number = index + 1;

      graph.addEdge({
        source: {
          cell: node,
          port: port.id
        },
        target: { x: nodePosition.x + nodeSize.width + 60, y: startY + n * outPortStep + index * outPortStep },
        labels: [ port.label || '' ],
        ...edgeAttrs
      })
    })
  }
}