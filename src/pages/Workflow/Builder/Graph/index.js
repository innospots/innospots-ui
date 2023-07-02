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

import {Graph, Addon} from '@antv/x6';
import _ from 'lodash';

import {FlowNode} from './shape/node';
import {FlowEdge, StressFlowEdge, getLabelData} from './shape/edge';

import {randomString} from '@/common/utils';

const getNewInPort = (id) => ({
  id: id || randomString(4), group: 'in',
});

const getNewOutPort = (id) => ({
  id: id || randomString(4), group: 'out',
});

const defOptions = {
  callback () {
  },
};

const getNodeByCode = (options) => {
  if (!options?.data.displayName && options?.data.name) {
    options.data.displayName = options.data.name;
  }

  return new FlowNode(options);
};

/**
 * 增删输出节点
 * @param node
 * @param targetNum
 */
const changeOutputPorts = (node, targetNum) => {
  const outPorts = node.getPortsByGroup('out') || [];
  const portsNum = outPorts.length;

  if (targetNum > portsNum) {
    _.each(_.range(targetNum - portsNum), (index) => {
      const newPort = getNewOutPort();
      node.addPort(newPort, {
        slient: true,
      });
    });
  } else if (targetNum < portsNum) {
    let n = targetNum;
    while (n < portsNum) {
      node.removePort(outPorts.pop(), {
        slient: true,
      });
      n++;
    }
  }
};

/**
 * 增删输入节点
 * @param node
 * @param targetNum
 */
const changeInPorts = (node, targetNum) => {
  const inPorts = node.getPortsByGroup('in') || [];
  const portsNum = inPorts.length;
  const attrs = _.get(inPorts[0], 'attrs', {});

  if (targetNum > portsNum) {
    _.each(_.range(targetNum - portsNum), (index) => {
      const newPort = getNewInPort();
      newPort.attrs = attrs;

      node.addPort(newPort, {
        slient: true,
      });
    });
  } else if (targetNum < portsNum) {
    let n = targetNum;
    while (n < portsNum) {
      node.removePort(inPorts.pop(), {
        slient: true,
      });
      n++;
    }
  }
};

const filterNodeGroups = (nodeGroups, excludes) => {
  const newGroups = [];
  _.each(_.cloneDeep(nodeGroups), (group) => {
    // group.nodes = _.filter(group.nodes, (node) => !excludes.includes(node.code));
    if (group.code !== 'trigger' && group.nodes?.length) {
      newGroups.push(group);
    }
  });

  return newGroups;
};

export default class FlowGraph {
  static graph;
  static stencil;
  static options;
  static editAble;
  static dagreLayout;
  static nodeConfigData;

