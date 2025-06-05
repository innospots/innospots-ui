import {
  AppstoreOutlined,
  CompassOutlined,
  DeploymentUnitOutlined,
  MedicineBoxOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { useEventEmitter } from 'ahooks';
import cls from 'classnames';
import Cookies from 'js-cookie';
import _ from 'lodash';
import moment from 'moment-timezone';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, history, useLocation, useModel } from 'umi';

import { MenuIcon } from '@/components/Icons/MenuIcon';

import {
  getFormattedLocale,
  isRequestSuccess,
  isTokenExpired,
} from '@/common/utils';

import RootConfigProvider from '@/components/RootConfigProvider';
import { checkUserStatus } from '@/services/Account';

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';

import Header from './Header';
import Sidebar from './Sidebar';

import styles from './style.less';

export const IconMap = {
  system: <SettingOutlined />,
  dataSource: <SettingOutlined />,
  strategy: <NodeIndexOutlined />,
  workspace: <CompassOutlined />,
  application: <AppstoreOutlined />,
  configuration: <SlidersOutlined />,
  'libra-auto': <MedicineBoxOutlined />,
  'meta-management': <DeploymentUnitOutlined />,
};

export const renderMenuIcon = (icon: string) => {
  let CusIcon = IconMap[icon];

  if (!CusIcon) {
    CusIcon = <MenuIcon type={icon} />;
  }

  return CusIcon;
};

const currentTimezone = moment.tz.guess();

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, children, ...item }) => ({
    ...item,
    icon: renderMenuIcon(icon as string),
    children: children && loopMenuItem(children),
  }));

