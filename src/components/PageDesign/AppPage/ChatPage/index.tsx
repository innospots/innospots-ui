import { useModel } from 'umi';
import cls from 'classnames';
import { Tabs, List, Typography } from 'antd';
import React, { useMemo, useState, useEffect } from 'react';
import { MinusSquareOutlined, PlusSquareOutlined, CloseSquareOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import WidgetsRender from '@/components/PageDesign/components/WidgetsRender';

import Chats from './Chats';

import { AppPageInfo } from '../Types';

import styles from '../style.less';

const { Text, Paragraph } = Typography;

const ChatPage: React.FC<AppPageInfo> = () => {
  const { t, loading: i18nLoading } = useI18n(['app', 'common']);

  const [currentTabKey, setCurrentTabKey] = useState<string>();
  const [collapse, setCollapse] = useState(false);
  const [showSetting, setShowSetting] = useState(true);

  const { formatedLayout } = useModel('AppEditor', (model) => ({
    formatedLayout: model.formatedLayout,
  }));
  const { currentAppInfo } = useModel('App', (model) => ({
    currentAppInfo: model.currentAppInfo,
  }));
  const { conversations, curConversationId, setChatTabKey, setChatFormInstance, getSessionMessages, getInitialData } = useModel(
    'ChatData',
    (model) => ({
      conversations: model.conversations,
      curConversationId: model.curConversationId,
      setChatTabKey: model.setCurrentTabKey,
      setChatFormInstance: model.setChatFormInstance,
      getSessionMessages: model.getSessionMessages,
      getInitialData: model.getInitialData,
    }),
  );
  const appConfig = useMemo(() => {
    const pages = currentAppInfo?.resources?.pages || [];
    return pages[0]?.configs || {};
  }, [currentAppInfo?.resources]);

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };

  useEffect(() => {
    getInitialData(currentAppInfo?.appKey);
  }, [currentAppInfo?.appKey]);

  useEffect(() => {
    setCollapse(appConfig.collapse);
  }, [appConfig.collapse]);

  const appTabs = useMemo(() => {
    const { widgets } = formatedLayout;
    const tabItems: any[] = [];
    if (widgets?.length && !appConfig.close) {
      tabItems.push({
        key: 'settings',
        label: t('app.chat.setting.title'),
      });
    }
    tabItems.push({
      key: 'conversations',
      label: t('app.chat.conversations.title'),
    });

    return tabItems;
  }, [formatedLayout.widgets, appConfig.close, t]);

  useEffect(() => {
    if (appTabs.length) {
      setCurrentTabKey(appTabs[0].key);
    }
  }, [appTabs.length]);

  const changeConversation = (conversation: any) => (e: any) => {
    e.preventDefault();
    setChatTabKey('chat');
    getSessionMessages(conversation.conversationId);
  };

  const renderConversations = () => {
    return (
      <div
        className={cls(styles.settingsContent, 'custom-scrollbar', {
          [styles.shown]: currentTabKey === 'conversations',
        })}
      >
        <div className={styles.conversations}>
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                className={cls(styles.listItem, {
                  [styles.listActive]: curConversationId === item.conversationId,
                })}
              >
                <List.Item.Meta
                  title={
                    <div style={{ marginTop: 6 }}>
                      <Paragraph
                        ellipsis={{
                          rows: 1,
                        }}
                        title={item.title}
                        style={{ marginBottom: 4 }}
                      >
                        <span className="g-button" onClick={changeConversation(item)}>
                          {item.title}
                        </span>
                      </Paragraph>
                    </div>
                  }
                  description={
                    <p>
                      <Text disabled>{item.createdTime}</Text>
                    </p>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  };

  const renderAppWidgets = () => {
    const { widgets, layouts } = formatedLayout;
    return (
      <div
        className={cls(styles.settingsContent, 'custom-scrollbar', {
          [styles.shown]: currentTabKey === 'settings',
        })}
      >
        <WidgetsRender
          appType="app"
          pageType="preview"
          layouts={layouts}
          widgets={widgets}
          getFormInstance={setChatFormInstance}
        />
      </div>
    );
  };

  const renderAppSettins = () => {
    return (
      <div className={cls(styles.widgetsWrapper, collapse && styles.collapse)}>
        <div className={styles.panlButtons}>
          <div style={{ marginLeft: 8 }}>
            <span className="g-button" style={{ padding: '0 4px' }} onClick={toggleCollapse}>
              {collapse ? <PlusSquareOutlined /> : <MinusSquareOutlined />}
            </span>
            <span
              className="g-button"
              style={{ padding: '0 4px' }}
              onClick={() => setShowSetting(false)}
            >
              <CloseSquareOutlined />
            </span>
          </div>
        </div>
        <div className={styles.appSettings}>
          <Tabs items={appTabs} activeKey={currentTabKey} onChange={setCurrentTabKey} />
          {renderAppWidgets()}
          {renderConversations()}
        </div>
      </div>
    );
  };

  const renderChatContainer = () => {
    return (
      <div className={styles.chatContainer}>
        <Chats />
      </div>
    );
  };

  const renderPageContent = () => {
    return (
      <div
        key={currentAppInfo?.appKey}
        className={cls(styles.pageContent, styles.chatPage, 'chat-app-page', {
          [styles.showSetting]: showSetting && !collapse,
        })}
      >
        {renderChatContainer()}
        {showSetting && renderAppSettins()}
      </div>
    );
  };

  const renderAppPage = () => {
    return (
      <div className={cls(styles.pageWrapper, styles.hideNav, 'app-page', 'app-chat-page')}>
        {renderPageContent()}
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return renderAppPage();
};

export default ChatPage;
