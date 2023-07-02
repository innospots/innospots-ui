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

import React from 'react';
import _ from 'lodash';

import { ExclamationCircleOutlined, MoreOutlined } from '@ant-design/icons';
import { Row, Col, Menu, Spin, Empty, Typography, Dropdown, message, Modal, Select } from 'antd';

import InnoIcon from '@/components/Icons/InnoIcon';
import useI18n from '@/common/hooks/useI18n';
import { usePermission, permissionWarning } from '@/components/PermissionSection';

import type { Categories, ICategoryItem } from '@/common/types/Types';

import styles from './style.less';

const { Paragraph } = Typography;

export type CategoriesPaneProps = {
  title?: string;
  loading?: boolean;
  categories: Categories;
  createTooltip?: string;
  folderIcon?: string;
  categoryId?: number;
  showCount?: boolean;
  createDisabled?: boolean;
  dropdownDisabled?: any;
  permissions?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  onCreate?: () => void;
  onToggle?: (collapsed: boolean) => void;
  onUpdate?: (category: ICategoryItem) => void;
  onDelete?: (category: ICategoryItem) => void;
  onSelected?: (categoryId: number) => void;
};

export const CategorySelector: React.FC<CategoriesPaneProps> = (props) => {
  const { title, categories, categoryId, onToggle, onSelected } = props;

  const { t } = useI18n(['common']);

  return (
    <Row align="middle" className={styles.categorySelector}>
      <Col>
        <span className={styles.title}>{title}</span>
      </Col>
      <Col>
        {!_.isUndefined(categoryId) ? (
          <Select
            size="small"
            bordered={false}
            value={(categoryId || 0) * 1}
            options={categories?.map((item) => ({
              value: item.categoryId,
              label: item.categoryName,
            }))}
            suffixIcon={
              <span style={{ color: '#4E5969' }}>
                <InnoIcon size={16} type="caret-down" />
              </span>
            }
            dropdownMatchSelectWidth={false}
            onSelect={onSelected}
          />
        ) : (
          <span className={styles.title}> - </span>
        )}
      </Col>
      <Col>
        <span
          className="g-button"
          title={t('common.tooltip.category.expand')}
          onClick={() => onToggle?.(false)}
        >
          <InnoIcon type="circle-add" size={16} />
        </span>
      </Col>
    </Row>
  );
};

const CategoriesPane: React.FC<CategoriesPaneProps> = (props) => {
  const {
    title,
    loading,
    showCount = true,
    categories,
    categoryId,
    permissions,
    folderIcon = 'folder',
    createTooltip,
    createDisabled,
    dropdownDisabled,
    onToggle,
    onCreate,
    onUpdate,
    onDelete,
    onSelected,
  } = props;

  const { t } = useI18n(['common']);

  const [deleteAuth] = usePermission(permissions?.delete as string);
  const [updateAuth] = usePermission(permissions?.update as string);
  const [createAuth] = usePermission(permissions?.create as string);

  const showPermissionWarning = () => {
    permissionWarning({
      title: t('common.tips.title'),
      content: t('common.error_message.no_auth_warning'),
    });
  };

  const onCategoryClicked = ({ key }) => {
    onSelected?.(key * 1);
  };

  const onCategoryContextMenuClicked =
    (category: ICategoryItem) =>
    ({ key, domEvent }: any) => {
      domEvent.stopPropagation();

      if ((key === 'update' && !updateAuth) || (key === 'delete' && !deleteAuth)) {
        showPermissionWarning();
        return;
      }

      if (key === 'update') {
        onUpdate?.(category);
      } else if (key === 'delete') {
        if (category.totalCount > 0) {
          message.warning(t('common.notification.category.not_empty'));
          return;
        }
        Modal.confirm({
          title: t('common.category.delete.title'),
          icon: <ExclamationCircleOutlined />,
          content: t('common.category.delete.content'),
          okText: t('common.button.confirm'),
          cancelText: t('common.button.cancel'),
          onOk: () => onDelete?.(category),
        });
      }
    };

  const renderPageCategoryDropdown = (category: ICategoryItem) => {
    const menu = (
      <Menu
        items={[{
          key: 'update',
          icon: <InnoIcon type="edit-alt" />,
          label: <span>{t('common.button.edit')}</span>
        }, {
          key: 'delete',
          icon: <InnoIcon type="delete" />,
          label: <span>{t('common.button.delete')}</span>
        }]}
        onClick={onCategoryContextMenuClicked(category)}
      />
    );

    return (
      <Dropdown overlay={menu}>
        <span className="g-button" onClick={(e) => e.stopPropagation()}>
          <MoreOutlined />
        </span>
      </Dropdown>
    );
  };

  return (
    <div className={styles.categoryPane}>
      <div className={styles.inner}>
        <Row className={styles.header} align="middle" justify="space-between">
          <Col>
            <Row gutter={8} align="middle">
              <Col>
                <span className={styles.title}>{title}</span>
              </Col>
              {!createDisabled && (
                <Col>
                  <span
                    className="g-button"
                    title={createTooltip || t('common.tooltip.category.create')}
                    onClick={() => {
                      if (createAuth) {
                        onCreate?.();
                      } else {
                        showPermissionWarning();
                      }
                    }}
                  >
                    <InnoIcon type="folder-add" size={16} />
                  </span>
                </Col>
              )}
            </Row>
          </Col>
          <Col>
            <span
              className="g-button"
              title={t('common.tooltip.category.collapse')}
              onClick={() => onToggle?.(true)}
            >
              <InnoIcon type="close" size={16} />
            </span>
          </Col>
        </Row>
        <div className={styles.menuList}>
          {categories?.length ? (
            <Menu
              mode="inline"
              selectedKeys={[categoryId + '']}
              items={categories?.map((category: ICategoryItem) => (
                {
                  key: category.categoryId,
                  label: (
                    <Row justify="space-between">
                      <Col>
                        <Row gutter={[6, 0]} align="middle">
                          {category.categoryId == -1 ? (
                            <Col>
                              <InnoIcon type="delete" />
                            </Col>
                          ) : (
                            <Col>
                              <InnoIcon type={folderIcon} />
                            </Col>
                          )}
                          <Col>
                            <Paragraph ellipsis title={category.categoryName}>
                              {category.categoryName}
                            </Paragraph>
                          </Col>
                          {
                            showCount && (
                              <Col>({category.totalCount})</Col>
                            )
                          }
                        </Row>
                      </Col>
                      {(_.isFunction(dropdownDisabled) ? !dropdownDisabled(category) : !dropdownDisabled) && (
                        <Col>
                          {category.categoryId !== 0 && category.categoryId !== -1
                            ? renderPageCategoryDropdown(category)
                            : null}
                        </Col>
                      )}
                    </Row>
                  )
                }
              ))}
              onClick={onCategoryClicked}
            />
          ) : (
            <div>{loading ? <Spin style={{width: '100%'}} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPane;
