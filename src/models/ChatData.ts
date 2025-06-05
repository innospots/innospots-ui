import _ from 'lodash';
import { useModel } from 'umi';
import { message } from 'antd';
import moment from 'moment';
import { useRequest, useSafeState } from 'ahooks';
import { useRef, useMemo, useState, useEffect } from 'react';

import { randomString } from '@/common/utils';
import { fetch } from '@/common/request';
import ChatFetch from '@/common/request/ChatFetch';

const getConversationId = (appKey: string) => {
  return `${appKey}${Date.now()}${randomString(4)}`.substring(0, 24);
};

export default () => {
  const chatFormRef = useRef<any>(null);
  const currentListRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const [conversations, setConversations] = useState<any[]>([]);
  const [lastMessageLoaded, setLastMessageLoaded] = useState(false);

  const loadingRef = useRef<any>(null);

  const { runAsync: fetchLastSessionMessages, loading: lastSessionMessagesLoading } = useRequest(
    async (appKey: string) => {
      const result = await fetch('session/session-message/last-list', {
        params: {
          maxSize: 20,
          appKey,
        },
      });
      return result;
    },
    {
      manual: true,
      onSuccess: (dataList: any[]) => {
        setLastMessageLoaded(true);
        if (dataList?.length > 0) {
          const conversationId = dataList[0].conversationId;
          const list = _.map(dataList as any[], (item: any) => getChatItemData('system', item));
          setChatDataList(list);
          createConversation(conversationId, list);
        } else {
          createConversation();
        }
      },
    },
  );

  const { runAsync: fetchSessionMessages, loading: sessionMessagesLoading } = useRequest(
    async (conversationId: string) => {
      const result = await fetch('session/session-message/list', {
        params: {
          maxSize: 20,
          conversationId,
        },
      });
      return result;
    },
    {
      manual: true,
      onSuccess: (dataList, params) => {
        const list = _.map(dataList as any[], (item: any) => getChatItemData('system', item));
        setChatDataList(list);
        if (params[0]) {
          createConversation(params[0], list);
        }
      },
    },
  );

  const { runAsync: fetchConversations } = useRequest(
    async (appKey: string) => {
      const result = await fetch('session/conversation/list', {
        params: {
          appKey,
          maxSize: 20,
        },
      });
      return result;
    },
    {
      manual: true,
      onSuccess: (dataList) => {
        setConversations(dataList);
      },
    },
  );

  const appStateRef = useRef<
    Record<
      string,
      {
        list: any[];
        fetch: ChatFetch | null;
        loading: boolean;
      }
    >
  >({});

  const [currentTabKey, setCurrentTabKey] = useState<string>('chat');
  const [curConversationId, setCurConversationId] = useState<string>();

  const { currentAppInfo } = useModel('App', (model) => ({
    currentAppInfo: model.currentAppInfo,
  }));

  const [chatState, setChatState] = useSafeState<any>({
    list: [],
    current: null,
  });
  const [chatDataList, setChatDataList] = useState<any[]>([]);

  const currentAppKey = currentAppInfo?.appKey;

  useEffect(() => {
    if (curConversationId) {
      // getSessionData(curConversationId)
    }
  }, [curConversationId]);

  // useDebounceEffect(() => {
  //   if (curConversationId) {
  //     const appState = appStateRef.current[curConversationId] || {};
  //     appState.list = chatDataList;
  //     appStateRef.current[curConversationId] = appState;
  //   }
  // }, [ chatDataList ], {
  //   wait: 1000,
  // });

  useEffect(() => {
    if (!loading) {
      const loadingItem = _.find(
        currentListRef.current,
        (item: any) => item.id === 'system_loading',
      );
      if (loadingItem) {
        const list = removeLoadingItem();
        setChatDataList((prev: any[]) => {
          return [...list];
        });
      }
    }
  }, [loading]);

  const appPageInfo = useMemo(() => {
    if (!currentAppInfo) return null;
    return currentAppInfo.resources?.pages[0];
  }, [currentAppInfo]);

  const appRegistry = useMemo(() => {
    const registries = currentAppInfo?.resources?.registries;
    const registry = _.find(
      registries,
      (registry: any) => registry.registryId === appPageInfo?.configs?.table?.value,
    );
    return registry;
  }, [currentAppInfo, appPageInfo]);

  const pageTabs = useMemo(() => {
    const tabs = [
      {
        key: 'chat',
        label: 'Chat',
      },
    ];

    const viewTypesMap = {};
    _.each(chatDataList, (item: any) => {
      const viewType = item.data?.viewType;
      if (viewType && ['image', 'video', 'chart', 'file', 'table'].includes(viewType)) {
        viewTypesMap[viewType] = true;
      }
    });

    const viewTypes = _.sortBy(_.keys(viewTypesMap));
    if (viewTypes.length > 0) {
      viewTypes.map((type) => {
        tabs.push({
          key: type,
          label: _.upperFirst(type),
        });
      });
    }

    return tabs;
  }, [chatDataList]);

  const getSessionData = async (sessionId: string) => {
    const appState = appStateRef.current[sessionId] || {};
    const conversation = _.find(conversations, (item: any) => item.conversationId === sessionId);
    const list = (currentListRef.current = appState.list || []);
    if (list.length === 0 && _.isUndefined(conversation?.newChat)) {
      showLoading();
      await fetchSessionMessages(sessionId);
      hideLoading();
    } else {
      setLoading(appState.loading || false);
      setChatDataList([...list]);
    }
  };

  const getInitialData = async (appKey: string) => {
    showLoading();
    await fetchConversations(appKey);
    await fetchLastSessionMessages(appKey);
    hideLoading();
  };

  const showLoading = () => {
    if (!loadingRef.current) {
      loadingRef.current = message.loading('');
    }
  };

  const hideLoading = () => {
    if (loadingRef.current) {
      loadingRef.current();
      loadingRef.current = null;
    }
  };

  const addNewChat = (cid: string) => {
    const newChatNum = _.filter(conversations, (item: any) => item.newChat).length + 1;
    const session = {
      conversationId: cid,
      title: `New Chat ${newChatNum}`,
      newChat: true,
      createdTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    conversations.unshift(session);
    setConversations([...conversations]);
    setChatDataList(currentListRef.current);
  };

  const createConversation = (cid?: string, initialList?: any[]) => {
    stopChatMessage();

    const id = cid || getConversationId(currentAppKey as string);
    if (!appStateRef.current[id]) {
      const configs = appRegistry?.configs;
      appStateRef.current[id] = {
        list: initialList || [],
        loading: false,
        fetch: new ChatFetch(configs?.uri),
      };
    }
    setCurConversationId(id);
    currentListRef.current = appStateRef.current[id].list;

    if (!cid) {
      addNewChat(id);
    }
  };

  const getChatItemData = (type: 'user' | 'system' | 'loading', data: any) => {
    if (type === 'loading') {
      return {
        id: 'system_loading',
        type: 'system',
        data: {
          viewType: 'loading',
        },
      };
    }
    return {
      type,
      data,
      id: data.id || _.uniqueId(`${type}_`),
    };
  };

  const removeLoadingItem = () => {
    const list = _.filter(currentListRef.current, (item: any) => item.id !== 'system_loading');
    currentListRef.current = list;

    return list;
  };

  const insertChatData = (type: 'user' | 'system', data: any) => {
    const list = removeLoadingItem();
    list.push(getChatItemData(type, data));
    if (type === 'user') {
      list.push(getChatItemData('loading', null));
    }

    appStateRef.current[curConversationId as string].list = currentListRef.current = list;
    setChatDataList((prev: any[]) => {
      return [...list];
    });
  };

  const formatEventData = (result: any) => {
    if (result.event === 'message') {
      const resultData = JSON.parse(result.data);
      if (resultData.viewType === 'slice') {
        const sliceData = _.find(
          currentListRef.current,
          (item: any) => item?.data?.viewId === resultData.viewId,
        );
        if (sliceData) {
          if (sliceData.data?.data) {
            sliceData.data.data += resultData.data;
          } else {
            sliceData.data.data = resultData.data;
          }
          setChatDataList((prev: any[]) => {
            return [...currentListRef.current];
          });
          return;
        }
      }
      insertChatData('system', resultData);
    }
  };

  const stopChatMessage = (sessionId?: string) => {
    const sid = sessionId || curConversationId;

    if (!sid) return;
    const chatFetch = appStateRef.current[sid]?.fetch;
    if (chatFetch) {
      setLoading(false);
      chatFetch.abort(sid);
    }
  };

  const submitChatMessage = async (inputMessage: string, callback: (isError: boolean) => void) => {
    if (!inputMessage) return;
    try {
      const configs = appRegistry?.configs;
      callback(!configs?.uri);

      if (configs?.uri && curConversationId) {
        setLoading(true);
        insertChatData('user', {
          data: inputMessage,
        });

        const pageConfig = appPageInfo?.configs || {};
        const formData = chatFormRef.current ? await chatFormRef.current.validateFields() : {};
        const postData = {
          ...formData,
          appKey: currentAppKey,
          title: inputMessage.substring(0, 64),
          conversationId: curConversationId,
          [pageConfig?.messageField || 'message']: inputMessage,
        };
        const currentConversation = _.find(
          conversations,
          (item: any) => item.conversationId === curConversationId,
        );
        if (currentConversation?.newChat) {
          currentConversation.newChat = false;
          currentConversation.title = postData.title;
          setConversations([...conversations]);
        }
        const chatFetch = appStateRef.current[curConversationId].fetch;
        if (chatFetch) {
          chatFetch.fetchData(
            {
              method: 'POST',
              body: JSON.stringify(postData),
              onmessage: async (event: any) => {
                formatEventData(event);
                setUpdateCount((prev) => prev + 1);
              },
              onerror: (event: any) => {
                setLoading(false);
              },
              onclose: () => {
                setLoading(false);
                // formatChatList()
              },
            },
            configs?.responseMode,
          );
        }
      } else {
        message.error('URL is empty');
      }
    } finally {
      // setLoading(false);
    }
  };

  const setChatFormInstance = (formInstance: any) => {
    chatFormRef.current = formInstance;
  };

  const getSessionMessages = async (sessionId: string) => {
    if (!sessionId) return;
    stopChatMessage();
    getSessionData(sessionId);
    setCurConversationId(sessionId);
  };

  const resetChatData = (sessionId: string) => {
    stopChatMessage(sessionId);
    setChatDataList([]);
    setCurConversationId('');
    setLastMessageLoaded(false);
  };

  return {
    pageTabs,
    chatDataList,

    appPageInfo,
    appRegistry,
    currentAppInfo,
    getInitialData,

    updateCount,
    resetChatData,

    currentTabKey,
    setCurrentTabKey,

    lastMessageLoaded,

    conversations,
    getSessionMessages,
    curConversationId,
    sessionMessagesLoading,
    lastSessionMessagesLoading,

    createConversation,

    loading,
    chatState,
    setChatState,
    insertChatData,
    stopChatMessage,
    submitChatMessage,
    setChatFormInstance,
  };
};
