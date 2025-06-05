import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import { Empty, Spin } from 'antd';
// import VirtualList from 'rc-virtual-list';
import React, { useRef, useEffect, useState } from 'react';

import ChatListItem from './ChatListItem';

import styles from './style.less';

type ChatListProps = {};

const TOLERANCE = 10
const ChatList: React.FC<ChatListProps> = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollReachEnd, setScrollReachEnd] = useState(true);
  const { chatDataList, updateCount, lastMessageLoaded } = useModel('ChatData', (model) => ({
    updateCount: model.updateCount,
    chatDataList: model.chatDataList,
    lastMessageLoaded: model.lastMessageLoaded,
    listLoading: model.lastSessionMessagesLoading
  }));

  useEffect(() => {
    if (updateCount && listRef.current && scrollReachEnd) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
    }
  }, [updateCount]);

  const renderEmpty = () => {
    return (
      <div className={cls(styles.empty)}>
        {lastMessageLoaded ? <Empty description={false} /> : <Spin />}
      </div>
    );
  };

  const onInternalScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;

    setScrollReachEnd(
      target.scrollHeight - Math.abs(target.scrollTop) - target.clientHeight <= TOLERANCE,
    );
  };

  const renderChatList = () => {
    return (
      <div className={cls(styles.chatList, 'custom-scrollbar')} ref={listRef} onScroll={onInternalScroll}>
        {_.map(chatDataList, (item) => {
          return <ChatListItem key={item.id} data={item.data} isQuestion={item.type === 'user'} />;
        })}
      </div>
    );
  };

  return chatDataList.length > 0 ? renderChatList() : renderEmpty();
};

export default ChatList;
