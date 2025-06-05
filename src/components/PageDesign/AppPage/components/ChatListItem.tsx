import _ from 'lodash';
import cls from 'classnames';
import React, { useMemo } from 'react';
import copy from 'copy-text-to-clipboard';
import { Avatar, Spin, message } from 'antd';
import { SmileFilled, RedditCircleFilled, CopyOutlined } from '@ant-design/icons';

import { KeyValues } from '@/common/types/Types';
import { formatResourcePath } from '@/common/utils';

import DataContent from './DataContent';

import styles from './style.less';

type ChatListItemType = {
  data: string | KeyValues;
  isQuestion?: boolean;
};

const iconSize = 42;

const iconStyle = {
  color: '#b2bce4',
  fontSize: iconSize,
};

const avatarStyle = {
  backgroundColor: '#fff',
};

const extData = {};

function cleanTableData(input: string) {
  return input
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) =>
      line
        .split('\t')
        .map((col) => col.trim().replace(/\s+/g, ' '))
        .join('\t'),
    )
    .join('\n');
}

const ChatListItem: React.FC<ChatListItemType> = ({ isQuestion, data }) => {
  const chatData = useMemo(() => {
    if (_.isString(data) || !data) {
      return {
        data: data || '-',
        viewType: 'text',
      };
    } else if (_.isPlainObject(data) && !data.viewType) {
      data.viewType = 'text';
    }

    return data;
  }, [data]);

  const renderItemContent = () => {
    const viewType = chatData.viewType;
    if (viewType === 'loading') {
      return (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <Spin size="small" />
        </div>
      );
    } else if (!['text', 'normal'].includes(viewType)) {
      return <DataContent dataSource={chatData} extData={extData} />;
    }
    return chatData.data || '-';
  };

  const handleCopy = () => {
    let copyText = '';
    const { id, data, viewType } = chatData;
    if (_.isString(data)) {
      copyText = data;
    } else {
      if (viewType === 'video' || viewType === 'image') {
        copyText = [chatData.title, chatData.src].join(' ');
      } else if (viewType === 'file') {
        copyText = [chatData.title, chatData.downloadUrl].join(' ');
      } else if (viewType === 'chart') {
        if (_.isObject(data)) {
          copyText = JSON.stringify(data);
        } else if (_.isString(data)) {
          copyText = data;
        }
      } else {
        const view = document.getElementById(`item_${id}`);
        if (view) {
          copyText = cleanTableData(view.innerText || '');
        }
      }
    }
    copy(copyText);
    message.success('复制成功');
  };

  const renderItemTools = () => {
    return (
      <div className={styles.itemTools}>
        <span className="g-button" onClick={handleCopy}>
          <CopyOutlined /> 复制
        </span>
      </div>
    );
  };

  const renderListItem = () => {
    let icon;

    if (!chatData.icon) {
      if (isQuestion) {
        icon = <SmileFilled style={iconStyle} />;
      } else {
        icon = <RedditCircleFilled style={iconStyle} />;
      }
      icon = <Avatar icon={icon} size={iconSize} style={avatarStyle} />;
    } else {
      icon = <Avatar src={formatResourcePath(chatData.icon)} size={iconSize} style={avatarStyle} />;
    }

    return (
      <div
        className={cls(styles.chatListItem, {
          [styles.question]: isQuestion,
        })}
      >
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{icon}</div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <div
              id={`item_${chatData.id}`}
              className={cls(styles.message, `${chatData.viewType}_message`)}
            >
              {renderItemContent()}
            </div>
            {renderItemTools()}
          </div>
        </div>
      </div>
    );
  };

  return renderListItem();
};

export default ChatListItem;
