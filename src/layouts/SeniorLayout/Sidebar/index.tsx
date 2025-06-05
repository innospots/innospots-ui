import { Menu, Typography, ConfigProvider } from 'antd';
import _ from 'lodash';
import cls from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { history, useLocation, useModel } from 'umi';
import { getMatchMenu } from '@umijs/route-utils';

import styles from './style.less';

import logo from '@/assets/images/common/s_logo.png';

const { Text } = Typography;

const Sidebar: React.FC<{
  menuItems: any[];
  onTopMenuClick: (item: any) => void;
}> = ({ menuItems, onTopMenuClick }) => {
  const location = useLocation();
  const { serverInfo } = useModel('Account', (model) => ({
    serverInfo: model.serverInfo,
  }));
  const [topMenuKey, setTopMenuKey] = useState('');
  const [subMenuOpenKeys, setSubMenuOpenKeys] = useState<string[]>([]);
  const [subMenuSelectedKeys, setSubMenuSelectedKeys] = useState<string[]>([]);

  const matchMenus = useMemo(() => {
    return getMatchMenu(location.pathname || '/', menuItems || [], true);
  }, [location.pathname, menuItems]);

  const subMenuItems = useMemo(() => {
    const items = menuItems.find((item) => item.key === topMenuKey)?.children || [];
    return _.map(items, (item) => {
      // const icon = item.icon;
      const newItem: any = _.pick(item, ['key', 'label', 'icon', 'path', 'children']);
      // newItem.icon = icon || <MenuOutlined />;

      return newItem;
    });
  }, [menuItems, topMenuKey]);

  const findMenuPath = (menuItems: any[], currentKey: string, path: string[] = []): string[] | null => {
    for (const item of menuItems) {
      if (item.key === currentKey) {
        return [...path, item.key];
      }
      
      if (item.children && item.children.length > 0) {
        const result = findMenuPath(item.children, currentKey, [...path, item.key]);
        if (result) {
          return result;
        }
      }
    }
    
    return null;
  };

  const getMenuKeys = (matchMenus: any[], menuItems: any[]) => {
    const lastItem = matchMenus[matchMenus.length - 1];
    if (!lastItem) {
      return { openKeys: [], selectedKeys: [] };
    }

    const menuPath = findMenuPath(menuItems, lastItem.key) || [];
    
    const openKeys = menuPath.slice(0, -1);
    const selectedKeys = menuPath.slice(-1);
    const topKey = menuPath[0] || '';

    return { topKey, openKeys, selectedKeys };
  };

  useEffect(() => {
    const { topKey, openKeys, selectedKeys } = getMenuKeys(matchMenus, menuItems);
    setTopMenuKey(topKey || '');
    setSubMenuOpenKeys(openKeys);
    setSubMenuSelectedKeys(selectedKeys);
  }, [matchMenus, menuItems]);

  const handleSubMenuSelect = ({ key, item }: any) => {
    setSubMenuSelectedKeys([key]);
    const itemProps = item.props || {};
    if (itemProps.path) {
      history.push(itemProps.path);
    }
  };

  const renderLogo = () => {
    return (
      <div className={styles.logoBox}>
        <div className={styles.logo}>
          <img
            className="logo"
            src={serverInfo.favicon || serverInfo.logo || logo}
            onError={(e) => {
              e.currentTarget.src = logo;
            }}
          />
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    return (
      <div className={styles.sidebar}>
        {renderLogo()}
        <div className={cls(styles.menuItems, 'custom-scrollbar')}>
          {menuItems.map((item) => {
            const Icon = React.cloneElement(item.icon, {
              className: styles.icon,
            });
            return (
              <div
                key={item.key}
                className={cls(styles.sidebarItem, {
                  [styles.selected]: item.key === topMenuKey,
                })}
                onClick={() => {
                  if (!item.children && item.path) {
                    history.push(item.path);
                  } else if (item.key && item.key !== topMenuKey) {
                    setTopMenuKey(item.key);
                    onTopMenuClick(item);
                  }
                }}
              >
                <div className={styles.iconButton}>{Icon}</div>
                <Text ellipsis title={item.name} className={styles.text}>
                  {item.label}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSubmenu = () => {
    if (subMenuItems.length === 0) {
      return null;
    }

    return (
      <div className={styles.submenu}>
        <div className={styles.submenuItems}>
          <ConfigProvider theme={{ components: { Menu: { iconSize: 20 } } }}>
            <Menu
              mode="inline"
              items={subMenuItems}
              inlineIndent={10}
              openKeys={subMenuOpenKeys}
              selectedKeys={subMenuSelectedKeys}
              onOpenChange={setSubMenuOpenKeys}
              onClick={handleSubMenuSelect}
            />
          </ConfigProvider>
        </div>
      </div>
    );
  };

  return (
    <aside className={styles.menuBox}>
      {renderSidebar()}
      {renderSubmenu()}
    </aside>
  );
};

export default Sidebar;
