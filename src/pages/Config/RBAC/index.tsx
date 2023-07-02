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

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Row, Col, Space, Button, Radio } from 'antd';
import { useHistory, useModel } from 'umi';
import _ from 'lodash';

import { useToggle, useDeepCompareEffect } from 'ahooks';

import PageTitle from '@/components/PageTitle';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PermissionSection from '@/components/PermissionSection';
import CategoriesPane, { CategorySelector } from '@/components/CategoriesPane';

import MenuConfigTable from './components/MenuConfigTable';
import AuthConfigContext from './components/contexts/AuthConfigContext';
import ApplicationConfigTable from './components/ApplicationConfigTable';

import styles from './style.less';
import InnoIcon from '@/components/Icons/InnoIcon';

const Index: React.FC = () => {
  const { fetchMenuItemsRequest } = useModel('Menu', (model) => ({
    fetchMenuItemsRequest: model.fetchMenuItemsRequest,
  }));

  const { roleData, fetchRolesRequest } = useModel('Role', (model) => ({
    roleData: model.roleData,
    fetchRolesRequest: model.fetchRolesRequest,
  }));

  const { saveMenuAuthRequest, fetchMenuAuthsRequest } = useModel('RBAC', (model) => ({
    saveMenuAuthRequest: model.saveMenuAuthRequest,
    fetchMenuAuthsRequest: model.fetchMenuAuthsRequest,
  }));

  const roles = useMemo(() => {
    return _.map(roleData.list, (item) => ({
      categoryId: item.roleId,
      categoryName: item.roleName,
      totalCount: item.numberOfRole,
    }));
  }, [roleData.list]);

  useEffect(() => {
    if (roles.length) {
      setSelectedRoleId(roles[0].categoryId);
    }
  }, [roles]);

  const history = useHistory();
  const {
    location: {
      // @ts-ignore
      query,
      pathname,
    },
  } = history;

  const appRef: any = useRef('menu');
  const menuRef: any = useRef('app');
  const [roleCollapsed, setRoleCollapsed] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number>();

  const { t, loading: i18nLoading } = useI18n(['rbac', 'role', 'common']);

  const [isEditing, { toggle: editToggle }] = useToggle();
  const [tabKey, setTabKey] = useState(query.tabKey || 'menu');

  useEffect(() => {
    getMenuAuthData();
    fetchRolesRequest.run();
    fetchMenuItemsRequest.run();
  }, []);

  useDeepCompareEffect(() => {
    isEditing && editToggle();
    setTabKey(query.tabKey || 'menu');
  }, [query]);

  const getMenuAuthData = () => {
    fetchMenuAuthsRequest.run();
  };

  const handlePageTypeChange = (event) => {
    const key = event.target.value;
    setTabKey(key);
    history.push({
      pathname,
      // @ts-ignore
      query: {
        tabKey: key,
      },
    });
  };

  const handleButtonClick = (type?: string) => {
    switch (type) {
      case 'cancel':
        editToggle();
        tabKey === 'menu' ? menuRef.current?.onCancel() : appRef.current?.onCancel();
        break;
      case 'submit':
        tabKey === 'menu' ? menuRef.current?.onSubmit() : appRef.current?.onSubmit();
        break;
      case 'edit':
        editToggle();
        break;
      default:
    }
  };

  const renderRolesPanel = () => {
    return (
      <CategoriesPane
        createDisabled
        dropdownDisabled
        title={t('role.main.role_panel.title')}
        folderIcon="users"
        categories={roles}
        categoryId={selectedRoleId}
        loading={fetchRolesRequest.loading}
        onToggle={setRoleCollapsed}
        onSelected={setSelectedRoleId}
      />
    );
  };

  const renderPageTitle = () => {
    const pageTypeOptions = ['menu', 'app'].map((k) => ({
      value: k,
      label: t(`rbac.main.tab.${k}`),
    }));

    return (
      <PageTitle
        style={{ height: 64 }}
        leftContent={
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('rbac.main.heading_title')}</span>
            </Col>
            <Col>
              <Radio.Group
                value={tabKey}
                options={pageTypeOptions}
                onChange={handlePageTypeChange}
                optionType="button"
              />
            </Col>
            {roleCollapsed && tabKey === 'app' && (
              <Col>
                <CategorySelector
                  title={`${t('role.main.role_panel.title')}:`}
                  categories={roles}
                  onToggle={setRoleCollapsed}
                  categoryId={selectedRoleId}
                  onSelected={setSelectedRoleId}
                />
              </Col>
            )}
          </Row>
        }
        rightContent={
          <div className={styles.headerButton}>
            {isEditing ? (
              <Space>
                <Button
                  loading={saveMenuAuthRequest.loading}
                  onClick={() => handleButtonClick('cancel')}
                >
                  {t('common.button.cancel')}
                </Button>
                <Button
                  type="primary"
                  loading={saveMenuAuthRequest.loading}
                  onClick={() => handleButtonClick('submit')}
                >
                  {t('common.button.save')}
                </Button>
              </Space>
            ) : (
              <PermissionSection
                itemKey={
                  tabKey === 'menu'
                    ? 'RoleResource-addMenuRolePermissions'
                    : 'RoleResource-addOperateRolePermissions'
                }
              >
                <Button type="primary" onClick={() => handleButtonClick('edit')}>
                  <InnoIcon type="edit-alt" />
                  {t('common.button.edit')}
                </Button>
              </PermissionSection>
            )}
          </div>
        }
      />
    );
  };

  const renderDataContent = () => {
    let colProps = roleCollapsed
      ? {
          span: 0,
        }
      : {
          flex: '240px',
        };

    return (
      <Row gutter={16}>
        {tabKey === 'app' && <Col {...colProps}>{renderRolesPanel()}</Col>}
        <Col flex="1">
          <div className={styles.listWrapper}>
            <AuthConfigContext.Provider value={{ isEditing, editToggle }}>
              {tabKey !== 'app' ? (
                <MenuConfigTable ref={menuRef} />
              ) : (
                selectedRoleId && <ApplicationConfigTable roleId={selectedRoleId} ref={appRef} />
              )}
            </AuthConfigContext.Provider>
          </div>
        </Col>
      </Row>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageTitle()}
      {renderDataContent()}
    </>
  );
};

export default Index;