  static init (options, pageMode = 'edit') {
    this.options = {
      ...defOptions, ...options,
    };

    const editAble = this.editAble = pageMode === 'edit';

    const graph = (this.graph = new Graph({
      ...options, panning: true, grid: {
        size: 20, visible: true, type: 'mesh', args: {
          color: '#eff2f8', thickness: 3,
        },
      }, background: {
        color: '#f6fafd',
      }, selecting: {
        enabled: true, multiple: false, rubberband: false, // movable: true,
        showNodeSelectionBox: false, filter: ['groupNode'],
      }, mousewheel: {
        enabled: true, // guard: () => false
        // modifiers: ['ctrl', 'meta'],
      }, interacting: {
        nodeMovable: editAble
      }, connecting: {
        snap: true,
        anchor: 'center',
        highlight: true,
        allowEdge: false,
        allowLoop: false,
        allowBlank: false,
        allowMulti: 'withPort',
        connectionPoint: 'anchor',
        createEdge ({sourceMagnet}) {
          const s = sourceMagnet.attributes.getNamedItem('port');
          if (s.value === 'failureBranchPort') {
            return new StressFlowEdge();
          }
          return new FlowEdge();
        },

        validateMagnet ({cell, magnet}) {
          return true

          // if (!editAble) return false;
          //
          // const outPorts = cell.getPortsByGroup('out');
          // const s = magnet.attributes.getNamedItem('port');
          // const outgoingEdges = graph.getOutgoingEdges(cell);
          // const outPortData = {};
          //
          // _.each(outPorts, (port) => {
          //   outPortData[port.name || port.id] = port.count || port.data.count || 1;
          // });
          //
          // const max = outPortData[s.value];
          //
          // if (max === -1 || s.value === 'failureBranchPort') return true;
          //
          // let count = 0;
          // _.each(outgoingEdges, (edge) => {
          //   const edgeView = graph.findViewByCell(edge);
          //   if (edgeView.sourceMagnet === magnet) {
          //     count += 1;
          //   }
          // });
          //
          // return count < max;
        },

        validateConnection ({
          sourceView, targetView, targetCell, targetPort, sourceMagnet, targetMagnet,
        }) {

          if (!editAble) return false;

          if (sourceView === targetView) {
            return false;
          }
          if (!sourceMagnet) {
            return false;
          }

          if (!targetMagnet) {
            return false;
          } else {
            try {
              const configData = _.get(targetCell, 'data.configData', {});
              const inPorts = configData.inPorts;
              const inPortData = {};

              _.each(inPorts, (port) => {
                inPortData[port.name] = port.count;
              });

              const s = targetMagnet.attributes.getNamedItem('port-group');
              const nodeInfo = targetCell.data;
              const max = inPortData.inPorts;

              if (s.value === 'out') {
                return false;
              } else if (nodeInfo.isDefault) {
                return false;
              }

              if (max === -1) return true;

              const edges = graph.getIncomingEdges(targetCell);

              const result = _.find(edges, (e) => {
                const target = e.target || {};
                return targetCell.id === target.cell && targetPort === target.port;
              });

              return !result;
            } catch (e) {
            }
          }

          return true;
        },
      }, highlighting: {
        magnetAvailable: {
          name: 'stroke', args: {
            padding: 2, attrs: {
              strokeWidth: 2, stroke: '#ff6d5a',
            },
          },
        },
      }, snapline: editAble, history: editAble, clipboard: {
        enabled: editAble,
      }, keyboard: {
        enabled: editAble,
      }, embedding: {
        enabled: editAble, findParent ({node}) {
          const bbox = node.getBBox();
          return this.getNodes().filter((node) => {
            // 只有 data.parent 为 true 的节点才是父节点
            const data = node.getData();
            if (data && data.parent) {
              const targetBBox = node.getBBox();
              return bbox.isIntersectWithRect(targetBBox);
            }
            return false;
          });
        },
      },
    }));

    this.initEvent();

    return this.graph;
  }

  static changeData (json) {
    this.clear();

    if (json) {
      this.fromJSON(json);
    }
  }

  static clear () {
    this.graph.clearCells({
      silent: true,
    });
  }

  static resetNodeData (node) {
    if (node) {
      const nodeData = node.getData();

      if (nodeData.code === 'SCRIPT') {
        nodeData.action = '';
        // nodeData.actionScriptType = ''
      }

      nodeData.data = {};

      node.setData(nodeData);
    }
  }

  static resetChildrenData (cell, callback) {
    // if (cell) {
    //   const {
    //     nextNodeKeys
    //   } = cell.getData()
    //   if (nextNodeKeys && nextNodeKeys.length) {
    //     _.each(nextNodeKeys, key => {
    //       const childCell = this.graph.getCellById(key)
    //       this.resetNodeData(childCell)
    //
    //       if (_.isFunction(callback)) {
    //         callback.apply(null, [key, false])
    //       }
    //
    //       this.resetChildrenData(childCell, callback)
    //     })
    //   } else {
    //     callback.apply(null, [null, true])
    //   }
    // }
  }

  static getJSONData () {
    const jsonData = {
      nodes: [], edges: [],
    };

    _.each(this.graph.getCells(), (cell) => {
      const d = _.cloneDeep(cell.store.data);
      if (cell.isEdge()) {
        if (!d._source) {
          d._source = d.source;
          d.source = d.source.cell;
        }

        if (!d._target) {
          d._target = d.target;
          d.target = d.target.cell;
        }
        jsonData.edges.push(d);
      } else {
        jsonData.nodes.push(d);
      }
    });

    return jsonData;
  }

  static zoomGraph (factor) {
    const graph = this.graph;
    if (typeof factor === 'number') {
      graph.zoomTo(factor);
    } else if (factor === 'fit') {
      const container = graph.container;
      const size = {
        width: container.clientWidth, height: container.clientHeight,
      };
      graph.zoomTo(1);
      graph.fitToContent({padding: 12});
      graph.resize(size.width, size.height);
    } else if (factor) {
    }
  }

  static zoomTo (factor) {
    const graph = this.graph;
    if (typeof factor === 'number') {
      graph.zoomTo(factor * graph.zoom());
    }
  }

  static resize ({width, height}) {
    this.graph.resize(width, height);
  }

  static updateStencilItems (nodeGroups, excludes = []) {
    const newGroups = filterNodeGroups(nodeGroups, excludes);
    this.loadStencilItems(newGroups);
  }

