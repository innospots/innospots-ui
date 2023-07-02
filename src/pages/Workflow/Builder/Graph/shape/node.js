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

import {Graph} from '@antv/x6';
import '@antv/x6-react-shape';

import NodeComponent from '../../components/Node';
import StencilNodeComponent from '../../components/StencilNode';

import {POINT_COLOR} from '../../common/constants';

Graph.unregisterReactComponent('flow-node-component');

Graph.registerReactComponent('flow-node-component', (node) => {
  return <NodeComponent/>;
});

Graph.unregisterReactComponent('stencil-node-component');

Graph.registerReactComponent('stencil-node-component', (node) => {
  return <StencilNodeComponent/>;
});

const portGroup = {
  in: {
    zIndex: 10, position: {
      name: 'left', args: {
        // dy: -15
      },
    }, attrs: {
      circle: {
        r: 5.5, opacity: 0, magnet: true, strokeWidth: 0,
      },
    },
  },

  vin: {
    zIndex: 10, position: {
      name: 'left', args: {
        // dy: -15
      },
    }, attrs: {
      circle: {
        r: 4, magnet: true, strokeWidth: 0, fill: POINT_COLOR,
      },
    },
  },

  out: {
    zIndex: 10, position: {
      name: 'right', args: {
        // dy: -15,
        strict: true,
      },
    }, attrs: {
      circle: {
        r: 4, magnet: true, strokeWidth: 0, fill: POINT_COLOR,
      },
    },
  },
};

const snapshotPortGroup = {
  in: {
    zIndex: 10,
    position: {
      name: 'left',
      args: {
        // dy: -15
      },
    },
    attrs: {
      circle: {
        r: 4, magnet: true, strokeWidth: 0, fill: '#b6c7dd',
      },
    },
  },

  out: {
    zIndex: 10, position: {
      name: 'right', args: {
        // dy: -15,
        strict: true,
      },
    }, attrs: {
      circle: {
        r: 4, magnet: true, strokeWidth: 0, fill: '#b6c7dd',
      },
    },
  },
};

Graph.unregisterNode('stencil-flow-node');

export const StencilFlowNode = Graph.registerNode('stencil-flow-node', {
  inherit: 'react-shape',

  width: 78,
  height: 100,

  component: 'stencil-node-component',
});

Graph.unregisterNode('flow-node');

export const FlowNode = Graph.registerNode('flow-node', {
  inherit: 'react-shape',

  width: 66,
  height: 66,

  ports: {
    groups: portGroup,
  },

  propHooks (metadata) {
    return metadata;
  },

  component: 'flow-node-component',
});

Graph.unregisterNode('snapshot-node');

export const SnapshotNode = Graph.registerNode('snapshot-node', {
  inherit: 'react-shape',

  width: 66,
  height: 66,

  ports: {
    groups: snapshotPortGroup,
  },

  propHooks (metadata) {
    return metadata;
  },

  component: 'flow-node-component',
});
