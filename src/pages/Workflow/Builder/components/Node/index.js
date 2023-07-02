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

import React, {useRef, useMemo, useState, useEffect} from 'react';
import _ from 'lodash';
import cls from 'classnames';
import {Image, Popconfirm, Spin} from 'antd';
import {
  WarningFilled, CloseCircleFilled, CheckCircleFilled, PlusCircleOutlined,
} from '@ant-design/icons';

import {useDeepCompareEffect} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import NodeIcon, {renderNodeIcon} from '../NodeIcon';
import {STRESS_COLOR, FAILURE_BRANCH_PORT_ID} from '../../common/constants';

import styles from './index.less';

const NODE_INFO_KEYS = ['icon', 'color', 'name', 'displayName', 'description'];

const Node = ({node}) => {
  const {t} = useI18n(['workflow', 'common']);
  const nodeData = _.get(node, 'data', {});
  const nodeConfig = _.get(node, 'data.configData', {});
  const nodeCode = (nodeData.code || '').toLowerCase();
  const editAble = nodeData.pageMode === 'edit';

  const movedRef = useRef(false);

  const [nodeHover, setNodeHover] = useState(false);

  const inPorts = useMemo(() => nodeConfig.inPorts, [nodeConfig.inPorts]);
  const outPorts = useMemo(() => nodeConfig.outPorts, [nodeConfig.outPorts]);

  const nodeInfo = useMemo(() => {
    return {
      ..._.pick(nodeData, NODE_INFO_KEYS),
    };
  }, [nodeData]);

  useEffect(() => {
    node.on('change:position', () => {
      movedRef.current = true;
    });

    node.on('anchor-change', handleAnchorChange);

    return () => {
      node.off();
    };
  }, []);

  useDeepCompareEffect(() => {
    createNodePorts();
  }, [inPorts, outPorts]);

  useEffect(() => {
    const hasPort = node.hasPort(FAILURE_BRANCH_PORT_ID);
    if (nodeData.failureBranch) {
      if (!hasPort) {
        node.addPort({
          id: FAILURE_BRANCH_PORT_ID, group: 'out', attrs: {
            circle: {
              fill: STRESS_COLOR,
            },
          },
        });
      }
    } else if (hasPort) {
      node.removePort(FAILURE_BRANCH_PORT_ID);
    }
  }, [nodeData.failureBranch]);

  const nodeIcon = useMemo(() => renderNodeIcon(nodeInfo), [nodeInfo]);

  const descNode = useMemo(() => {
    if (nodeInfo.description) {
      return <div className={styles.nodeDesc}>{nodeInfo.description}</div>;
    }

    return null;
  }, [nodeInfo.description]);

  const handleAnchorChange = (event) => {
    const portIndex = event.index;
    const portType = event.type || 'inPorts';
    const ports = nodeConfig[portType];
    const nodePort = node.getPortAt(portIndex);

    ports[portIndex] = event.data;

    node.setData({
      configData: {
        [portType]: ports,
      },
    }, {deep: true},);

    if (nodePort) {
      if (portType === 'outPorts') {
      }
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();

    node.off();
    node.remove();
  };

  const handleExecute = (event) => {
    node._model.graph.trigger('node:menu-click', {
      cell: node, type: 'execute',
    });
  };

  const handleEditLoop = (event) => {
    node._model.graph.trigger('node:menu-click', {
      cell: node, type: 'loop-edit',
    });
  };

  const menuNode = useMemo(() => {
    if (!editAble || nodeCode === 'next_loop') {
      return null;
    }

    const enableDelete = nodeConfig.enableDelete || nodeConfig.primitive !== 'trigger';

    return (
      <div className={cls(styles.menu, {[styles.defaultNode]: !enableDelete})}>
        {enableDelete && (
          // <Popconfirm
          //   title={t('workflow.builder.delete_confirmation')}
          //   onConfirm={handleDelete}
          //   okText={t('common.button.confirm')}
          //   cancelText={t('common.button.cancel')}
          // >
            <NodeIcon className={styles.icon} type="flow-node-delete" onClick={handleDelete}/>
          // </Popconfirm>
        )}
        <NodeIcon type="flow-node-play" className={styles.icon} onClick={handleExecute}/>
        {/*<NodeIcon type="flow-node-suspend" className={styles.icon}/>*/}
      </div>
    );
  }, [nodeConfig, editAble]);

  const loopIcon = useMemo(() => {
    if (nodeData.code === 'LOOP') {
      return (<div className={styles.loopIcon} onClick={handleEditLoop}>
          <PlusCircleOutlined/>
        </div>);
    } else {
      return null;
    }
  }, [nodeData.code]);

  const iconStyle = useMemo(() => {
    const style = {};
    const {iconWidth, iconHeight} = nodeConfig;

    if (iconWidth) {
      style.width = iconWidth;
    }

    if (iconHeight) {
      style.height = iconHeight;
    }

    return style;
  }, [nodeConfig.iconWidth, nodeConfig.iconHeight]);

  const createNodePorts = () => {
    // node.removePorts();
    const ports = [];

    const getAttrs = (port) => {
      if (port.disabled) {
        return {
          circle: {
            fill: STRESS_COLOR,
          },
        };
      }
      return {};
    };

    _.each(inPorts, (port) => {
      ports.push({
        id: port.id || port.name,
        group: port.group || 'in',
        attrs: getAttrs(port), data: {
          ...(port.data || port),
        },
      });
    });

    _.each(outPorts, (port) => {
      ports.push({
        id: port.id || port.name,
        group: port.group || 'out',
        attrs: getAttrs(port), data: {
          ...(port.data || port),
        },
      });
    });

    node.addPorts(ports);
  };

  const handleClickNode = () => {
    if (nodeData.__selected || movedRef.current) {
      movedRef.current = false;
      return;
    }

    node._model.graph.trigger('node:cur-select', {
      cell: node, trigger: true,
    });
  };

  const handleHoverNode = () => {
    setNodeHover(true);
  };

  const handleLeaveNode = () => {
    setNodeHover(false);
  };

  const wrapperCls = useMemo(() => {
    return cls(styles.nodeWrapper, {
      [styles.nodeHover]: nodeHover, [styles.nodeActive]: nodeData.__selected, [styles.executing]: nodeData.executing
    });
  }, [nodeHover, nodeData.__selected, nodeData.executing]);

  const nodeCls = useMemo(() => {
    return cls(styles.nodeInner, {
      [styles.active]: nodeData.__selected, // [styles.running]: nodeData.category === 'MYSQL'
    });
  }, [nodeData.__selected, nodeData.category]);

  const statusNode = useMemo(() => {
    if (!nodeData.nodeStatus || nodeCode === 'start') return null;

    let icon;
    switch (nodeData.nodeStatus) {
      case 'FAILED':
        icon = <CloseCircleFilled className={cls(styles.icon, styles.fail)}/>;
        break;

      case 'COMPLETE':
        icon = <CheckCircleFilled className={cls(styles.icon, styles.success)}/>;
        break;

      case 'WARNING':
        icon = <WarningFilled className={cls(styles.icon, styles.warning)}/>;
        break;

      default:
        icon = null;
        break;
    }

    return <div className={styles.statusNode}>{icon}</div>;
  }, [nodeData.nodeStatus]);

  return (
    <div className={wrapperCls}>
      <div className={styles.spin}>
        <Spin/>
      </div>
      <div onMouseEnter={handleHoverNode} onMouseLeave={handleLeaveNode}>
        {menuNode}
        {loopIcon}
        {statusNode}
        <div className={nodeCls} onClick={handleClickNode}>
          {nodeIcon}
        </div>
      </div>
      <div className={styles.nodeName}>{nodeInfo.displayName || nodeInfo.name}</div>
      {descNode}
    </div>
  );
};

export default Node;
