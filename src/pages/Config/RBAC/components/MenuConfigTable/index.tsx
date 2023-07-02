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

import React, { useState, useContext, useImperativeHandle } from 'react';

import {Row, Col, message, Checkbox, Typography} from 'antd';

import { useModel } from 'umi';

import { useMemoizedFn, useDeepCompareEffect } from 'ahooks';

import _ from 'lodash';

import useI18n from '@/common/hooks/useI18n';
import ListTable from '@/components/ListTable';
import InnoIcon from '@/components/Icons/InnoIcon';
import { renderMenuIcon } from '@/layouts/BasicLayout';

import AuthConfigContext from '../contexts/AuthConfigContext';

import styles from './style.less';
import { getFormattedLocale } from '@/common/utils';

const getAllRows = (menuList: any[], targets = []) => {
  _.map(menuList, (item: any) => {
    // @ts-ignore
    targets.push(item);
    if (item.items) {
      getAllRows(item.items, targets);
    }
  });

  return targets;
};

const { Text } = Typography;

const MenuConfigTable: React.FC = (props, ref) => {
  const { roleData, fetchRolesRequest } = useModel('Role');
  const { menuItems, fetchMenuItemsRequest } = useModel('Menu');
  const { menuAuthData, saveMenuAuthRequest, fetchMenuAuthsRequest } = useModel('RBAC');

  const { t } = useI18n(['rbac', 'common']);
  const { isEditing, editToggle } = useContext(AuthConfigContext);

  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{
    [key: string]: number[];
  }>({});

  useImperativeHandle(ref, () => ({
    onCancel: () => {
      getInitSelected();
    },
    onSubmit: () => {
      saveMenuAuthData();
    },
  }));

  useDeepCompareEffect(() => {
    getInitSelected();
  }, [menuItems, menuAuthData]);

  const getInitSelected = () => {
    const roles = {};

    _.each(
      menuAuthData,
      (
        rolesData: {
          roleId: number;
        }[],
        itemKey: string,
      ) => {
        roles[itemKey] = _.map(rolesData, (item) => item.roleId);
      },
    );

    setSelectedRoles(roles);
  };

  const handleRowExpand = useMemoizedFn((expanded, record) => {
    if (expanded) {
      // @ts-ignore
      expandedKeys.push(record.resourceId);
    } else {
      expandedKeys.splice(_.findIndex(expandedKeys, record.resourceId), 1);
    }
    setExpandedKeys([...expandedKeys]);
  });

  const toggleExpandedAll = (expanded: boolean) => () => {
    if (expanded) {
      const rows = getAllRows(menuItems as [], []);
      const keys = _.map(rows, (row: any) => row.resourceId);
      setExpandedKeys([...keys]);
    } else {
      setExpandedKeys([]);
    }
  };

  const saveMenuAuthData = async () => {
    try {
      const result = await saveMenuAuthRequest.runAsync(selectedRoles);

      if (result) {
        // @ts-ignore
        editToggle();
        fetchMenuAuthsRequest.run();
        message.success(t('common.error_message.save.success'));
      }
    } catch (e) {}
  };

  const formatHeaderColumn = () => {
    const columns: any[] = [
      {
        title: <span style={{ paddingLeft: 32 }}>{t('rbac.table.column.page')}</span>,
        dataIndex: 'name',
        width: '260px',
        fixed: 'left',
        render: (name: string, record: any) => {
          const expanded = expandedKeys.includes(record?.resourceId);
          const [locale] = getFormattedLocale();
          const value = record.i18nNames?.[locale] || name || '-';
          return (
            <Row align="middle">
              <Col flex="30px">
                {record?.items && record?.items?.length && (
                  <span
                    className={styles.expandIcon}
                    onClick={() => handleRowExpand(!expanded, record)}
                  >
                    {expanded ? (
                      <InnoIcon type="caret-down" size={16} />
                    ) : (
                      <InnoIcon type="caret-right" size={16} />
                    )}
                  </span>
                )}
              </Col>
              <Col flex="24px">{renderMenuIcon(record.icon)}</Col>
              <Col>
                <Text
                  style={{ maxWidth: 240 }}
                  ellipsis={{ tooltip: value }}
                >
                  {value}
                </Text>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('rbac.table.column.group'),
        key: 'groups',
        width: '120px',
        fixed: 'left',
        align: 'center',
        dataIndex: 'groups',
        render: (t: any, r: any) => {
          const itemKey = r.itemKey;
          const roleIds = selectedRoles[itemKey] || [];
          const checked = roleIds.length > 0;
          const indeterminate = !!(roleIds.length && roleData && roleData.list && roleIds.length < roleData.list?.length);

          return (
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={(e) => onCheckAllChange(e, r)}
              className={styles[isEditing ? '' : 'noChecked']}
            />
          );
        },
      },
    ];

    // @ts-ignore
    const addItems: any[] = _.map(roleData.list, (role: any) => ({
      title: role.roleName,
      width: '120px',
      align: 'center',
      dataIndex: role.roleId,
      render: (roleId: any, record: any) => {
        const itemKey = record.itemKey;
        const noChecked = !selectedRoles[itemKey]?.find(
          (selectedRoleId) => selectedRoleId === role.roleId,
        );

        return (
          <div className={styles[isEditing ? '' : 'noChecked']}>
            <Checkbox
              value={role.roleId}
              checked={!noChecked}
              onChange={(e) => onCheckboxChange(e, itemKey, role.roleId)}
            />
          </div>
        );
      },
    }));

    return [...columns.concat(addItems)];
  };

  const onCheckboxChange = (e: any, itemKey: string, roleId: number) => {
    if (!isEditing) return;

    const roles = selectedRoles[itemKey] || [];
    const index = roles.indexOf(roleId);

    if (index > -1) {
      roles.splice(index, 1);
    } else {
      roles.push(roleId);
    }

    selectedRoles[itemKey] = [...roles];

    setSelectedRoles({
      ...selectedRoles,
    });
  };

  const onCheckAllChange = useMemoizedFn(
    (
      e: any,
      item: {
        itemKey: string;
        subItems?: any;
      },
    ) => {
      if (!isEditing) return;

      const isChecked = e.target.checked;
      const allRoleIds = _.map(roleData.list, (role) => role.roleId);

      const updateRoles = (menu) => {
        const itemKey = menu.itemKey;

        if (isChecked) {
          selectedRoles[itemKey] = allRoleIds;
        } else {
          selectedRoles[itemKey] = [];
        }

        if (menu.subItems) {
          _.each(menu.subItems, (subItem) => updateRoles(subItem));
        }
      };

      updateRoles(item);

      setSelectedRoles({
        ...selectedRoles,
      });
    },
  );

  const renderDataList = () => {
    const headerColumn = formatHeaderColumn();

    return (
      <ListTable
        scroll={{ x: 1100 }}
        rowKey="resourceId"
        columns={headerColumn}
        dataSource={menuItems}
        expandable={{
          expandedRowKeys: expandedKeys,
          childrenColumnName: 'items',
          // onExpand: handleRowExpand,
          expandIcon: () => null,
        }}
        pagination={false}
        loading={
          fetchMenuItemsRequest.loading ||
          fetchMenuAuthsRequest.loading ||
          fetchRolesRequest.loading
        }
      />
    );
  };

  return (
    <div className={styles.menuTable}>
      {/*<Space className={styles.operateButton}>*/}
      {/*    <Button onClick={toggleExpandedAll(true)}><DownOutlined/> 展开</Button>*/}
      {/*    <Button onClick={toggleExpandedAll(false)}><UpOutlined/> 折叠</Button>*/}
      {/*</Space>*/}

      {renderDataList()}
    </div>
  );
};

// @ts-ignore
export default React.forwardRef(MenuConfigTable);
