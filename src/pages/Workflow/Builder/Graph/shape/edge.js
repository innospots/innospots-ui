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

import { Graph, Shape } from '@antv/x6';

import { EDGE_COLOR, STRESS_COLOR, EDGE_ACTIVE_COLOR } from '../../common/constants';

export const getEdgeAttrs = (stroke = EDGE_COLOR) => {
    return {
        attrs: {
            line: {
                stroke,
                strokeWidth: 1.5,
                targetMarker: {
                    name: 'block',
                    width: 8,
                    height: 8,
                },
            },
        },
        zIndex: 0,
        router: {
            name: 'normal',
        },
        connector: {
            name: 'smooth',
            args: {
                direction: 'H',
            },
        },
    };
};

export const getConditionLabel = (type, text) => {
    if (!text) {
        text = type === 'satisfy-out' ? '满足' : '不满足';
    }

    return {
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'label',
            },
        ],
        position: {
            distance: 0.8,
        },
        attrs: {
            label: {
                text,
            },
            rect: {
                ref: 'label',
                fill: '#fff',
                rx: 3,
                ry: 3,
                refWidth: 1,
                refHeight: 1,
                refX: 0,
                refY: 0,
            },
        },
    };
};

export const getLabelData = (type, text) => {
    return {
        attrs: {
            text: {
                text: text || '',
            },
        },
        position: {
            distance: type === 'out' ? -50 : 50,
            options: {
                keepGradient: true,
                ensureLegibility: true,
                absoluteDistance: true,
            },
        },
    };
};

export class FlowEdge extends Shape.Edge {
    leaveItem() {
        this.setAttrs({
            line: {
                strokeWidth: 2,
                stroke: EDGE_COLOR,
                targetMarker: {
                    width: 6,
                    height: 10,
                },
            },
        });
        this.removeTools();
    }
    enterItem() {
        this.setAttrs({
            line: {
                strokeWidth: 3,
                stroke: EDGE_ACTIVE_COLOR,
                targetMarker: {
                    width: 8,
                    height: 12,
                },
            },
        });
        this.setTools([
            {
                name: 'button-remove',
                args: {
                    distance: '50%',
                    attrs: {
                        button: {
                            fill: EDGE_ACTIVE_COLOR,
                        },
                    },
                },
            },
        ]);
    }
}

export class StressFlowEdge extends FlowEdge {
    leaveItem() {
        this.setAttrs({
            line: {
                strokeWidth: 2,
                stroke: STRESS_COLOR,
                targetMarker: {
                    width: 6,
                    height: 10,
                },
            },
        });
        this.removeTools();
    }
}

FlowEdge.config({
    shape: 'flow-edge',
    ...getEdgeAttrs(),
});

StressFlowEdge.config({
    shape: 'flow-stress-edge',
    ...getEdgeAttrs(STRESS_COLOR),
});

Graph.registerEdge('flow-edge', FlowEdge);
Graph.registerEdge('flow-stress-edge', StressFlowEdge);
