import React, { useMemo, useState } from 'react';

import cls from 'classnames';
import { useModel } from 'umi';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

import { WIDGET_SETTINGS } from '../../selectors';

import Tabs from '../../CustTabs'
import { NodeSetting } from '../Settings';
import CustomSuspense from '../../CustomSuspense';
import NodeViews from './NodeViews'

import styles from './style.less';

const NodeConfigPreview = React.lazy(() => import('./NodeConfigPreview'));

const itemTabs = [
  {
    key: 'config',
    label: '配置参数',
  },
  {
    key: 'preview',
    label: '配置预览',
  },
];

const RightSidebar = () => {

  const [curTab, setCurTab] = useState(itemTabs[0].key);
  const { commonState, nodeEditPage, selectedWidget } = useModel('AppEditor', (model) => ({
    commonState: model.commonState,
    nodeEditPage: model.nodeEditPage,
    selectedWidget: model.selectedWidget,
  }));

  const WidgetSettings = useMemo(() => {
    if (selectedWidget) {
      return WIDGET_SETTINGS[selectedWidget.type];
    } else {
      return null;
    }
  }, [selectedWidget]);

  const isActive = useMemo(() => !!WidgetSettings, [WidgetSettings]);

  const toggleRightSidebar = () => {
    commonState.rightSidebarCollapsed = !commonState.rightSidebarCollapsed;
  };

  const renderSettingContent = () => {
    let Content: any = NodeSetting;

    if (nodeEditPage === 'io') {
      Content = NodeConfigPreview;
    } else if (nodeEditPage === 'config' && WidgetSettings) {
      Content = WidgetSettings;
    }

    return (
      <CustomSuspense>
        <Content />
      </CustomSuspense>
    );
  };

  const renderTopbar = () => {
    let label = '';

    if (nodeEditPage === 'io') {
      label = '节点预览';
    } else {
      label = isActive ? '控件设置' : '页面设置';
    }

    return (
      <div className="editor-top-bar">
        <p className="top-bar-title">{label}</p>
        <span className="g-button" onClick={toggleRightSidebar}>
          <DoubleRightOutlined />
        </span>
      </div>
    );
  };

  const renderCommonSettings = () => {
    return (
      <>
        {renderTopbar()}
        <div className={cls(styles.settingContainer, 'custom-scrollbar')}>
          {renderSettingContent()}
        </div>
      </>
    );
  };

  const renderCodeSettings = () => {
    return (
      <>
        <div className="editor-top-bar">
          <Tabs activeKey={curTab} items={itemTabs} onChange={setCurTab} />
          <span className="g-button" onClick={toggleRightSidebar}>
            <DoubleRightOutlined />
          </span>
        </div>
        <div className={cls(styles.settingContainer, 'custom-scrollbar')}>
          <CustomSuspense>
            { curTab === 'config' ? <NodeViews /> : <NodeConfigPreview /> }
          </CustomSuspense>
        </div>
      </>
    );
  };

  const renderSettings = () => {
    return nodeEditPage === 'code' ? renderCodeSettings() : renderCommonSettings()
  };

  return (
    <div id="WidgetSettingContainer" className={styles.wrapper}>
      <div className="right-sidebar-inner">
        { !commonState.rightSidebarCollapsed && renderSettings() }
      </div>
      <div className="right-sidebar-collapsed" onClick={toggleRightSidebar}>
        <DoubleLeftOutlined style={{ fontSize: 16, color: '#666' }} />
      </div>
    </div>
  );
};

export default RightSidebar;
