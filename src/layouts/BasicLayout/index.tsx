/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useState, useEffect, useMemo } from 'react';
import ProLayout, { ProBreadcrumb } from '@ant-design/pro-layout';
import { Link, history, useModel } from 'umi';
import { Row, Col, Modal, Spin } from 'antd';
import _ from 'lodash';
import { pageLayoutSettings } from '@/config/DefaultSettings';
import {
  AppstoreOutlined,
  CompassOutlined,
  DeploymentUnitOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-layout';

import { checkUserStatus } from '@/services/Account';
import RightContent from '@/components/RightContent';
import RootConfigProvider from '@/components/RootConfigProvider';

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';

import InnoIcon from '@/components/Icons/InnoIcon';
import { MenuIcon } from '@/components/Icons/MenuIcon';

import {getFormattedLocale} from '@/common/utils';
import { INDEX_PATHNAME } from '@/common/constants';

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
  let CusIcon = icon && IconMap[icon];

  if (!CusIcon) {
    CusIcon = <MenuIcon type={icon} size={16} />;
  }

  return CusIcon;
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, routes, ...item }) => ({
    ...item,
    icon: renderMenuIcon(icon as string),
    routes: routes && loopMenuItem(routes),
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
      name: i18nNames?.[locale] ?? name,
      routes: items && formatMenuData(items),
    };
  });

const loginPath = '/login';

let _openKeys: string[] = [];

