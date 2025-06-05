import cls from 'classnames';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useModel } from 'umi';
import { Tabs, Input, Button } from 'antd';
import { SendOutlined, MessageOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import ChatList from '../components/ChatList';
import ChatViews from '../components/views/ChatViews';

import styles from './style.less';

const { TextArea } = Input;

const Chats: React.FC = () => {
  const { t } = useI18n(['app', 'common']);
  const [inputMessage, setInputMessage] = useState<string>('');
  const {
    loading,
    pageTabs,
    currentTabKey,
    chatDataList,
    resetChatData,
    stopChatMessage,
    setCurrentTabKey,
    curConversationId,
    submitChatMessage,
    createConversation,
    sessionMessagesLoading,
    lastSessionMessagesLoading,
  } = useModel('ChatData', (model) => ({
    loading: model.loading,
    pageTabs: model.pageTabs,
    chatDataList: model.chatDataList,
    currentTabKey: model.currentTabKey,
    curConversationId: model.curConversationId,
    resetChatData: model.resetChatData,
    stopChatMessage: model.stopChatMessage,
    setCurrentTabKey: model.setCurrentTabKey,
    submitChatMessage: model.submitChatMessage,
    createConversation: model.createConversation,
    sessionMessagesLoading: model.sessionMessagesLoading,
    lastSessionMessagesLoading: model.lastSessionMessagesLoading,
  }));

  const isLoading = loading || sessionMessagesLoading || lastSessionMessagesLoading;

  const conversationIdRef = useRef<string>(curConversationId);

  useEffect(() => {
    conversationIdRef.current = curConversationId;
  }, [curConversationId]);

  useEffect(() => {
    console.log('curConversationId', curConversationId);
  }, [])

  useEffect(() => {
    return () => {
      resetChatData(conversationIdRef.current)
    }
  }, [])

  const showNewChatButton = useMemo(() => {
    return chatDataList.length > 0 && !lastSessionMessagesLoading
  }, [ chatDataList, lastSessionMessagesLoading ])

  const sendChatMessage = () => {
    if (!inputMessage || isLoading) return;
    submitChatMessage(inputMessage, (isError: boolean = false) => {
      if (!isError) {
        setInputMessage('');
      }
    });
  };

  const handlePressEnter = (e: any) => {
    if (!e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const chatTabs = useMemo(() => {
    return pageTabs.map((item) => ({
      ...item,
      children: (
        <div className={cls(styles.content, item.key)}>
          {item.key === 'chat' ? <ChatList /> : <ChatViews viewType={item.key} />}
        </div>
      ),
    }));
  }, [currentTabKey, pageTabs, chatDataList]);

  const renderChatForm = () => {
    return (
      <div className={styles.form}>
        <TextArea
          rows={1}
          bordered={false}
          value={inputMessage}
          maxLength={1000}
          placeholder={t('app.chat.input.placeholder')}
          autoSize={{ minRows: 1, maxRows: 6 }}
          onPressEnter={handlePressEnter}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <div className={cls(styles.controls, loading && styles.loading)}>
          <Button
            size="small"
            type="primary"
            loading={isLoading}
            icon={<SendOutlined />}
            disabled={!inputMessage}
            onClick={sendChatMessage}
            className={styles.sendButton}
          />
          <div className={styles.stopButton} onClick={() => stopChatMessage()}>
            <svg color="currentColor" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <title>Stop</title>
              <rect
                fill="currentColor"
                height="250"
                rx="24"
                ry="24"
                width="250"
                x="375"
                y="375"
              ></rect>
              <circle
                cx="500"
                cy="500"
                fill="none"
                r="450"
                stroke="currentColor"
                strokeWidth="100"
                opacity="0.45"
              ></circle>
              <circle
                cx="500"
                cy="500"
                fill="none"
                r="450"
                stroke="currentColor"
                strokeWidth="100"
                strokeDasharray="600 9999999"
              >
                <animateTransform
                  attributeName="transform"
                  dur="1s"
                  from="0 500 500"
                  repeatCount="indefinite"
                  to="360 500 500"
                  type="rotate"
                ></animateTransform>
              </circle>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderNewChatButton = () => {
    return (
      <div className={styles.newChat}>
        <Button size="small" disabled={sessionMessagesLoading} onClick={() => createConversation()}><MessageOutlined />新建对话</Button>
      </div>
    )
  }

  const renderChatContent = () => {
    return (
      <div className={cls(styles.chatContainer, {
        [styles.showNewButton]: showNewChatButton
      })}>
        <Tabs
          items={chatTabs}
          destroyInactiveTabPane={false}
          activeKey={currentTabKey}
          onChange={setCurrentTabKey}
        />
        {showNewChatButton && renderNewChatButton()}
      </div>
    );
  };

  return (
    <div className={styles.chats}>
      {renderChatContent()}
      {renderChatForm()}
    </div>
  );
};

export default Chats;
