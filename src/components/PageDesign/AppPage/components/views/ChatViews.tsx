import React from 'react';
import cls from 'classnames';
import { useMemo } from 'react';
import { useModel } from 'umi';
import { Row, Col } from 'antd';

import { RenderViewMap } from './index'

import styles from '../style.less';

type ChatViewsProps = {
  viewType: string;
};

const ChatViews:React.FC<ChatViewsProps> = ({ viewType }) => {
  const { currentTabKey, chatDataList } = useModel('ChatData', (model) => ({
    chatDataList: model.chatDataList,
    currentTabKey: model.currentTabKey,
  }));

  const currentChatData = useMemo(() => {
    return chatDataList.filter((item) => item.data.viewType === viewType);
  }, [chatDataList, viewType]);

  const renderList = useMemo(() => {
    const num = currentChatData.length;
    if (num > 0) {
      const RenderView = RenderViewMap[viewType];
      return (
        <Row gutter={[16, 16]}>
          {currentChatData.map((item) => (
            <Col span={num === 1 ? 24 : 12} key={item.id}>
              <div className={cls(styles.chatView, `chat_view_${viewType}`)}>
                <RenderView dataSource={item.data} />
              </div>
            </Col>
          ))}
        </Row>
      );
    }
    return null;
  }, [currentChatData]);

  return <div className={cls(styles.chatViews, 'custom-scrollbar')}>{renderList}</div>;
};

export default ChatViews;
