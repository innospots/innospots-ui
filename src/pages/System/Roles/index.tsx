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

import React, {useEffect, useMemo, useState} from 'react';

import {Col, message, Row} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import {useModel} from 'umi';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import UserAvatar from '@/components/UserAvatar';

import RoleModal, {MODAL_NAME} from './components/RoleModal';
import AddMemberModal, {MODAL_NAME as MEMBER_MODAL_NAME} from './components/AddMemberModal';

import IconButton from '@/components/IconButton';
import CategoriesPane, {CategorySelector} from "@/components/CategoriesPane";

import styles from './style.less';

type RoleType = {
  admin: boolean,
  roleId: number,
  roleName: string,
  numberOfRole: number
}

interface DataType {
  realName: string;
  userName: string;
  email: string;
  operate: string;
};

const Index: React.FC = () => {

  const {
    roleData,
    roleUsers,

    deleteRoleRequest,
    fetchRolesRequest,
    roleUserListRequest,
    removeUserFromRole
  } = useModel('Role');

  const [
    roleModal
  ] = useModal(MODAL_NAME);

  const [
    memberModal
  ] = useModal(MEMBER_MODAL_NAME);

  const {t, loading: i18nLoading} = useI18n(['role', 'common']);

  const rolePermissions = useMemo(
    () => ({
      create: 'Role-createRole',
      update: 'Role-updateRole',
      delete: 'Role-deleteRole',
    }),
    [],
  );

  const curRoleList: RoleType[] | any = roleData.list;
  const [curRoleId, setCurRoleId] = useState<number>(0);

  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  const currentUsers = useMemo(() => (roleUsers || []).map(item => item.userId), [roleUsers]);

  useEffect(() => {
    fetchRolesRequest.run()
  }, []);

  useEffect(() => {
    if (!curRoleId && curRoleList?.length) {
      setCurRoleId(curRoleList[0].roleId)
    }

    // 删除当前角色分类后，默认选中角色列表第一项
    let cur = curRoleList?.find((role:any) => role.roleId === curRoleId)
    if(!cur  && curRoleList?.length) {
      // @ts-ignore
      setCurRoleId(curRoleList[0].roleId + '')
    }
  }, [curRoleId, curRoleList]);

  useEffect(() => {
    if (curRoleId) {
      fetchRoleUserList(curRoleId)
    }
  }, [curRoleId]);

  const onCategoryClicked = (categoryId) => {
    setCurRoleId(categoryId)
    fetchRoleUserList(curRoleId)
  }

  const fetchRoleUserList = (roleId: number) => {
    roleUserListRequest.runAsync(roleId);
  }

  const deleteRoleById = async (roleId: number) => {
    const result = await deleteRoleRequest.runAsync(roleId);

    if (result) {
      message.success(t('common.error_message.delete.success'));
    }
  }

  const removeCurMember = (id: string) => () => {
    return new Promise<void>(async (resolve) => {
      if (curRoleId) {
        await removeUserFromRole.runAsync(curRoleId, id);
        await fetchRolesRequest.run();
        await fetchRoleUserList(curRoleId);
      }

      resolve();
    })
  }

  const showRoleModal = (role?: RoleType) => {
    roleModal.show(role);
  }

  const roleOperate = (key: String, category: any) => {
    let role = curRoleList.find((role: any) => role.roleId === category.categoryId)

    if (key === 'update') {
      showRoleModal(role)
    } else if (key === 'delete') {
      deleteRoleById(role.roleId)
    }
  }

  const renderMemberList = () => {

    const columns: ColumnsType<DataType> = [{
      title: t('role.main.column.name'),
      key: 'realName',
      dataIndex: 'realName',
      render: (name: string, record: any) => {
        return (
          <Row className={styles.nameWrapper} align="middle">
            <Col flex="38px">
              <UserAvatar
                size={28}
                userInfo={record}
                style={{width: 28, height: 28}}
              />
            </Col>
            <Col>
              <span>{name || '-'}</span>
            </Col>
          </Row>
        )
      }
    }, {
      title: t('role.main.column.username'),
      key: 'userName',
      dataIndex: 'userName'
    }, {
      title: t('role.main.column.email'),
      key: 'email',
      dataIndex: 'email'
    }, {
      title: t('common.table.column.action'),
      dataIndex: 'operate',
      width: 80,
      align: 'center',
      render: (operate: any, record: any) => {
        if (record.userId == 1) return '-';

        return (
          <IconButton
            icon="delete"
            tooltip={t('common.tooltip.delete')}
            permissions="Role-deleteUserRole"
            popConfirm={{
              title: t('common.text.delete_confirmation'),
              placement: 'left',
              onConfirm: removeCurMember(record.userId),
              okButtonProps: {
                loading: removeUserFromRole.loading
              }
            }}
          />
        )
      }
    }];

    return (
      <ListTable
        rowKey="userId"
        columns={columns}
        loading={roleUserListRequest.loading}
        dataSource={roleUsers}
        // dataSource={userData.list}
        // pagination={userData.pagination}
      />
    )
  }

  const renderRoleModal = () => {

    return (
      <RoleModal/>
    )
  }

  const renderAddMemberModal = () => {

    return (
      <AddMemberModal/>
    )
  }

  if (i18nLoading) {
    return (
      <PageLoading/>
    )
  }

  const renderPageTitle = () => {
    return (
      <PageTitle
        leftContent={(
          <Row gutter={40} align="middle">
            <Col>
              <span className="page-header-title">{t('role.main.heading_title')}</span>
            </Col>
            {
              categoryCollapsed && (
                <Col>
                  <CategorySelector
                    title={`${t('role.main.role_panel.title')}:`}
                    categories={_.map(curRoleList, item => {
                      return {
                        categoryId: item.roleId,
                        categoryName: item.roleName,
                        totalCount: item.numberOfRole
                      }
                    })}
                    onToggle={setCategoryCollapsed}
                    categoryId={curRoleId}
                    onSelected={onCategoryClicked}
                  />
                </Col>
              )
            }
          </Row>
        )}
        rightContent={{
          search: null,
          button: {
            label: t('role.main.button.add_user'),
            itemKey: 'Role-addUserRole',
            onClick: () => {
              memberModal.show({
                roleId: curRoleId,
                currentUsers: currentUsers
              })
            }
          }
        }}
      />
    )
  }


  const renderCategoriesPanel = () => {
    return (
      <CategoriesPane
        title={t('role.main.role_panel.title')}
        categories={_.map(curRoleList, item => {
          return {
            categoryId: item.roleId,
            categoryName: item.roleName,
            totalCount: item.numberOfRole || 0
          }
        })}
        permissions={rolePermissions}
        categoryId={curRoleId}
        createTooltip={t('role.form.add.title')}
        dropdownDisabled={(category) => {
          let role = curRoleList.find((role: any) => role.roleId === category.categoryId)
          return role?.admin;
        }}
        onToggle={setCategoryCollapsed}
        onSelected={onCategoryClicked}
        loading={fetchRolesRequest.loading}
        onCreate={() => showRoleModal()}
        onUpdate={(category) => roleOperate('update', category)}
        onDelete={(category) => roleOperate('delete', category)}
      />
    )
  }

  const renderPageContent = () => {
    let colProps = categoryCollapsed ? {
      span: 0
    } : {
      flex: '256px'
    };

    return (
      <div className={styles.pageContainer}>
        <Row gutter={16}>
          <Col {...colProps}>
            {renderCategoriesPanel()}
          </Col>
          <Col flex="1">
            {renderMemberList()}
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <>
      {renderPageTitle()}
      {renderPageContent()}
      {renderRoleModal()}
      {renderAddMemberModal()}
    </>
  )
}

export default Index;
