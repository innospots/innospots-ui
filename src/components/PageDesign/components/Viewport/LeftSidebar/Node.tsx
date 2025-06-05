import _ from 'lodash'
import { useModel } from 'umi'
import cls from 'classnames';
import { useState } from 'react';
import { Row, Col } from 'antd';
import { DownOutlined, PlusOutlined, SettingOutlined, RollbackOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';

import WidgetList from './WidgetList';
import ResourceList from './ResourceList';
import Tabs from '../../CustTabs'

import styles from './style.less';

const itemTabs = [
  {
    key: 'resource',
    label: '应用资源',
  },
  {
    key: 'widgets',
    label: 'UI控件',
  },
];

const NodeLeftSidebar = () => {
  const { nodeEditPage, setNodeEditPage } = useModel('AppEditor', (model) => ({
    nodeEditPage: model.nodeEditPage,
    setNodeEditPage: model.setNodeEditPage,
  }));
  const { getNodePorts } = useModel('FlowNode', (model) => ({
    getNodePorts: model.getNodePorts,
  }));

  const [curTab, setCurTab] = useState(itemTabs[0].key);

  const toggleNodePage = () => {
    setNodeEditPage(nodeEditPage === 'io' ? 'config' : 'io')
  }

  const renderResourceList = () => {
    return (
      <div className={styles.resource}>
        <div className={styles.widgetsTitle}>
          <div>
            <DownOutlined /> 控件
          </div>
          <span className="g-button" onClick={() => setCurTab('widgets')}>
            <PlusOutlined />
          </span>
        </div>
        <div className={cls(styles.listWrapper, 'custom-scrollbar')}>
          {/*应用资源*/}
          <ResourceList />
        </div>
        <div className={styles.widgetsTitle}>
          <div>
            <DownOutlined /> 输入输出
          </div>
          <span className="g-button" onClick={toggleNodePage}>
            {
              nodeEditPage === 'io' ? (
                <RollbackOutlined />
              ) : (
                <SettingOutlined />
              )
            }
          </span>
        </div>
        <div className={cls(styles.listWrapper, 'custom-scrollbar')}>
          {
            ['in', 'out'].map(type => {
              const ports = getNodePorts(`${type}Ports`)
              return _.map(ports, (port, index) => (
                <Row key={`${type}_${index}`} gutter={8} style={{marginBottom: 8, lineHeight: '24px'}}>
                  <Col>
                    {
                      type === 'in' ? (
                        <ExportOutlined />
                      ) : (
                        <ImportOutlined />
                      )
                    }
                  </Col>
                  <Col>
                    {`${_.upperFirst(type)}Put${index + 1}`}
                  </Col>
                </Row>
              ))
            })
          }
        </div>
      </div>
    );
  };

  const renderWidgetList = () => {
    return <WidgetList />
  }

  return (
    <>
      <div className={cls(styles.wrapper, styles.nodeLeftbar)}>
        <div className="editor-top-bar">
          <Tabs activeKey={curTab} items={itemTabs} onChange={setCurTab} />
        </div>
        <div
          className={cls(styles.bottomContainer, { [styles.showWidgets]: curTab === 'widgets' })}
        >
          { renderResourceList() }
          { renderWidgetList() }
        </div>
      </div>
    </>
  );
};

export default NodeLeftSidebar;