const [locale] = getFormattedLocale();
const formatMenuData = (menus: any[]): MenuDataItem[] =>
  menus.map(({ loadMode, itemKey, uri, name, i18nNames, items, ...item }) => {
    const isDynamic = loadMode === 'DYNAMIC' && (!items || !items.length);

    if (isDynamic) {
      items = [
        {
          uri: '/view',
          name: `Menu_${itemKey}`,
          itemKey: `LOADING_${itemKey}`,
          itemType: 'LOADING',
        },
      ];
    }

    return {
      ...item,
      loadMode,
      key: `/${(itemKey || '').replace(/^\//, '')}`,
      path: uri?.replace(/#\//g, ''),
      label: i18nNames?.[locale] ?? name,
      children: items && formatMenuData(items),
    };
  });

const loginPaths = ['/login', '/admin-l10'];

let _openKeys: string[] = [];

export default function SeniorLayout() {
  const location = useLocation();
  const $event = useEventEmitter();

  useEffect(() => {
    if ($event) {
      (window as any).AppEvent = $event;
    }
  }, [$event]);

  useEffect(() => {
    Cookies.set('timezone', currentTimezone);
  }, []);

  const { logout, serverInfo, sessionData, setSessionData } = useModel(
    'Account',
    (model) => ({
      logout: model.logout,
      serverInfo: model.serverInfo,
      sessionData: model.sessionData,
      setSessionData: model.setSessionData,
    }),
  );
  const { applicationMenuItemsRequest } = useModel('Application', (model) => ({
    applicationMenuItemsRequest: model.applicationMenuItemsRequest,
  }));

  const { t, loading: i18nLoading } = useI18n(['common', 'workflow', 'page']);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([]);
  const [matchMenuKeys, setMatchMenuKeys] = useState<string[] | undefined>();

  const {
    navigations,
    updateAllMenuOpts,
    updateNavigations,
    navigationsRequest,
  } = useModel('Menu', (model) =>
    _.pick(model, [
      'navigations',
      'updateAllMenuOpts',
      'updateNavigations',
      'navigationsRequest',
    ]),
  );

  const menuRoutes = useMemo(() => {
    const formatMenus = formatMenuData(navigations);
    return loopMenuItem(formatMenus);
  }, [navigations]);

  useEffect(() => {
    console.log('menuRoutes', menuRoutes);
  }, [menuRoutes]);

  const saveMenuItemOpts = (menuItems: any[]) => {
    let opts: any[] = [];
    const getMenuOpts = (menus: any[]): any => {
      menus?.forEach((menu) => {
        opts = opts.concat(menu.opts || []);
        if (menu.items) {
          getMenuOpts(menu.items);
        }
      });
    };

    getMenuOpts(menuItems);

    updateAllMenuOpts(opts);
  };

  useEffect(() => {
    saveMenuItemOpts(navigations);
  }, [navigations]);

  const checkUserInfo = async (url: string) => {
    try {
      const result = await checkUserStatus(url);
      if (isTokenExpired(result?.code)) {
        logout(true);
      } else if (isRequestSuccess(result?.code)) {
        setSessionData(result.body);
      }
    } catch (e) {
      logout(true);
    }
  };

  useEffect(() => {
    if (serverInfo?.code) {
      checkUserInfo(location?.pathname);
      navigationsRequest.run();
    }
  }, [serverInfo?.code]);

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      if (!loginPaths.includes(location.pathname)) {
        checkUserInfo(location.pathname);
      }

      if (location.query?.router === 'page') {
        setMatchMenuKeys(['/libra-page']);
      } else {
        setMatchMenuKeys(undefined);
      }
      Modal.destroyAll();
    });
    return () => unlisten();
  }, []);

  const getTargetRouter = (
    path: string,
    dataSource: any,
    parent: any,
    target: any,
  ) => {
    dataSource.map((data: any) => {
      let pathOrKey = data.path || data.key;

      if (pathOrKey === path) {
        if (parent) {
          // 目录的path值可能为undefined，用key去确定目标目录
          getTargetRouter(parent.path || parent.key, menuRoutes, null, target);
        }

        target.push({
          // path: data.path,
          title: data.label,
        });
      } else {
        if (data.children) {
          getTargetRouter(path, data.children, data, target);
        }
      }
    });
  };

  const breadcrumbItems = useMemo(() => {
    let targetRouter: any = [];
    const { pathname } = location;

    // 根据菜单获取页面路由
    getTargetRouter(pathname, menuRoutes, null, targetRouter);

    return targetRouter;
  }, [menuRoutes, location.pathname]);

  const getFirstLeafMenuPath = (menuItems: MenuDataItem[]): string | null => {
    for (const menuItem of menuItems) {
      if (menuItem.children) {
        const childPath = getFirstLeafMenuPath(menuItem.children);
        if (childPath) {
          return childPath;
        }
      } else if (menuItem.path) {
        return menuItem.path;
      }
    }
  
    return null;
  };

  const onTopMenuClick = async (menuItem: any) => {
    const { items, loadMode } = menuItem || {};

    if (loadMode === 'DYNAMIC' && (!items || !items.length)) {
      const menuItems = await applicationMenuItemsRequest.runAsync(
        menuItem.itemKey,
      );
      menuItem.items = menuItems;

      updateNavigations(navigations);
    } else {
      const firstMenuPath = getFirstLeafMenuPath(menuItem.children);
      if (firstMenuPath) {
        history.push(firstMenuPath);
      }
    }
  };

  const renderSidebar = () => {
    return <Sidebar menuItems={menuRoutes} onTopMenuClick={onTopMenuClick} />;
  };

  const renderHeader = () => {
    return <Header breadcrumbItems={breadcrumbItems} />;
  };

  const renderPageContent = () => {
    return (
      <div className={styles.pageContent}>
        <div className={styles.pageContentInner}>
          {renderHeader()}
          <section className={cls(styles.content, 'custom-scrollbar')}>
            <Outlet />
          </section>
        </div>
      </div>
    );
  };
  const renderPageLayout = () => {
    return (
      <div className={styles.layout}>
        {renderSidebar()}
        {renderPageContent()}
      </div>
    );
  };

  const renderPageLoading = () => {
    return <PageLoading />;
  };

  return (
    <RootConfigProvider>
      {sessionData && sessionData.userId
        ? renderPageLayout()
        : renderPageLoading()}
    </RootConfigProvider>
  );
}
