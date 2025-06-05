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

import React, {forwardRef, useContext, useEffect, useMemo, useRef, useState} from 'react';
import _ from 'lodash';
import cls from 'classnames';
import {useModel, useParams} from 'umi';
import {JQuery} from '@antv/x6'
import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';

import FlowGraph from '../../../Workflow/Builder/Graph'
import * as BuilderService from '@/services/Builder';
import localStorage from '@/common/utils/LocalStorage';

import styles from './index.less';
import InstanceContext from '../../contexts/InstanceContext';
import ExecutePreview from "../ExecutePreview";

/**
 * 执行结果数据缓存
 * @type {{}}
 */
const resultDataCache = {};

let curLoopNode,
  loopNodeData;

const defaultPreviewStatus = localStorage.get('flowPreviewStatus') || 'open';

const nodeConfigData = {};

const Canvas: React.FC<{
    mode?: 'preview' | 'edit',
    workflowInstanceId: string | number,
    onNodeChange?: (isChange: boolean) => void,
}> = ({mode = 'preview', workflowInstanceId}) => {

  const {
    flowDetailRequest
  } = useModel('Instances');

  const {
    detailUrl
  } = useContext(InstanceContext)
  const { workflowType } = useParams();
  const selectCellRef = useRef<any>(null);
  const graphContainerRef = useRef(null);

  const [statusMap, setStatusMap] = useState({});



  /**
   * 执行结果数据
   */
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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    createGraph();
  }, []);

  useEffect(() => {
    _.each(statusMap, (status, nodeId) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      updateNodeStatus(nodeId, status);
    });
  }, [statusMap]);

  useEffect(() => {
    if (detailUrl !== '') {
      getWorkflowBuilder()
    }
  }, [detailUrl]);

  useEffect(() => {
    localStorage.set('flowPreviewStatus', previewStatus);
  }, [previewStatus]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    addEvents();
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return () => removeEvents();
  }, []);

  const closePreviewNode = () => {
    // setPreviewStatus('')
    setPreviewNodeVisible(false);
  };

  const handlePreviewCollapsed = (c) => {
    setPreviewStatus(!c ? 'open' : 'close');
  };


  const onWindowResize = _.debounce(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    FlowGraph.resize(getContainerSize());
  }, 500);

  const removeEvents = () => {
    JQuery(window).off('resize.flow', onWindowResize);
  };

  const addEvents = () => {
    JQuery(window).on('resize.flow', onWindowResize);
  };

  const updateNodeStatus = (nodeId, nodeStatus) => {
    if (nodeId && nodeStatus) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const node = getCell(nodeId);
      if (node) {
        node.updateData({
          nodeStatus,
        });
      }
    }
  };

  const getWorkflowBuilder = async () => {
    const urlParams: any[] = detailUrl?.split('/') || []
    if (urlParams.length <= 0) return
    const resData = await BuilderService.fetchWorkflowBuilder(workflowType, {
      workflowInstanceId: urlParams[4],
      version: urlParams[-1],
    });

    if (resData && resData.nodes && resData.nodes.length) {
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
              // eslint-disable-next-line @typescript-eslint/no-shadow
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

      postExecuteOutput();
    }
  };

  const handleCellCallback = (name, event) => {
    const cell = event.cell;
    switch (name) {
    case 'node:cur-select':
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      updateSelectedCell(cell);
      break;

    case 'blank:click':
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      updateSelectedCell(null);
      break;

    default:
      // console.info(name, event)
      break;
    }
  };

  const updateSelectedCell = (cell) => {
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
      // eslint-disable-next-line no-param-reassign
      cell = curLoopNode;
    }

    selectCellRef.current = cell;

    const selected = !!cell;

    setPreviewNodeVisible(selected);
  };

  const getCell = (id) => FlowGraph.graph.getCell(id);

  const createGraph = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const options = getGraphOptions();
    FlowGraph.init({
      ...options,
    }, mode);
  };

  const getGraphOptions = () => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
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

  // 获取执行结果（节点状态）
  const postExecuteOutput = async () => {
    const executeResult = await flowDetailRequest.runAsync(workflowInstanceId);

    if (executeResult) {
      const map = {};
      _.each(executeResult.nodeExecutions, (result, nodeKey) => {
        if (result) {
          map[nodeKey] = result.status || 'FAILED';
        }
        resultDataCache[nodeKey] = result || {};
      });

      setStatusMap(map);
      setAllExecuteData(executeResult.nodeExecutions);
    }
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
    <div className={cls(styles.canvas, styles[mode])}>
      <div
        className={cls(styles.panel, {
          [styles['exp' + previewStatus]]: isShowExecutePreview,
          // [styles.showConfig]: !!(isSelected && selectedId),
        })}
      >
        {getGraphContainer()}
        {getExecutePreview()}
      </div>
    </div>
  );
};

// @ts-ignore
export default forwardRef(Canvas);