  static loadStencilItems (nodeGroups) {
    const {graph} = this;

    _.each(nodeGroups, (item) => {
      const nodes = _.map(item.nodes, (data) => {
        const defaultNodeData = {};
        const nodeData = {
          ...data,
        };

        nodeData.category = nodeData.category || nodeData.code;

        _.each(nodeData, (v, k) => {
          let defaultVal;
          if (!v && (defaultVal = defaultNodeData[k])) {
            nodeData[k] = defaultVal;
          }
        });

        return graph ? graph.createNode({
          data: {
            ...defaultNodeData, ...nodeData,
          }, shape: 'stencil-flow-node',
        }) : null;
      });
      this.stencil.load(nodes, item.code);
    });
  }

  static createStencil (nodeGroups, excludes = [], options, nodeConfigData) {
    if (!this.graph) return;

    this.nodeConfigData = nodeConfigData;

    const newGroups = filterNodeGroups(nodeGroups, excludes);

    this.stencil = new Addon.Stencil({
      target: this.graph,
      title: 'title',
      placeholder: 'placeholder',
      notFoundText: 'notFoundText',
      stencilGraphWidth: 250,
      search: (cell, keyword, groupName, stencil) => {
        if (keyword) {
          const cellData = cell.data || {};
          return (cellData.name || '').indexOf(keyword) > -1;
        }
        return true;
      },
      collapsable: true,
      groups: _.map(newGroups, (item) => ({
        name: item.code,
        title: item.name,
        graphHeight: Math.ceil(item.nodes.length / 3) * 100 + 30,
      })),
      layoutOptions: {
        columns: 3,
        rowHeight: 100,
        columnWidth: 220 / 3,
      },
      getDragNode (sourceNode, options) {
        const nodeData = sourceNode.data;
        const configData = {
          ...nodeData,
        };

        return getNodeByCode({
          data: {
            ...nodeData,
            configData,
          },
        });
      },
      getDropNode (draggingNode, {sourceNode}) {
        const nodeData = sourceNode.data;
        const configData = {
          ...nodeData,
        };
        const nodeId = ['fn' + randomString(7)].join('');

        return getNodeByCode({
          id: nodeId, data: {
            ...nodeData,
            configData,
            pageMode: 'edit',
          },
        });
      }, ...options,
    });
    const stencilContainer = document.querySelector('#stencil');
    stencilContainer.appendChild(this.stencil.container);

    this.loadStencilItems(newGroups, excludes);
  }

  /**
   * 监听节点连线事件
   * @param edge
   */
  static handleEdgeConnected (edge) {
    const sourceNode = edge.getSourceNode();
    const targetNode = edge.getTargetNode();
    const sourceOutPorts = _.filter(_.get(sourceNode, 'ports.items'), (item) => item.group === 'out',);
    const targetInPorts = _.filter(_.get(targetNode, 'ports.items'), (item) => item.group === 'in',);
    const edgeOutPort = edge.source.port;
    const edgeInPort = edge.target.port;

    const targetPort = _.find(targetInPorts, (p) => p.id === edgeInPort) || {};
    const sourcePort = _.find(sourceOutPorts, (p) => p.id === edgeOutPort) || {};

    const edgeLabels = [getLabelData('out', targetPort.data?.label), getLabelData('in', sourcePort.data?.label),];
    edge.setLabels(edgeLabels);
  }

  /**
   * 监听连线删除事件
   * 如果是sourceNode是分支节点
   * 则删除多余的连接点
   */
  static handleEdgeRemoved (edge) {
    const storeData = edge.store.data;

    if (!storeData) return;

    const sourceId = storeData.source.cell;
    const targetId = storeData.target.cell;
    const sourceNode = this.graph.getCellById(sourceId);
    const targetNode = this.graph.getCellById(targetId);

    if (targetNode) {
      const targetInfo = targetNode.getData();
      if (['MERGE', 'FILTER'].includes(targetInfo.code) && storeData.target.port === 'flow-in-1') {
        targetInfo.data = {
          ...targetInfo.data, main_source_node: '',
        };
        targetNode.updateData(targetInfo);
        return;
      }
    }

    if (!sourceNode) return;

    const nodeInfo = sourceNode.data;

    if (nodeInfo.code !== 'SWITCH') return;

    const outPorts = sourceNode.getPortsByGroup('out');

    /**
     * 触发分支节点改变事件
     */
    this.trigger('switch:change', {
      type: 'edge.delete', data: {
        node: sourceNode, target: targetId, portIndex: _.findIndex(outPorts, (p) => storeData.source.port === p.id),
      },
    });
  }

