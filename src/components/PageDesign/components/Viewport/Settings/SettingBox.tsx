import React, { useState } from 'react';
import cls from 'classnames'

import {DownCircleOutlined, UpCircleOutlined} from '@ant-design/icons';

import styles from '../style.less'

type PropsType = {
  title?: string
  hideCollapsed?: boolean
}

export const SettingBox:React.FC<PropsType> = ({ title, hideCollapsed, children }) => {

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cls(styles.settingBox, { [styles.collapsed]: collapsed })}>
      {
        title && (
          <div className="editor-top-bar" onClick={() => !hideCollapsed && setCollapsed(!collapsed)}>
            <p className="top-bar-title">{ title }</p>
            {
              !hideCollapsed && (
                <span className="g-button">
                  {
                    collapsed ? <UpCircleOutlined /> : <DownCircleOutlined />
                  }
                </span>
              )
            }
          </div>
        )
      }
      <div className={styles.settingItems}>
        { children }
      </div>
    </div>
  )
}