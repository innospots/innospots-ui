import React from 'react';
import { Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import styles from './style.less';

export type ChatHeaderProps = {
  style?: React.CSSProperties;
  title?: React.ReactNode | string;
  extra?: React.ReactNode;
  onClose?: () => void;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ style, title, extra, onClose }) => {
  return (
    <div className={styles.chatHeader} style={style}>
      <div className={styles.inner}>
        <div className={styles.title}>{title}</div>
        <div className={styles.extra}>
          <Space>
            {extra}
            <div className={styles.iconButton} onClick={onClose}>
              <CloseOutlined />
            </div>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
