import React from 'react';
import cls from 'classnames';

import ChatList from './ChatList';
import ChatHeader, { ChatHeaderProps } from './ChatHeader';
import Composer from './Composer';
import { RecorderProps } from './Recorder';

import styles from './style.less';

type ChatProps = {
  platform?: 'mobile' | 'desktop';
  header?: ChatHeaderProps | false;
  onClose?: () => void;
  recorder?: RecorderProps;
};

const Chat = ({ platform = 'desktop', header, recorder, onClose }: ChatProps) => {
  return (
    <div className={cls(styles.chat, { [styles.small]: platform === 'mobile' })}>
      {header !== false && <ChatHeader { ...header } onClose={onClose} />}
      <ChatList />
      <Composer recorder={recorder} />
    </div>
  );
};

export default Chat;