  /**
   * 根据分支的数据修改节点的连接点
   * @param sourceNode
   * @param conditions
   */
  static changeSwitchNodePorts (sourceNode, conditions) {
    const graph = this.graph;
    const outPorts = sourceNode.getPortsByGroup('out');
    const defPort = _.find(outPorts, (item) => item.id === 'flow-out');
    const filedOutPorts = _.filter(outPorts, (item) => item.id !== defPort.id);

    //现有的输出连线
    const outgoingEdges = graph.getOutgoingEdges(sourceNode) || [];
    const newPorts = [];

    _.each(_.filter(conditions, (item) => !!item.branch), (item, index) => {
      const p = filedOutPorts[index] || getNewOutPort();
      newPorts.push(p);
    },);

    newPorts.push(defPort);

    if (outPorts.length !== newPorts.length) {
      sourceNode.removePorts(outPorts, {
        slient: true,
      });
      sourceNode.addPorts(newPorts, {
        slient: true,
      });
    }

    /**
     * 处理现有的输出连线
     */
    if (outgoingEdges && outgoingEdges.length) {
      const length = newPorts.length;
      _.each(newPorts, (port, index) => {
        const edge = _.find(outgoingEdges, (item) => item.source.port === port.id);
        if (edge) {
          let label = index + 1 + '';

          if (index === length - 1) {
            label = 'O';
          }

          //更新线上的数字
          edge.setLabels(index, {
            silent: true,
          });

          graph.addEdge(edge, {
            slient: true,
          });
        }
      });
    }
  }

  /**
   * 触发当前节点data变化处理
   * @param node
   * @param current
   * @param previous
   */
  static checkNodeDataChange ({node, current, previous}) {
    const curData = (current || {}).data || {};
    const preData = (previous || {}).data || {};
    const code = (current || {}).code;

    if (code === 'SWITCH') {
      /**
       * 分支节点检测分支的数据是否发生变化
       */
      if (!_.isEqual(curData.conditions, preData.conditions)) {
        this.changeSwitchNodePorts(node, curData.conditions);
      }
    } else if (code === 'PARALLEL') {
      //并行执行节点
      changeOutputPorts(node, curData.parallel_number);
    } else if (code === 'COMBINE') {
      //并行执行合并节点
      changeInPorts(node, curData.combine_number);
    }
  }

  static initEvent () {
    const _this = this;
    const {graph} = _this;

    graph.on('node:change:data', (event) => {
      // this.checkNodeDataChange(event);
      this.trigger('change:data', event);
    });

    graph.on('cell:removed', (event) => {
      this.trigger('removed', event);

      if (event.cell.isEdge()) {
        try {
          this.handleEdgeRemoved(event.cell);
        } catch (e) {
          console.info(e);
        }
      }
    });

    graph.on('cell:added', (event) => {
      this.trigger('added', event);
    });

    graph.on('node:dblclick', (event) => {
      this.trigger('node:dblclick', event);
    });

    graph.on('edge:connected', (event) => {
      if (event.isNew) {
        this.handleEdgeConnected(event.edge);
      }
      this.trigger('edge:connected', event);
    });

    graph.on('node:cur-select', (event) => {
      this.trigger('node:cur-select', event);
    });

    graph.on('node:menu-click', (event) => {
      this.trigger('node:menu-click', event);
    });

    graph.on('blank:click', (event) => {
      this.trigger('blank:click', event);
    });

    graph.on('edge:mouseenter', (event) => {
      event.cell.enterItem();
    });

    graph.on('edge:mouseleave', (event) => {
      event.cell.leaveItem();
    });

    // graph.on('blank:mousewheel', (event) => {
    //   this.options.callback('mousewheel', event);
    // });
    //
    // graph.on('cell:mousewheel', (event) => {
    //   this.options.callback('mousewheel', event);
    // });
  }

  static trigger (name, event) {
    if (name.indexOf(':') < 0) {
      let type = 'node';

      if (event.cell.isEdge()) {
        type = 'edge';
      }

      name = [type, name].join(':');
    }

    this.options.callback(name, event);
  }

  static initShape (defData) {
    const nodeData = {};
    this.graph.addNode({
      x: 140, y: 140, id: ['fn' + randomString(7)].join(''), shape: 'flow-node', data: {
        ...defData, ...nodeData,
      },
    });
  }

  static fromJSON (json) {
    this.graph.fromJSON(json, {
      slient: true,
    });
  }
}
