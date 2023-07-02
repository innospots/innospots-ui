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

import React, {useContext, useEffect, useImperativeHandle, useMemo, useState} from 'react';
import {Checkbox, Col, message, Row, Typography} from 'antd';
import { ColumnsType } from 'antd/es/table';

import {useModel} from 'umi';
import {useMemoizedFn} from 'ahooks';

import _ from 'lodash';

import {getFormattedLocale} from '@/common/utils';

import ListTable from '@/components/ListTable';
import useI18n from '@/common/hooks/useI18n';
import InnoIcon from '@/components/Icons/InnoIcon';
import {renderMenuIcon} from '@/layouts/BasicLayout';

import AuthConfigContext from '../contexts/AuthConfigContext';

import styles from './style.less';

const {Text} = Typography;
const ApplicationConfigTable: React.FC<{
  roleId: number;
}> = ({roleId}, ref) => {
  const {roleAuthData, saveRoleAuthRequest, roleAuthDataRequest} = useModel('RBAC');

  const {menuItems, fetchMenuItemsRequest} = useModel('Menu', (model) => ({
    menuItems: model.menuItems,
    fetchMenuItemsRequest: model.fetchMenuItemsRequest,
  }));

  const curRoleId = roleId;

  const {t} = useI18n(['rbac', 'common']);

  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);

  const {isEditing, editToggle} = useContext(AuthConfigContext);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const allItemKeys = useMemo(() => _.map(menuItems, (item) => item.itemKey), [menuItems]);
  const initSelectedItemKeys = useMemo(() => _.keys(roleAuthData), [roleAuthData]);

  useImperativeHandle(ref, () => ({
    onCancel: () => {
      getRoleAuthData(curRoleId);
    },
    onSubmit: () => {
      onSubmit();
    },
  }));

  useEffect(() => {
    setSelectedRoles(initSelectedItemKeys);
  }, [initSelectedItemKeys]);

  useEffect(() => {
    setExpandedKeys(allItemKeys);
  }, [allItemKeys]);

  useEffect(() => {
    if (curRoleId) {
      getRoleAuthData(curRoleId);
    }
  }, [curRoleId]);

  const getRoleAuthData = async (roleId: number) => {
    roleAuthDataRequest.runAsync(roleId);
  };

  const onSubmit = () => {
    const menuItemRoles = {};
    _.map(selectedRoles, (itemKey) => {
      menuItemRoles[itemKey] = [curRoleId * 1];
    });

    saveRoleAuthData(menuItemRoles);
  };

  const saveRoleAuthData = async (values: any) => {
    try {
      const result = await saveRoleAuthRequest.runAsync(values);

      if (result) {
        // @ts-ignore
        editToggle();
        getRoleAuthData(curRoleId);
        message.success(t('common.error_message.save.success'));
      }
    } catch (e) {
    }
  };

  const onCheckAllChange = useMemoizedFn((e: any, record: any) => {
    if (!isEditing) return;

    const {checked} = e.target;

    _.each(record.opts, (item) => {
      const index = selectedRoles.indexOf(item.itemKey);
      if (checked) {
        if (index < 0) {
          selectedRoles.push(item.itemKey);
        }
      } else if (index > -1) {
        selectedRoles.splice(index, 1);
      }
    });

    setSelectedRoles([...selectedRoles]);
  });

  const handleRowExpand = useMemoizedFn((expanded, record) => {
    if (expanded) {
      // @ts-ignore
      expandedKeys.push(record.itemKey);
    } else {
      expandedKeys.splice(expandedKeys.indexOf(record.itemKey), 1);
    }
    setExpandedKeys([...expandedKeys]);
  });

  const onCheckboxChange = useMemoizedFn((e: any, itemKey: string) => {
    if (!isEditing) return;

    const {checked} = e.target;

    if (checked) {
      selectedRoles.push(itemKey);
    } else {
      const index = selectedRoles.indexOf(itemKey);
      if (index > -1) {
        selectedRoles.splice(index, 1);
      }
    }

    setSelectedRoles([...selectedRoles]);
  });

  const renderListTable = () => {
    const columns:ColumnsType<any> = [
      {
        title: <span style={{paddingLeft: 32}}>{t('rbac.table.column.app')}</span>,
        width: 220,
        fixed: 'left',
        dataIndex: 'name',
        render: (name: string, record: any) => {
          const expanded = expandedKeys.includes(record?.itemKey);
          const [locale] = getFormattedLocale();
          const value = record.i18nNames?.[locale] || name || '-';

          return (
            <Row align="middle">
              {record?.items && record?.items?.length && (
                <Col flex="30px">
                    <span
                      className={styles.expandIcon}
                      onClick={() => handleRowExpand(!expanded, record)}
                    >
                      {expanded ? (
                        <InnoIcon type="caret-down" size={16}/>
                      ) : (
                        <InnoIcon type="caret-right" size={16}/>
                      )}
                    </span>
                </Col>
              )}
              {record.icon && renderMenuIcon(record.icon) && <Col flex="24px">{renderMenuIcon(record.icon)}</Col>}
              <Col>
                <Text
                  style={{width: 120}}
                  ellipsis={{tooltip: value}}
                >
                  {value}
                </Text>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('rbac.table.column.action'),
        dataIndex: 'operate',
        render: (operate: any, record: any) => {
          const operationItems = record.opts || [];
          const hasOpts = !!operationItems.length;
          const selectedItems = _.filter(
            operationItems,
            (item) => selectedRoles.indexOf(item.itemKey) > -1,
          );
          const indeterminate =
            selectedItems?.length > 0 && selectedItems?.length < operationItems.length;

          return (
            <Row gutter={8} className={styles[isEditing ? '' : 'noChecked']} wrap>
              {hasOpts && (
                <Col>
                  <Checkbox
                    indeterminate={indeterminate}
                    checked={selectedItems?.length > 0}
                    onChange={(e) => onCheckAllChange(e, record)}
                  >
                    {t('common.button.select_all')}
                  </Checkbox>
                </Col>
              )}
              {operationItems.map((item, index) => (
                <Col>
                  <Checkbox
                    value={item.itemKey}
                    key={item.itemKey}
                    checked={selectedRoles.indexOf(item.itemKey) > -1}
                    onChange={(e) => onCheckboxChange(e, item.itemKey)}
                  >
                    {item.label || item.name}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          );
        },
      },
    ];

    return (
      <div className={styles.dataViewList}>
        {/*<Space className={styles.operateButton}>*/}
        {/*    <Button onClick={toggleExpandedAll(true)}><DownOutlined/> 展开</Button>*/}
        {/*    <Button onClick={toggleExpandedAll(false)}><UpOutlined/> 折叠</Button>*/}
        {/*</Space>*/}
        <div className={styles.dataList}>
          <ListTable
            rowKey="itemKey"
            columns={columns}
            expandable={{
              expandedRowKeys: expandedKeys,
              childrenColumnName: 'items',
              // onExpand: handleRowExpand,
              expandIcon: () => null,
            }}
            dataSource={menuItems}
            loading={fetchMenuItemsRequest.loading || roleAuthDataRequest.loading}
          />
        </div>
      </div>
    );
  };

  const renderPageContainer = () => {
    return <div className={styles.pageContainer}>{renderListTable()}</div>;
  };

  return renderPageContainer();
};

// @ts-ignore
export default React.forwardRef(ApplicationConfigTable);
