import React from 'react';
import cls from 'classnames';
import { useModel } from 'umi';
import { Divider } from 'antd';
import {
  RedoOutlined,
  UndoOutlined,
  TabletOutlined,
  MobileOutlined,
  DesktopOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

import styles from '../EditorContent/style.less';

const platforms = [
  {
    key: 'desktop',
    icon: DesktopOutlined,
  },
  {
    key: 'tablet',
    icon: TabletOutlined,
  },
  {
    key: 'mobile',
    icon: MobileOutlined,
  },
];

const EditorTopBar: React.FC = () => {
  const { appType, platform, setPlatform, ...actions } = useModel('AppEditor', (model) => ({
    redo: model.redo,
    undo: model.undo,
    appType: model.appType,
    canUndo: model.canUndo,
    canRedo: model.canRedo,
    platform: model.platform,
    setPlatform: model.setPlatform,
  }));
  const { currentAppType, currentAppInfo } = useModel('App', (model) => ({
    currentAppType: model.currentAppType,
    currentAppInfo: model.currentAppInfo
  }));

  const handlePreview = () => {

  }

  return (
    <div className="editor-top-bar">
      <div className={styles.toolbar}>
        {appType === 'app' && (
          <>
            <a className={styles.toolbarItem} target="_blank" href={`/#/app/page/preview/${currentAppInfo?.appKey}`}>
              <PlayCircleOutlined /> 预览
            </a>
            <Divider type="vertical" />
          </>
        )}
        <div
          className={cls(styles.toolbarItem, {
            [styles.disabled]: !actions.canUndo,
          })}
          onClick={actions.undo}
        >
          <UndoOutlined />
        </div>
        <div
          className={cls(styles.toolbarItem, {
            [styles.disabled]: !actions.canRedo,
          })}
          onClick={actions.redo}
        >
          <RedoOutlined />
        </div>
      </div>
      {(appType === 'app' && currentAppType === 'FORM') && (
        <div className={styles.platform}>
          {
            platforms.map(item => (
              <div key={item.key} className={cls(styles.toolbarItem, {
                [styles.active]: item.key === platform
              })} onClick={() => setPlatform(item.key)}>
                <item.icon />
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default EditorTopBar;
