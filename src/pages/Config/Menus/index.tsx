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

import React, { useState } from 'react';
import _ from 'lodash';

import { Row, Col, Space, Button } from 'antd';
import { useModel } from 'umi';

import { useSetState, useMemoizedFn, useDeepCompareEffect } from 'ahooks';

import PageTitle from '@/components/PageTitle';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';
import InnoIcon from '@/components/Icons/InnoIcon';

import MenuList from './components/SortableMenuList';
import MenuModal, { MODAL_NAME } from './components/MenuModal';

import styles from './style.less';

const Index: React.FC = () => {
  const { menus, fetchMenusRequest } = useModel('Menu');

  const [modal] = useModal(MODAL_NAME);

  const { t, loading: i18nLoading } = useI18n(['menu', 'common']);

  const [queryData, setQueryData] = useSetState({
    queryInput: '',
  });
  const [expandedKeys, setExpandedKeys] = useState([]);

  useDeepCompareEffect(() => {
    fetchMenusRequest.run(queryData);
  }, [queryData]);

  const listReload = useMemoizedFn((query) => {
    if (query) {
      setQueryData({
        ...queryData,
        ...query
      });
    } else {
      fetchMenusRequest.run(queryData);
    }
  });

  const getAllRowKeys = (menuList: any[], targets = []) => {
    _.map(menuList, (item: any) => {
      if (item.subItems) {
        // @ts-ignore
        targets.push(item.resourceId);
        getAllRowKeys(item.subItems, targets);
      }
    });

    return targets;
  };

  const toggleExpandedAll = (expanded: boolean) => () => {
    if (expanded) {
      const keys = getAllRowKeys(menus as [], []);
      setExpandedKeys([...keys]);
    } else {
      setExpandedKeys([]);
    }
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        style={{ height: 64 }}
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('menu.main.heading_title')}</span>
            </Col>
            <Col>
              <Space>
                <Button
                  type="text"
                  size="small"
                  className={styles.expandButton}
                  onClick={toggleExpandedAll(true)}
                >
                  <InnoIcon type="chevron-down" size={12} /> {t('menu.main.button.expand')}
                </Button>
                <Button
                  type="text"
                  size="small"
                  className={styles.expandButton}
                  onClick={toggleExpandedAll(false)}
                >
                  <InnoIcon type="chevron-up" size={12} /> {t('menu.main.button.collapse')}
                </Button>
              </Space>
            </Col>
          </Row>
        }
        rightContent={{
          search: {
            placeholder: t('menu.main.input.search.placeholder'),
            onSearch: (value: string) => {
              setQueryData({
                queryInput: value,
              });
            },
          },
          button: {
            label: t('menu.main.button.add'),
            itemKey: 'MenuManagement-createMenu',
            onClick: () => modal.show(),
          },
        }}
      />
    );
  };

  const renderDataContent = () => {
    return (
      <div className={styles.listWrapper}>
        <MenuList
          dataSource={menus}
          expandedItemKeys={expandedKeys}
          fetchMenuList={listReload}
        />
      </div>
    );
  };

  const renderMenuModal = () => {
    return <MenuModal onSuccess={() => fetchMenusRequest.run(queryData)} />;
  };

  if (i18nLoading || fetchMenusRequest.loading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderDataContent()}
      {renderMenuModal()}
    </>
  );
};

export default Index;