const LayoutPage: React.FC<{
  location: {
    pathname: string
  }
}> = ({ children, ...rest }) => {
  const {
    location = {
      pathname: '',
    },
  } = rest;

  const { logout, sessionData, setSessionData } = useModel('Account');
  const { applicationMenuItemsRequest } = useModel('Application', (model) => ({
    applicationMenuItemsRequest: model.applicationMenuItemsRequest,
  }));

  const { t, loading: i18nLoading } = useI18n(['common', 'workflow', 'page']);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([]);

  const { navigations, updateAllMenuOpts, updateNavigations, navigationsRequest } = useModel(
    'Menu',
    (model) =>
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
    saveMenuItemOpts(navigations);
  }, [navigations]);

  useEffect(() => {
    checkUserInfo(location?.pathname);
    navigationsRequest.run();

    const unlisten = history.listen((location, action) => {
      if (location.pathname !== loginPath) {
        checkUserInfo(location.pathname);
      }
      Modal.destroyAll();
    });
    return () => unlisten();
  }, []);

  const checkUserInfo = async (url: string) => {
    try {
      const result = await checkUserStatus(url);
      if (['60003', '60004'].includes(result?.code)) {
        logout(true);
      } else if (result?.code === '10000') {
        setSessionData(result.body);
      }
    } catch (e) {
      logout(true);
    }
  };

  const saveMenuItemOpts = (menuItems: any[]) => {
    let opts = [];
    const getMenuOpts = (menus: any[]): any => {
      menus?.map((menu) => {
        opts = opts.concat(menu.opts || []);
        if (menu.items) {
          getMenuOpts(menu.items);
        }
      });
    };

    getMenuOpts(menuItems);

    updateAllMenuOpts(opts);
  };

  const onMenuOpenChange = async (openKeys: string[]) => {
    const isOpen = openKeys.length > _openKeys.length;
    const itemKey = openKeys[openKeys.length - 1];
    _openKeys = openKeys;

    let menuItem;

    setOpenMenuKeys(openKeys);

    const findMenuItem = (navs: any[], key: string) => {
      _.find(navs, (item) => {
        if (item.itemKey === key) {
          menuItem = item;
          return true;
        } else if (item.items?.length) {
          findMenuItem(item.items, key);
        }
      });
    };

    if (isOpen) {
      findMenuItem(navigations, itemKey);

      const { items, loadMode } = menuItem || {};

      if (loadMode === 'DYNAMIC' && (!items || !items.length)) {
        const menuItems = await applicationMenuItemsRequest.runAsync(menuItem.itemKey);
        menuItem.items = menuItems;

        updateNavigations(navigations);
      }
    }
  };

  const menuHeaderRender = () => {
    return (
      <div className={styles.logoIcon}>
        <img className="logo" src={require('@/assets/images/common/logo.png')} />
        <img className="small-logo" src={require('@/assets/images/common/s_logo.png')} />
      </div>
    );
  };

  const getTargetRouter = (path: string, dataSource: any, parent: any, target: any) => {

    dataSource.map((data: any) => {
      let pathOrKey = data.path || data.key

      if(pathOrKey === path){
        if(parent) {
          // 目录的path值可能为undefined，用key去确定目标目录
          getTargetRouter(parent.path || parent.key, menuRoutes, null, target)
        }

        target.push({
          path: data.path,
          breadcrumbName: data.name,
          component: data.component
        })
      }else {
        data.routes && getTargetRouter(path, data.routes, data, target)
      }

    })
  }

  const breadcrumbListRender = (routers: any = []) => {
    let targetRouter: any = []
    const {
      query,
      search,
      pathname
    } = history.location;

    // 根据菜单获取页面路由
    getTargetRouter(pathname, menuRoutes, null, targetRouter);

    if (targetRouter && targetRouter.length > 0){
      if (pathname.search(INDEX_PATHNAME) < 0) {
        targetRouter.unshift({
          path: INDEX_PATHNAME,
          isClickable: true,
          breadcrumbName: (<span> <HomeOutlined/> {t('workflow.board.breadcrumb.home.title')} </span>)
        })
      }

      return targetRouter
    }

    // 工作流管理
    if (pathname.search('/workflow') > -1) {
      let routeList: any = [
        { path: INDEX_PATHNAME, isClickable: true, breadcrumbName: (<span> <HomeOutlined /> {t('workflow.board.breadcrumb.home.title')} </span>) },
      ]

      if (pathname.search(/(detail|preview|record|index)/) > -1) {
        const params = { ...query }
        delete params.instanceId

        let url = '/workflow/index'

        Object.keys(params).map((key: any, index: Number) => {
          url += `${index === 0 ? '?' : '&'}${key}=${params[key]}`
        })

        routeList.push({ path: url, isClickable: true, breadcrumbName: t('workflow.main.heading_title'), ...history.location })
      }

      if (pathname.search('detail') > -1) {
        routeList.push({breadcrumbName: t('workflow.board.breadcrumb.workflow.detail.title')})
      } else if (pathname.search('record') > -1) {
        routeList.push({path: `/workflow/index/detail${search}`, isClickable: true, breadcrumbName: t('workflow.board.breadcrumb.workflow.detail.title')})
        routeList.push({path: '/workflow/index/record', breadcrumbName: t('workflow.board.execution.record.title')})
      } else if (pathname.search('template') > -1) {
        routeList.push({ path: '/workflow/template', isClickable: true, breadcrumbName: t('workflow.template.heading_title') })

        if (pathname.search('template/') > -1) {
          routeList.push({ path: '', breadcrumbName: t('workflow.template.node.heading_title') })
        }
      } else if (pathname.search('nodes') > -1) {
        routeList.push({ path: '/workflow/nodes', isClickable: true, breadcrumbName: t('节点管理') })
      }

      return routeList
    } else if (pathname.search('visualization/page') > -1) {
      // 页面管理-页面预览
      let routeList: any = [
        { path: INDEX_PATHNAME, isClickable: true, breadcrumbName: (<span> <HomeOutlined /> {t('workflow.board.breadcrumb.home.title')} </span>) },
        { path: '/pages', isClickable: true, breadcrumbName: t('page.main.heading_title') },
        { path: '/page/show', breadcrumbName: t('page.main.title.preview') }
      ]

      return routeList
    }
  }

  const breadcrumbItemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;

    return route.isClickable && !last ? (
      <Link to={route.path}>{route.breadcrumbName}</Link>
    ) : (
      <span>{route.breadcrumbName}</span>
    );
  };

  const renderPageLoading = () => {
    return <PageLoading />;
  };

  const renderPageLayout = () => {

    return (
      <ProLayout
        headerHeight={64}
        collapsed={collapsed}
        openKeys={openMenuKeys}
        menuHeaderRender={menuHeaderRender}
        breadcrumbRender={breadcrumbListRender}
        rightContentRender={() => <RightContent/>}
        headerContentRender={() => (
          <Row gutter={20}>
            <Col>
              <span className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
                <InnoIcon size={16} type={`menu-${collapsed ? 'left' : 'right'}`} />
              </span>
            </Col>
            <Col>
              <ProBreadcrumb separator={<span> &gt; </span>} itemRender={breadcrumbItemRender} />
            </Col>
          </Row>
        )}
        menu={{
          loading: navigationsRequest.loading,
        }}
        onCollapse={setCollapsed}
        menuDataRender={() => menuRoutes}
        menuItemRender={(menuItemProps, defaultDom) => {
          const { path, isUrl, children, itemType, openMode } = menuItemProps;

          if ((children && children.length) || !path) {
            return defaultDom;
          } else if (itemType === 'LOADING') {
            return (
              <span>
                <Spin size="small" />
              </span>
            );
          }

          if ((isUrl || /^(http|https):\/\//.test(path)) && openMode === 'NEW_PAGE') {
            return (
              <a href={path} target="_blank">{ defaultDom }</a>
            )
          }

          return (
            <Link to={path}>{defaultDom}</Link>
          );
        }}
        // @ts-ignore
        onOpenChange={onMenuOpenChange}
        {...pageLayoutSettings}
        {...rest}
      >
        {children}
      </ProLayout>
    );
  };

  return (
    <RootConfigProvider>
      {(sessionData && sessionData.userId) ? renderPageLayout() : renderPageLoading()}
    </RootConfigProvider>
  );
};

export default LayoutPage;
