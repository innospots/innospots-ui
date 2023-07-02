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

import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import {useMemoizedFn} from 'ahooks';
import update from 'immutability-helper';
import {Col, message, Row, Typography, Empty} from 'antd';
import {HolderOutlined} from '@ant-design/icons';
import { ReactSortable } from "react-sortablejs";

import StatusTag from '@/components/StatusTag';
import useI18n from '@/common/hooks/useI18n';
import InnoIcon from '@/components/Icons/InnoIcon';
import {renderMenuIcon} from '@/layouts/BasicLayout';
import { getFormattedLocale } from '@/common/utils';
import {MENU_TYPES} from '@/common/constants';
import {transform} from '@/common/utils/I18nMap';
import IconButton from '@/components/IconButton';
import useModal from '@/common/hooks/useModal';

import { updateMenuOrder } from '@/services/Menu';

import MenuModal, { MODAL_NAME } from '../MenuModal';

import styles from './style.less';

type MenuItem = {
  id: number|string
  uri: string
  icon: string
  name: string
  status: string
  itemKey: string
  openMode: string
  itemType: string
  parentId: number
  resourceId: number
  subItems?: MenuItem[]
  i18nNames: string[]
};

let timer;

const MenuList:React.FC<{
  dataSource: MenuItem[]
  expandedItemKeys: number[]
  fetchMenuList: (queryData?: any) => void
}> = ({ dataSource, expandedItemKeys, fetchMenuList }) => {
  const { deleteMenuRequest, updateMenuStatusRequest } = useModel('Menu');

  const [modal] = useModal(MODAL_NAME);
  const [cloneData, setCloneData] = useState<MenuItem[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
  const { t } = useI18n(['menu', 'common']);

  const noop = useMemoizedFn(_.noop);

  useEffect(() => {
    setExpandedKeys([
      ...expandedItemKeys
    ])
  }, [ expandedItemKeys ]);

  useEffect(() => {
    const update = (list: MenuItem[]) => {
      _.each(list, item => {
        item.id = item.id || item.resourceId;
        if (item.subItems) {
          update(item.subItems)
        }
      })
    }
    const _cloneData = _.cloneDeep(dataSource);
    update(_cloneData);

    setCloneData(_cloneData)
  }, [ dataSource ]);

  const handleRowExpand = useMemoizedFn((expanded, record) => {
    if (expanded) {
      expandedKeys.push(record.resourceId);
    } else {
      expandedKeys.splice(_.findIndex(expandedKeys, record.resourceId), 1);
    }
    setExpandedKeys([...expandedKeys]);
  });

  const updateMenusOrder = (data: any) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(async () => {
      await updateMenuOrder(data)
    }, 200)
  }

  const updateMenuItemStatus = (record: any, status: boolean) => () => {
    return new Promise<void>(async (resolve) => {
      if (record) {
        const result = await updateMenuStatusRequest.runAsync(record, status);
        if (result) {
          fetchMenuList();
          message.success(t('common.error_message.save.success'));
        }
      }

      resolve();
    });
  };

  const deleteMenuItem = (resourceId: number) => () => {
    return new Promise<void>(async (resolve) => {
      const result = await deleteMenuRequest.runAsync(resourceId);
      if (result) {
        resolve();
        fetchMenuList()
      }
    });
  };

  const handleMoveCard = useMemoizedFn((dragIndex: number, hoverIndex: number, parentId: number) => {
    let _findItem;
    const findItem = (items: MenuItem[], pid: number) => {
      _.find(items, item => {
        if (item.resourceId === pid) {
          _findItem = item;
          return true
        } else if (item.subItems) {
          return findItem(item.subItems, pid)
        }
      });
    }

    if (parentId) {
      findItem(cloneData, parentId);
      if (_findItem) {
        _findItem.subItems = update(_findItem.subItems, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, _findItem.subItems[dragIndex]],
          ],
        });
        updateMenusOrder({
          parentId,
          itemKeys: _.map(_findItem.subItems, item => item?.itemKey).filter(key => !!key)
        })
      }
      setCloneData(_.cloneDeep(cloneData))
    } else {
      const updatedList = update(cloneData, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, cloneData[dragIndex]],
        ],
      });
      setCloneData(updatedList);

      updateMenusOrder({
        parentId,
        itemKeys: _.map(updatedList, item => item?.itemKey).filter(key => !!key)
      })
    }
  })

  const handleIntoCategory = useMemoizedFn((id: number, parentId: number, newIndex: number) => {
    const itemData: {
      target: {
        parentId?: number
      },
      parent: {
        resourceId?: number
        subItems?: any[]
      }
    } = {
      target: {},
      parent: {},
    };
    const findItem = (items: MenuItem[], pid: number, type: 'target' | 'parent') => {
      _.find(items, (item, index) => {
        if (!item) return false;

        if (item.resourceId === pid) {
          itemData[type] = item;
          if (type === 'target') {
            items.splice(index, 1)
          }
          return true
        } else if (item.subItems) {
          return findItem(item.subItems, pid, type)
        }
      });
    }
    findItem(cloneData, id, 'target');

    if (parentId === 0) {
      // @ts-ignore
      const updatedList = update(cloneData, {$splice: [[newIndex, 0, itemData.target]]});
      setCloneData(updatedList);
      updateMenusOrder({
        parentId: 0,
        itemKeys: _.map(updatedList, item => item?.itemKey).filter(key => !!key)
      })
      return;
    }

    findItem(cloneData, parentId, 'parent');

    if (itemData.parent && itemData.target) {
      if (!itemData.parent.subItems) {
        itemData.parent.subItems = [];
      }

      itemData.parent.subItems = update(itemData.parent.subItems, {$splice: [[newIndex, 0, itemData.target]]})

      itemData.target.parentId = itemData.parent.resourceId;
      setCloneData(_.cloneDeep(cloneData));

      updateMenusOrder({
        parentId: itemData.parent.resourceId,
        itemKeys: _.map(itemData.parent.subItems, item => item?.itemKey).filter(key => !!key)
      })
    }
  })

  const handleSortEnd = useMemoizedFn(event => {
    const itemDataset = event.item.dataset;
    const itemId = itemDataset.id * 1;
    const parentId = itemDataset.parent;
    const targetId = event.to.parentNode.dataset.id;

    if (targetId != parentId) {
      handleIntoCategory(itemId, targetId * 1, event.newIndex)
    } else {
      handleMoveCard(event.oldIndex, event.newIndex, parentId * 1)
    }
  })

  const renderListHeader = () => (
    <div className={styles.listHead}>
      <div className={styles.cell} style={{width: 420}}>
        <span>{t('menu.main.column.menu_name')}</span>
      </div>
      <div className={styles.cell} style={{flex: 1}}>
        <span>{t('menu.main.column.url')}</span>
      </div>
      <div className={cls(styles.cell, styles.center)} style={{width: 100}}>
        <span>{t('menu.main.column.type')}</span>
      </div>
      <div className={cls(styles.cell, styles.center)} style={{width: 100}}>
        <span>{t('menu.main.column.open_method')}</span>
      </div>
      <div className={cls(styles.cell, styles.center)} style={{width: 80}}>
        <span>{t('menu.main.column.status')}</span>
      </div>
      <div className={cls(styles.cell, styles.center)} style={{width: 132}}>
        <span>{t('menu.main.column.action')}</span>
      </div>
    </div>
  );

  const renderDataList = (list: MenuItem[], groupId: number = 0, parentIds: number[] = []) => {

    return (
      <ReactSortable
        list={list || []}
        group="menuListGroup"
        handle=".drag-handler"
        setList={noop}
        onEnd={handleSortEnd}
      >
        {
          list?.length ? _.map(list, (item) => {
            if (!item) return null;

            const { id, status, itemType, openMode, resourceId, parentId } = item;
            const isCategory = itemType === 'CATEGORY';
            const expanded = expandedKeys.includes(resourceId);
            const [locale] = getFormattedLocale();
            const menuType = _.find(MENU_TYPES, (item) => item.value === itemType);

            return (
              <div key={id} data-id={id} data-parent={parentId} className={cls({
                [styles.expanded]: expanded
              })}>
                <div className={styles.listItem}>
                  <div className={styles.cell} style={{width: 420}}>
                    <Row align="middle" style={{width: '100%'}}>
                      <Col flex={`${parentIds.length * 16}px`} />
                      <Col
                        flex="24px"
                        className="drag-handler"
                      >
                        <HolderOutlined />
                      </Col>
                      <Col flex="20px">
                        {isCategory && (
                          <span
                            className={styles.expandIcon}
                            onClick={() => handleRowExpand(!expanded, item)}
                          >
                            {expanded ? (
                              <InnoIcon type="caret-down" size={16} />
                            ) : (
                              <InnoIcon type="caret-right" size={16} />
                            )}
                          </span>
                        )}
                      </Col>
                      <Col flex="24px">{renderMenuIcon(item.icon)}</Col>
                      <Col>
                        <div style={{width: (320 - parentIds.length * 16)}}>
                          <Typography.Text ellipsis>
                            {item.i18nNames?.[locale] || item.name || '-'}
                          </Typography.Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className={styles.cell} style={{flex: 1}}>
                    <span>{ item.uri }</span>
                  </div>
                  <div className={cls(styles.cell, styles.center)} style={{width: 100}}>
                    <div className={styles.itemType}>
                      {menuType && <InnoIcon type={menuType.icon} size={12} />}
                      <span>{t(`menu.menu_type.${transform(itemType)}`)}</span>
                    </div>
                  </div>
                  <div className={cls(styles.cell, styles.center)} style={{width: 100}}>
                    <span>
                      { openMode ? t(`menu.main.link_target.${transform(openMode)}`) : '-' }
                    </span>
                  </div>
                  <div className={cls(styles.cell, styles.center)} style={{width: 80}}>
                    <StatusTag status={status ? 'ONLINE' : 'OFFLINE'} />
                  </div>
                  <div className={cls(styles.cell, styles.center)} style={{width: 132}}>
                    <>
                      {!status ? (
                        <IconButton
                          icon="play"
                          tooltip={t('common.text.activate')}
                          popConfirm={{
                            title: t('menu.main.tooltip.activate'),
                            onConfirm: updateMenuItemStatus(resourceId, true),
                            okButtonProps: {
                              loading: updateMenuStatusRequest.loading,
                            },
                          }}
                          permissions="MenuManagement-updateStatus"
                        />
                      ) : (
                        <IconButton
                          icon="pause"
                          tooltip={t('common.text.deactivate')}
                          popConfirm={{
                            title: t('menu.main.tooltip.deactivate'),
                            onConfirm: updateMenuItemStatus(resourceId, false),
                            okButtonProps: {
                              loading: updateMenuStatusRequest.loading,
                            },
                          }}
                          permissions="MenuManagement-updateStatus"
                        />
                      )}

                      <IconButton
                        icon="edit"
                        tooltip={t('common.tooltip.edit')}
                        permissions="MenuManagement-updateMenu"
                        onClick={() => {
                          modal.show(item);
                        }}
                      />

                      <IconButton
                        icon="delete"
                        tooltip={t('common.tooltip.delete')}
                        popConfirm={{
                          title: t('common.text.delete_confirmation'),
                          placement: 'topRight',
                          onConfirm: deleteMenuItem(resourceId),
                          okButtonProps: {
                            loading: deleteMenuRequest.loading,
                          },
                        }}
                        permissions="MenuManagement-deleteMenuById"
                      />
                    </>
                  </div>
                </div>
                {
                  isCategory && (
                    <section data-id={id} className={styles.subList}>
                      { item.subItems && renderDataList(item.subItems, resourceId, parentIds.concat(resourceId)) }
                    </section>
                  )
                }
              </div>
            )
          }) : (
            <div className={cls('placeholder', styles.listItem)}>
              <div className={styles.cell}>
                {t('menu.list.item.empty')}
              </div>
            </div>
          )
        }
      </ReactSortable>
    )
  }

  return (
    <div className={styles.listWrapper} data-id={0}>
      { renderListHeader() }
      { cloneData?.length ? renderDataList(cloneData, 0) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) }
    </div>
  )
}

export default MenuList;
