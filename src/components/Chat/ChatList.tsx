import React from 'react';
import cls from 'classnames';
import { Avatar } from 'antd';

import styles from './style.less';

const ChatList = () => {
  return (
    <div className={cls(styles.chatList, 'chat-list', 'custom-scrollbar')}>
      <div className={cls(styles.chatListItem, styles.user)}>
        <div className={styles.avatar}>
          <Avatar size={40} src="https://joeschmoe.io/api/v1/random" />
        </div>
        <div className={styles.bubbleWrapper}>
          <div className={styles.bubble}>
            <div className={styles.bubbleText}>
              指定 Modal 挂载的节点，但依旧为全局展示，false 为挂载在当前位置。为符合 React 18 concurrent 标准，从 4.20.x 起 getContainer 需要始终返回唯一 dom 节点指定 Modal 挂载的节点，但依旧为全局展示，false 为挂载在当前位置。为符合 React 18 concurrent 标准，从 4.20.x 起 getContainer 需要始终返回唯一 dom 节点
            </div>
          </div>
        </div>
      </div>
      <div className={cls(styles.chatListItem, styles.system)}>
        <div className={styles.avatar}>
          <Avatar size={40} src="https://joeschmoe.io/api/v1/random" />
        </div>
        <div className={styles.bubbleWrapper}>
          <div className={styles.bubble}>
            <div className={styles.bubbleText}>
              <span>Hello</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
