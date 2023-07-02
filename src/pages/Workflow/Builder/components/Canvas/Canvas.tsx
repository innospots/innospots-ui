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

import React, { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import { Row, Col, message, Typography } from 'antd';
import { JQuery } from '@antv/x6';
import {
  HomeOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  FullscreenOutlined,
  PlusCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  MinusCircleOutlined,
  BorderOuterOutlined,
} from '@ant-design/icons';
import { Menu, Toolbar } from '@antv/x6-react-components';
import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';

import FlowGraph from '../../Graph';
import ConfigPanel from '../ConfigPanel';
import ExecutePreview from '../ExecutePreview';

import useI18n from '@/common/hooks/useI18n';

import CurContext from '../../common/context';
import * as BuilderService from '@/services/Builder';

import { randomString } from '@/common/utils';
import localStorage from '@/common/utils/LocalStorage';

import styles from './index.less';

const Item = Toolbar.Item;
const Group = Toolbar.Group;
const { Link } = Typography;

/**
 * 执行结果数据缓存
 * @type {{}}
 */
let resultDataCache = {};

/**
 * 保存所有边和节点的id
 * @type {Array}
 */
const curFlowIdData = {
  edgeIds: {},
  nodeIds: {},
};

//WEBHOOK: 1, STREAM:2, SCHEDULE:3, DUMMY:4
const FLOW_TPL_IDS = {
  WEBHOOK: 1,
  STREAM: 2,
  SCHEDULE: 3,
  DUMMY: 4,
};

const DEFAULT_NODE_CODES = {
  WEBHOOK: 'WEBHOOK',
  SCHEDULE: 'CRONTIMER',
  STREAM: 'KAFKA_TRIGGER',
};

let flowTemplate: { nodeGroups: any[], tplCode?: string } = { nodeGroups: [] }, curFlowInstance;
let curLoopNode,
  flowCacheList: {
    id: string
    cells?: []
    flowData: any
    nodeData: any
    jsonData: any
    flowInstance: any
  }[] = [],
  loopNodeData;
const ZOOM_VALUE_LIST = [25, 50, 75, 100, 125, 150, 200, 300, 400];

const defaultPreviewStatus = localStorage.get('flowPreviewStatus') || 'open';

const nodeConfigData = {};
const flowTemplateCache = {};

const templateExcludes = (tplCode) => {
  const excludes = ['START', 'END', 'NEXT_LOOP'];
  const other = DEFAULT_NODE_CODES[tplCode];
  if (other) {
    excludes.push(other);
  }

  return excludes;
};

const Canvas:React.FC<{
  mode?: 'preview' | 'edit',
  workflowInstanceId: string|number,
  onNodeChange?: (isChange: boolean) => void,
  onGetFlowInstance?: (instance) => void,
}> = ({ mode = 'edit', workflowInstanceId, onGetFlowInstance, onNodeChange }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const {
    setExecuteLoading,
    publishBuilderRequest,
    executeBuilderRequest,
    saveBuilderDraftRequest,
    executeBuilderNodeRequest,
    executeWorkflowInstanceRequest,
  } = useModel('Builder');
  const { workflow, setWorkflow, fetchWorkflowRequest } = useModel('Workflow');

  const isPreview = mode === 'preview';
  const selectCellRef = useRef<any>(null);
  const graphContainerRef = useRef(null);

  const [curConfigCell, setCurConfigCell] = useState(null);

  const [curZoom, setCurZoom] = useState(100);

  const [curLoopId, setCurLoopId] = useState('');

  const [statusMap, setStatusMap] = useState({});
  const [curNodeData, setCurNodeData] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [flowInstance, setFlowInstance] = useState<{
    flowKey?: string
    workflowInstanceId?: number
  }>({});
  const [curLayout, setCurLayout] = useState('left');
  const [selectedId, setSelectedId] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [outputFiles, setOutputFiles] = useState<any[]>([]);
  const [outputFields, setOutputFields] = useState<any[]>([]);

  const [nodeChange, setNodeChange] = useState(false);

  /**
   * 执行结果数据
   */
  const [executeData, setExecuteData] = useState({});
  const [allExecuteData, setAllExecuteData] = useState({});

  /**
   * 底部执行结果节点的显示状态
   * 'open' 展开
   * 'close' 收缩
   */
  const [previewStatus, setPreviewStatus] = useState(defaultPreviewStatus);
  const [previewNodeVisible, setPreviewNodeVisible] = useState(false);

  const isShowExecutePreview = useMemo(() => {
    const nodeCode = _.get(selectCellRef.current, 'data.code');
    return !(!previewNodeVisible || !nodeCode || ['START', 'WEBHOOK'].includes(nodeCode));
  }, [previewNodeVisible, _.get(selectCellRef.current, 'data.code')]);

  // const dataSourceList = dataSource.listData

  useEffect(() => {
    createGraph();
    return () => setWorkflow({});
  }, []);

  useEffect(() => {
    curFlowInstance = flowInstance;
    onGetFlowInstance?.(flowInstance)
  }, [flowInstance]);

  useEffect(() => {
    onNodeChange?.(nodeChange)
  }, [nodeChange]);

  useEffect(() => {
    _.each(statusMap, (status, nodeId) => {
      updateNodeStatus(nodeId, status);
    });
  }, [statusMap]);

  useEffect(() => {
    fetchWorkflowRequest.run(workflowInstanceId);
  }, [workflowInstanceId]);

  useEffect(() => {
    if (workflow.templateCode) {
      getFlowTemplate();
    }
  }, [workflow.templateCode]);

  useEffect(() => {
    try {
      // @ts-ignore
      graphContainerRef.current.style.width = '100%';
    } catch (e) {}
  }, [collapsed]);

  useEffect(() => {
    localStorage.set('flowPreviewStatus', previewStatus);
  }, [previewStatus]);

  useEffect(() => {
    addEvents();
    return () => removeEvents();
  }, []);

  useEffect(() => {
    FlowGraph.zoomGraph(curZoom / 100);
  }, [curZoom]);

  useImperativeHandle(ref, () => ({
    saveFlowInstance: (silence?: boolean) => saveFlowDraft(silence),
    publishFlowInstance: () => publishFlow(),
  }))

  const getNodeByCode = (code) => {
    let node;
    _.find(flowTemplate.nodeGroups, (group) => {
      node = _.find(group.nodes, (node) => node.code === code);
      return !!node;
    });

    return node;
  };

  const getLoopDefaultNodes = () => {
    const startNode = getNodeByCode('START');
    const nextLoopNode = getNodeByCode('NEXT_LOOP');
    const ids = [['fn' + randomString(7)].join(''), ['fn' + randomString(7)].join('')];

    return {
      edges: [
        {
          shape: 'flow-edge',
          source: {
            cell: ids[0],
            port: 'flow-in',
          },
          target: {
            cell: ids[1],
            port: 'flow-out',
          },
        },
      ],

      nodes: _.map([startNode, nextLoopNode], (node, index) => {
        return {
          id: ids[index],
          shape: index === 0 ? 'start-node' : 'end-node',
          position: {
            x: index * 400,
          },
          data: {
            ...node,
          },
        };
      }),
    };
  };

  const showTopFlow = () => {
    updateSelectedCell(null);

    saveFlowDraft(true)
      .then(() => {
        const { jsonData, flowInstance } = flowCacheList[0];
        FlowGraph.changeData(jsonData);
        setFlowInstance(flowInstance);
      })
      .then(() => {
        curLoopNode = null;
        flowCacheList = [];
        setCurLoopId('');
        updateStencilItems();
      });
  };

  const updateLoopData = (data) => {
    const { jsonData } = flowCacheList[0];

    _.find(jsonData.cells, (cell) => {
      if (cell.id === curLoopNode.id) {
        cell.data = {
          ...cell.data,
          ...data,
        };
        return true;
      }
      return false;
    });
  };

  const updateStencilItems = () => {
    const excludes = templateExcludes(flowTemplate.tplCode);

    if (curLoopNode) {
      excludes.push('LOOP');
    }

    FlowGraph.updateStencilItems(flowTemplate.nodeGroups, excludes);
  };

  const showLoopFlow = (cacheId) => () => {
    const cacheIndex = _.findIndex(flowCacheList, (item) => item.id === cacheId);
    if (cacheIndex > -1) {
      const cache = flowCacheList[cacheIndex];
      if (cache && cache.flowData) {
        curLoopNode = cache.nodeData;
        setCurLoopId(curLoopNode.id);
        FlowGraph.changeData(cache.flowData);
        flowCacheList.splice(cacheIndex, flowCacheList.length - cacheIndex);
      }
    }
  };

  const onWindowResize = _.debounce(() => {
    FlowGraph.resize(getContainerSize());
  }, 500);

  const removeEvents = () => {
    JQuery(window).off('resize.flow', onWindowResize);
  };

  const addEvents = () => {
    JQuery(window).on('resize.flow', onWindowResize);
  };

  const fetchExecution = (nodeId) => {
    //nodeExecutionRequest.run(nodeExecutionId);
  };

  const getFlowTemplate = async () => {
    const result = await BuilderService.fetchTemplate();

    if (result) {
      const nodeGroups = flowTemplate.nodeGroups = result.appNodeGroups;
      if (nodeGroups && nodeGroups.length) {
        _.each(nodeGroups, (group) => {
          _.each(group.nodes, (node) => {
            nodeConfigData[node.code] = {
              ...node,
            };
          });
        });

        if (!isPreview) {
          FlowGraph.createStencil(
            flowTemplate.nodeGroups,
            templateExcludes(workflow.templateCode),
            {
              placeholder: t('common.input.placeholder'),
              notFoundText: t('common.text.empty'),
            },
            nodeConfigData,
          );
        }

      }
      getWorkflowBuilder();
    }
  };

  const updateNodeStatus = (nodeId, nodeStatus) => {
    if (nodeId && nodeStatus) {
      const node = getCell(nodeId);
      if (node) {
        node.updateData({
          nodeStatus,
        });
      }
    }
  };

  /**
   * 运行一个节点
   * @param node
   * @param force
   * @param nodeInfo
   * @param testData
   * @returns {Promise<void>}
   */
  const doNodeExecute = async (node, force, nodeInfo?: any, testData?: any) => {
    setTimeout(() => updateSelectedCell(node), 0);

    node = node || selectCellRef.current;
    nodeInfo = nodeInfo || node.data;

    if (nodeInfo?.primitive === 'trigger') {
      executeWorkflowInstance(testData);
      return;
    }

    if (node) {
      const nodeKey = node.id;
      const cacheData = resultDataCache[nodeKey];

      if (!force && cacheData) {
        setExecuteData(cacheData);
        setAllExecuteData(resultDataCache);
      } else {
        if (nodeInfo) {
          updateNodeData({
            ...nodeInfo,
            executing: true
          }, {
            overwrite: true,
          }, node);
        }

        setExecuteLoading(true);

        await saveWorkflowBuilderCache();

        const resData = await executeBuilderNodeRequest.runAsync({
          nodeKey,
          workflowInstanceId,
          data: testData || {},
        });

        if (resData) {
          postExecuteOutput([{ nodeKey }], nodeKey);

          _.each(_.keys(resData), (_nodeKey) => {
            const curNodeResult = resData[_nodeKey];
            if (curNodeResult) {
              if (curNodeResult.outputFields) {
                const _node = FlowGraph.graph.getCellById(_nodeKey);
                if (_node) {
                  _node.updateData({
                    outputFields: curNodeResult.outputFields,
                  });
                }
              }
              resultDataCache[_nodeKey] = curNodeResult;
            }
          });

          setExecuteData(resData[nodeKey] || {});

          // getWorkflowBuilder()
        }

        setExecuteLoading(false);
        node.updateData({
          executing: false,
        });
      }
    }
  };

  const getWorkflowBuilder = async (insId = workflowInstanceId) => {
    const resData = await BuilderService.fetchWorkflowBuilder({
      workflowInstanceId: insId,
    });

    if (resData) {
      setFlowInstance(resData);

      if (resData && resData.nodes && resData.nodes.length) {
        saveIds(resData);

        const flowJson = getFlowJsonData(resData);

        if (curLoopNode) {
          FlowGraph.changeData(flowJson);
        } else {
          if (loopNodeData?.id && loopNodeData?.workflowInstanceId) {
            _.find(flowJson.nodes, (node) => {
              if (node.id === loopNodeData.id) {
                if (!node.data.data) node.data.data = {};
                node.data.data.workflow_instance_id =
                  loopNodeData.workflowInstanceId;
                return true;
              }
              return false;
            });
          }

          flowJson.nodes = _.map(flowJson.nodes, (item) => {
            const includes = (ports, name) => !!_.find(ports, port => port.name === name);
            const configData = _.cloneDeep(nodeConfigData[item.data.code] || {});
            const nodePorts = {
              inPorts: _.filter(item.data.ports, port => port.data?.group === 'in' || includes(configData.inPorts, port.name)),
              outPorts: _.filter(
                item.data.ports, port => port.data?.group === 'out' || includes(configData.outPorts, port.name),
              ),
            };

            _.each(['inPorts', 'outPorts'], (type) => {
              const ports = nodePorts[type];
              if (ports.length) {
                configData[type] = _.map(ports, (item) => {
                  const portData = item.data || {};
                  return {
                    name: item.id,
                    count: portData.count,
                    label: portData.label,
                    ...item,
                  };
                });
              }
            });

            item.data = {
              ...item.data,
              configData,
            };
            return item;
          });

          FlowGraph.fromJSON(flowJson);
        }

        postExecuteOutput(resData.nodes);
      } else {
        let defNode;
        const workflowType = workflow.triggerCode || flowTemplate.tplCode;
        // const defNodeCode = DEFAULT_NODE_CODES[workflowType] || 'START';

        _.find(flowTemplate.nodeGroups, (group) => {
          return !!_.find(group.nodes, (node) => {
            if (node.code === workflowType) {
              defNode = node;
              return true;
            }
          });
        });

        if (defNode) {
          FlowGraph.initShape({
            ...defNode,
            configData: nodeConfigData[defNode.code],
          });
        }
      }
    }
  };

  const handleCellCallback = (name, event) => {
    const cell = event.cell;
    switch (name) {
      case 'node:cur-select':
        updateSelectedCell(cell);
        break;

      case 'node:dblclick':
        if (!isPreview) {
          updateSelectedCell(cell, 'dblclick');
        }
        break;

      case 'blank:click':
        updateSelectedCell(null);
        break;

      case 'node:removed':
        resetChildrenData(cell);
        saveFlowCache();
        updateSelectedCell(null);
        break;

      case 'edge:removed':
        const nodeId = event.cell.target.cell;
        const targetNode = FlowGraph.graph.getCell(nodeId);
        // FlowGraph.resetNodeData(targetNode)
        resultDataCache[nodeId] = null;

        setStatusMap({
          ...statusMap,
          [nodeId]: 'WARNING',
        });

        resetChildrenData(targetNode);
        saveFlowCache();
        break;

      case 'node:added':
      case 'edge:connected':
        saveFlowCache();
        break;

      case 'node:menu-click':
        handleNodeMenuClick(event);
        break;

      /**
       * 分支节点处理事件
       */
      // case 'switch:change':
      //   handleSwitchNodeChange(event);
      //   break;

      // case 'change:data':
      //   setNodeChange(!(event.options || {}).curSilent)
      //   break

      default:
        // console.info(name, event)
        break;
    }
  };

  const resetChildrenData = (cell) => {
    FlowGraph.resetChildrenData(cell, (nodeKey, isEnd) => {
      if (!isEnd && nodeKey) {
        statusMap[nodeKey] = 'WARNING';
        resultDataCache[nodeKey] = null;
      } else {
        setStatusMap({
          ...statusMap,
        });
      }
    });
  };

  const handleNodeMenuClick = (event) => {
    if (event.type === 'execute') {
      const node = event.cell || selectCellRef.current;
      const configData = _.get(node, 'data.configData', {});
      if (configData.runMethod === 'CONFIG') {
        //runMethod 为CONFIG时，需要单独的运行逻辑
        updateSelectedCell(node);
        setTimeout(() => updateSelectedCell(node, 'dblclick'), 300);
      } else {
        doNodeExecute(event.cell, true);
      }
    } else if (event.type === 'loop-edit') {
      loopNodeEdit(event.cell);
    }
  };

  const loopNodeEdit = (node) => {
    updateSelectedCell(null);

    // saveFlowDraft(true)

    flowCacheList.push({
      id: curLoopNode?.id || 'main',
      nodeData: curLoopNode,
      flowData: getFlowData(),
      jsonData: FlowGraph.graph.toJSON(),
      flowInstance: {
        ...curFlowInstance,
      },
    });

    curLoopNode = node;
    const nodeData = _.get(curLoopNode, 'data.data', {});
    if (nodeData.workflow_instance_id) {
      getWorkflowBuilder(nodeData.workflow_instance_id);
    } else {
      setFlowInstance({});
      setCurLoopId(node.id);

      const nodes = getLoopDefaultNodes();
      FlowGraph.changeData(nodes);
      FlowGraph.graph.centerContent();
    }

    updateStencilItems();
  };

  const updateSelectedCell = (cell, event?: string) => {
    if (curLoopNode) {
      FlowGraph.graph.getNodes().forEach((node) => {
        node.updateData(
          {
            __selected: false,
          },
          {
            curSilent: true,
          },
        );
      });
    }

    if (selectCellRef.current && cell && selectCellRef.current.id !== cell.id) {
      selectCellRef.current.updateData(
        {
          __selected: false,
        },
        {
          curSilent: true,
        },
      );
    }

    if (event === 'dblclick') {
      if (curLoopNode) {
        setCurConfigCell(curLoopNode.id);
      } else {
        setCurConfigCell(cell.id);
      }
    }

    if (cell) {
      cell.updateData(
        {
          __selected: true,
        },
        {
          curSilent: true,
        },
      );
    } else {
      if (selectCellRef.current) {
        selectCellRef.current.updateData(
          {
            __selected: false,
          },
          {
            curSilent: true,
          },
        );
      }
    }

    if (curLoopNode && cell) {
      cell = curLoopNode;
    }

    selectCellRef.current = cell;

    const selected = !!cell;

    setIsSelected(selected);
    setSelectedId(cell ? cell.id : '');

    setPreviewNodeVisible(selected);

    if (selected) {
      setCurNodeData(selectCellRef.current.data);
    }
  };

  const getCell = (id) => FlowGraph.graph.getCell(id);

  const createGraph = () => {
    const options = getGraphOptions();
    FlowGraph.init({
      ...options,
    }, mode);
  };

  const getGraphOptions = () => {
    return {
      ...getContainerSize(),
      container: graphContainerRef.current,
      callback: handleCellCallback,
    };
  };

  const getContainerSize = () => {
    const wrapper = JQuery('#graph-container');
    wrapper.width('auto');

    return {
      width: Math.max(960, wrapper.width()),
      height: wrapper.height(),
    };
  };

  const executeTriggerNode = () => {
    const originalData = FlowGraph.getJSONData();
    _.find(originalData.nodes, (node) => {
      const configData = _.get(node, 'data.configData', {
        primitive: undefined
      });
      if (configData.primitive === 'trigger') {
        // @ts-ignore
        const cell = FlowGraph.graph.getCell(node.id);
        handleNodeMenuClick({
          cell,
          type: 'execute',
        });
        return true;
      }
    });
  };

  const executeWorkflowInstance = async (testData: any) => {
    setExecuteLoading(true);

    await saveWorkflowBuilderCache();

    const resData = await executeWorkflowInstanceRequest.runAsync({
      workflowInstanceId,
      data: testData,
    });

    postExecuteOutput([]);

    setExecuteLoading(false);

    if (resData) {
      _.each(_.keys(resData), (_nodeKey) => {
        const curNodeResult = resData[_nodeKey];
        if (curNodeResult) {
          if (curNodeResult.outputFields) {
            const _node = FlowGraph.graph.getCellById(_nodeKey);
            if (_node) {
              _node.updateData({
                outputFields: curNodeResult.outputFields,
              });
            }
          }
          _.extend(statusMap, {
            [_nodeKey]: curNodeResult.status || 'FAILED',
          });
          resultDataCache[_nodeKey] = curNodeResult;
        }
      });

      setStatusMap({
        ...statusMap,
      });

      setAllExecuteData(resData);
    }
  };

  const handleToolbarClick = (name, value) => {
    switch (name) {
      case 'zoomIn':
        FlowGraph.zoomTo(1.2);
        break;

      case 'zoomOut':
        // updateZoomByType(name)
        FlowGraph.zoomTo(0.8);
        break;

      case 'zoomFit':
        FlowGraph.zoomGraph('fit');
        break;

      case 'play':
        executeTriggerNode();
        break;

      case 'stop':
      case 'fullscreen':
        break;

      default:
        setCurZoom(name);
        break;
    }
  };

  const getZoomDropdown = () => {
    const MenuItem = Menu.Item;

    return (
      <Menu>
        {_.map(ZOOM_VALUE_LIST, (num) => (
          <MenuItem active={num === curZoom} name={num + ''} key={num}>
            {num}%
          </MenuItem>
        ))}
      </Menu>
    );
  };

  const breadcrumb = () => {
    if (flowCacheList.length && curLoopNode && curLoopNode.data) {
      return (
        <div className={styles.breadcrumb}>
          <div className={styles.chevronList}>
            {_.map(flowCacheList, (item) => {
              if (item.id === 'main') {
                return (
                  <div className={styles.chevron} key={item.id}>
                    <div className={styles.contentInner}>
                      <Link onClick={showTopFlow}>
                        <HomeOutlined /> {t('text.homepage')}
                      </Link>
                    </div>
                  </div>
                );
              } else {
                const nodeData = item.nodeData?.data;
                return (
                  <div className={styles.chevron} key={item.id}>
                    <div className={styles.contentInner}>
                      <Link onClick={showLoopFlow(item.id)}>
                        {nodeData?.displayName}
                      </Link>
                    </div>
                  </div>
                );
              }
            })}
            <div className={styles.chevron}>
              <div className={styles.contentInner}>
                {curLoopNode.data.displayName}
              </div>
            </div>
          </div>
          <div className={styles.backBtn} onClick={showTopFlow}>
            {t('text.back')}
          </div>
        </div>
      );
    }
    return null;
  };

  const getToolbar = () => {
    return (
      <div className={styles.toolbar}>
        <Toolbar hoverEffect onClick={handleToolbarClick}>
          {
            !isPreview && (
              <Group>
                <Item
                  name="play"
                  text={t('workflow.builder.button.run')}
                  icon={<PlayCircleOutlined />}
                />
                <Item
                  name="stop"
                  text={t('workflow.builder.button.stop')}
                  icon={<PauseCircleOutlined />}
                />
              </Group>
            )
          }
          <Group>
            <Item
              name="zoomIn"
              tooltip={t('workflow.builder.button.zoom_in')}
              icon={<PlusCircleOutlined />}
            />
            <Item
              name="zoomOut"
              tooltip={t('workflow.builder.button.zoom_out')}
              icon={<MinusCircleOutlined />}
            />
            <Item name="zoomFit" tooltip={t('100%')} icon={<BorderOuterOutlined />} />
            {/*<Item*/}
            {/*    name="zoom"*/}
            {/*    tooltip={t('workflow.builder.button.zoom')}*/}
            {/*    dropdown={getZoomDropdown()}*/}
            {/*>*/}
            {/*  <span*/}
            {/*      style={{*/}
            {/*          width: 40,*/}
            {/*          textAlign: 'right',*/}
            {/*          display: 'inline-block',*/}
            {/*      }}*/}
            {/*  >*/}
            {/*      {curZoom}%*/}
            {/*  </span>*/}
            {/*</Item>*/}
            <Item
              name="fullscreen"
              tooltip={t('workflow.builder.button.fullscreen')}
              icon={<FullscreenOutlined />}
            />
          </Group>
        </Toolbar>
      </div>
    );
  };

  const getGraphContainer = () => {
    return (
      <div className={styles.graphWrapper}>
        <div
          id="graph-container"
          ref={graphContainerRef}
          className={styles.graphContainer}
        />
      </div>
    );
  };

  /**
   * 获取格式化后的策略流数据
   * 用于展示策略流
   */
  const getFlowJsonData = (flowData) => {
    return {
      edges: _.map(flowData.edges, (edge) => ({
        shape: edge.type,
        labels: edge.data?.labels,
        source: {
          cell: edge.source,
          port: edge.sourceAnchor,
        },
        target: {
          cell: edge.target,
          port: edge.targetAnchor,
        },
      })),
      nodes: _.map(flowData.nodes, (node) => {
        if (!node.displayName) {
          node.displayName = node.name;
        }

        node.ports = _.uniqBy(node.ports, 'name');

        const nodeData: any = {
          id: node.nodeKey,
          shape: 'flow-node',
          position: {
            x: node.x,
            y: node.y,
          },
          data: {
            pageMode: mode,
            ...node,
          },
        };

        if ((node.data || {}).ports) {
          nodeData.ports = node.data.ports;
        }

        return nodeData;
      }),
    };
  };

  /**
   * 格式化策略流数据
   * 用于保存策略流数据
   * @returns {{edges: Array, nodes: Array}}
   */
  const getFlowData = (instance = curFlowInstance) => {
    const flowData = {
      name: 'name',
      revision: 0,
      workflowInstanceId: 0,
      workflowTemplateId: 1,
      ...instance,
    };

    if (!flowData.flowKey) {
      flowData.flowKey = randomString(6);
    }

    const originalData = FlowGraph.getJSONData() as {
      nodes: any[]
      edges: any[]
    };

    const edges: any[] = [];
    _.map(originalData.edges, (edge) => {
      const s = edge._source || {};
      const t = edge._target || {};

      const d: any = {
        type: edge.shape,
        source: edge.source,
        target: edge.target,
        sourceAnchor: s.port,
        targetAnchor: t.port,
        data: {
          labels: ''
        }
      };

      if (edge.labels) {
        d.data.labels = edge.labels;
      }

      let edgeId;

      if ((edgeId = curFlowIdData.edgeIds[[d.source, d.target].join('-')])) {
        d.edgeId = edgeId;
      }

      if (d.source && d.target) {
        edges.push(d);
      }
    });

    const nodes = [];
    _.map(originalData.nodes, (node) => {
      const d = getNodeInstance(node);
      // @ts-ignore
      nodes.push(d);
    });

    return {
      ...flowData,
      edges,
      nodes,
    };
  };

  /**
   * 保存策略流时的节点实例
   * @param node
   * @returns {{data: (*|{}), nodeKey: *, nodeDefinitionId: *}}
   */
  const getNodeInstance = (node) => {
    const nodeData = node.data || {};
    const formData = nodeData.data || {};
    const nodePorts = _.map(node.ports.items, (item) => {
      const data = item.data || item;
      return {
        name: item.name || item.id,
        attrs: item.attrs,
        data: {
          name: data.name || data.id,
          label: data.label,
          count: data.count,
          group: data.group,
        },
      };
    });
    const configData = nodeData.configData || {};
    const nodeDefinitionId = configData.nodeId || nodeData.nodeDefinitionId;
    const keys = ['name', 'code', 'nodeId', 'nodeType', 'primitive', 'icon'];
    const infoKeys = [
      'color',
      'displayName',
      'description',
      'outputFields',

      'async',
      'maxTries',
      'storeOutput',
      'retryOnFail',
      'failureBranch',
      'continueOnFail',
      'retryWaitTimeMills',
    ];

    const d = {
      data: formData,
      ports: nodePorts,
      nodeKey: node.id,
      nodeDefinitionId,
      ...node.size,
      ...node.position,
      ..._.pick(configData, keys),
      ..._.pick(nodeData, infoKeys),
    };

    let nodeInstanceId;
    if ((nodeInstanceId = curFlowIdData.nodeIds[d.nodeKey])) {
      d.nodeInstanceId = nodeInstanceId;
    }

    d.inheritPrevData = true;

    return d;
  };

  const updateNodeData = (data, options, node = selectCellRef.current) => {
    if (node) {
      let nodeStatus;
      if (data && data.nodeKey && (nodeStatus = statusMap[data.nodeKey])) {
        data.nodeStatus = nodeStatus;
      }

      if (curLoopNode) {
        updateLoopData(data);
      }

      node.setData(data, options);
      setCurNodeData({
        ...curNodeData,
        ...data,
      });

      if (options && options.overwrite) {
        resetChildrenData(node);
      }
    }
  };

  /**
   * 监听节点配置数据改变，更新节点数据
   * @type {"../index".DebouncedFunc<(p1?:*, p2?:*)>}
   */
  const handleDataChange = _.debounce((data, options) => {
    updateNodeData(data, options);
    if (options && options.overwrite) {
      saveFlowCache();
    }
  }, 200);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const closePreviewNode = () => {
    // setPreviewStatus('')
    setPreviewNodeVisible(false);
  };

  const handlePreviewCollapsed = (c) => {
    setPreviewStatus(!c ? 'open' : 'close');
  };

  const handleConfigShown = (node) => {
    getOutputFieldsByNodeKey(node.id);
  };

  const handleConfigHidden = (node) => {
    setCurConfigCell(null);
  };

  const handleShowNodeConfig = (nodeId) => {
    setCurConfigCell(nodeId);
  };

  /**
   * 获取输出字段
   * @param nodeKey
   * @returns {Promise.<void>}
   */
  const getOutputFieldsByNodeKey = async (nodeKey) => {
    const result = await BuilderService.fetchInputFields({
      nodeKey,
      workflowInstanceId,
    });

    let fields: any[] = [], files: any[] = [];
    if (result) {
      _.each(result, item => {
        _.each(item.fields, field => {
          if (field.type === 'FILE') {
            files.push({
              value: field.value,
              label: field.label,
              children: field.subFields
            })
          }
        })

        const fds = _.filter(item.fields, field => field.type !== 'FILE');
        if (fds.length) {
          fields.push({
            ...item,
            fields: fds
          })
        }
      })
    }

    setOutputFiles(files);
    setOutputFields(fields);
  };

  const saveWorkflowBuilderCache = () =>
    new Promise(async (resolve) => {
      setNodeChange(true);

      const flowData = getFlowData();

      await BuilderService.saveWorkflowBuilderCache({
        data: flowData,
      });

      resultDataCache = {};

      resolve(true);
    });

  const saveFlowCache = _.debounce(saveWorkflowBuilderCache, 500);

  /**
   * 发布策略流
   * @returns {Promise<void>}
   */
  const publishFlow = () => {
    return new Promise(async (resolve, reject) => {
      const result = await publishBuilderRequest.runAsync({
        workflowInstanceId: flowInstance.workflowInstanceId,
      });

      if (result) {
        message.success(t('common.notification.success.title'));
        resolve(result)
      } else {
        reject(result)
      }
    })
  };

  /**
   * 当正在编辑循环节点时保存策略流
   * @returns {Promise<void>}
   */
  const saveAllFlowDraft = async () => {
    if (curLoopNode) {
      const flowData = getFlowData();
      const type = flowData.workflowInstanceId ? 'put' : 'post';
      const resData = await saveBuilderDraftRequest.runAsync({
        data: flowData,
        method: type,
      });

      saveIds(resData);

      const workflowInstanceId = resData?.workflowInstanceId;

      if (flowCacheList.length) {
        const { flowData } = flowCacheList[0];
        _.find(flowData.nodes, (node) => {
          if (node.nodeKey === curLoopNode.id) {
            node.data = node.data || {};
            node.data.workflow_instance_id = workflowInstanceId;
            return true;
          } else {
            return false;
          }
        });
        const type = flowData.workflowInstanceId ? 'put' : 'post';
        const result = await saveBuilderDraftRequest.runAsync({
          data: flowData,
          method: type,
        });

        if (result) {
          setNodeChange(false);
          message.success(t('common.notification.success.title'));
        }
      }
    }
  };

  /**
   * 保存策略流
   * @returns {Promise.<void>}
   */
  const saveFlowDraft = (silence?: boolean) => {
    return new Promise(async (resolve, reject) => {
      const flowData = getFlowData();
      const type = flowData.workflowInstanceId ? 'put' : 'post';

      if (curLoopNode) {
        loopNodeData = {
          id: curLoopNode.id,
        };
      }

      const result = await saveBuilderDraftRequest.runAsync({
        data: flowData,
        method: type,
      });

      saveIds(result);

      if (result) {
        if (!silence) {
          setNodeChange(false);
          message.success(t('common.notification.success.title'));
        }

        try {
          loopNodeData.workflowInstanceId = result.workflowInstanceId;
        } catch (e) {}

        resolve(result);
      } else {
        reject(result);
      }
    });
  };

  const saveIds = (result) => {
    if (!result) return;

    _.map(result.edges, (item) => {
      curFlowIdData.edgeIds[[item.source, item.target].join('-')] = item.edgeId;
    });
    _.map(result.nodes, (item) => {
      curFlowIdData.nodeIds[item.nodeKey] = item.nodeInstanceId;
    });
  };

  const postExecuteOutput = async (nodes, curNodeId?: string) => {
    const nodeKeys = _.map(nodes, (item) => item.nodeKey);
    const executeResult = await executeBuilderRequest.runAsync({
      workflowInstanceId,
      params: {
        nodeKeys: nodeKeys.join(','),
      },
    });

    if (executeResult) {
      const map = {};
      _.each(executeResult.nodeExecutions, (result, nodeKey) => {
        if (result) {
          map[nodeKey] = result.status || 'FAILED';
        }
        resultDataCache[nodeKey] = result || {};
      });

      setStatusMap(map);

      if (curNodeId) {
        setExecuteData(resultDataCache[curNodeId] || {});
      }
      setAllExecuteData(executeResult.nodeExecutions);
    }
  };

  const getConfigPanel = () => {
    if (!isSelected || !selectedId) return null;

    const node = selectCellRef.current;

    return (
      <CurContext.Provider
        value={{
          node,
          executeData,
          allExecuteData,
          pageMode: mode,
          nodeId: selectedId,
          configCell: curConfigCell,
          inputFiles: outputFiles,
          inputFields: outputFields,
          flowKey: flowInstance.flowKey,
          nodeData: curNodeData || node?.data,
          executeLoading: executeBuilderNodeRequest.loading,
          onExecute: doNodeExecute,
          onChange: handleDataChange,
          onConfigShown: handleConfigShown,
          onConfigHidden: handleConfigHidden,
          onShowNodeConfig: handleShowNodeConfig,
        }}
      >
        <ConfigPanel />
      </CurContext.Provider>
    );
  };

  const getExecutePreview = () => {
    const curNode = selectCellRef.current;

    if (!isShowExecutePreview) return null;

    return (
      <ExecutePreview
        nodeId={curNode?.id}
        allExecuteData={allExecuteData}
        defaultCollapsed={previewStatus === 'close'}
        onClose={closePreviewNode}
        onCollapsed={handlePreviewCollapsed}
      />
    );
  };

  return (
    <div className={cls(styles.canvas, styles[curLayout], styles[mode])}>
      <div className={cls(styles.sider, { [styles.collapsed]: collapsed })}>
        <div className={styles.siderHeader}>
          {collapsed ? (
            <div onClick={toggleCollapsed} className={styles.headerView}>
              <div className={styles.extendBtn}>
                <DoubleRightOutlined />
              </div>
              <div className={styles.title}>
                {t('workflow.builder.panel.nodes.title')}
              </div>
            </div>
          ) : (
            <Row justify="space-between" align="middle">
              <Col>
                  <span className={styles.title}>
                      {t('workflow.builder.panel.nodes.title')}
                  </span>
              </Col>
              <Col>
                <div className={styles.extendBtn} onClick={toggleCollapsed}>
                  <DoubleLeftOutlined />
                </div>
              </Col>
            </Row>
          )}
        </div>
        <div id="stencil" />
      </div>
      <div
        className={cls(styles.panel, {
          [styles['exp' + previewStatus]]: isShowExecutePreview,
          [styles.showConfig]: !!(isSelected && selectedId),
        })}
      >
        {getToolbar()}
        {breadcrumb()}
        {getGraphContainer()}
        {getConfigPanel()}
        {getExecutePreview()}
      </div>
    </div>
  );
};

// @ts-ignore
export default forwardRef(Canvas);
