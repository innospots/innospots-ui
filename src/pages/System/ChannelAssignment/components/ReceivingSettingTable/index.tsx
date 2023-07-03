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

import React, { useContext, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Checkbox, Col, message, Row, Space, Spin } from 'antd';
import {
  DesktopOutlined,
  DownOutlined,
  SettingOutlined,
  SlidersOutlined,
  UpOutlined,
} from '@ant-design/icons';

import _ from 'lodash';
import { useModel } from 'umi';

import { useDeepCompareEffect, useMemoizedFn } from 'ahooks';
import { randomString } from '@/common/utils';
import useI18n from '@/common/hooks/useI18n';
import ListTable from '@/components/ListTable';
import InnoIcon from '@/components/Icons/InnoIcon';
import ReceivingConfigContext from '../contexts/ReceivingConfigContext';

import styles from './style.less';

const IconMap = {
  system: <SettingOutlined />,
  desktop: <DesktopOutlined />,
  dataSource: <SettingOutlined />,
  configuration: <SlidersOutlined />,
};

const getAllRows = (menuList: any[], targets = []) => {
  _.map(menuList, (item: any) => {
    // @ts-ignore
    targets.push(item);
    if (item.subItems) {
      getAllRows(item.subItems, targets);
    }
  });

  return targets;
};

const Index: React.FC = (props, ref) => {
  const {
    channels,
    moduleEventList,
    messageSettingList,

    channelsRequest,
    settingEventsRequest,
    messageSettingListRequest,
    saveReceivingSettingRequest,
  } = useModel('Notification');

  const { roleData, fetchRolesRequest } = useModel('Role');

  const { t } = useI18n(['notification', 'common']);
  const { isEditing, editToggle } = useContext(ReceivingConfigContext);

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
  const [headerColumn, setHeaderColumn] = useState<any[]>([]);

  useImperativeHandle(ref, () => ({
    onCancel: () => {
      formatDataSource();
    },
    onSubmit: () => {
      onSubmit();
    },
  }));

  useEffect(() => {
    fetchTableData();
  }, []);

  useDeepCompareEffect(() => {
    formatDataSource();
  }, [moduleEventList, messageSettingList]);

  useDeepCompareEffect(() => {
    formatHeaderColumn();
  }, [channels, roleData, isEditing, expandedKeys]);

  const fetchTableData = () => {
    channelsRequest.run();
    fetchRolesRequest.run();
    settingEventsRequest.run();
    messageSettingListRequest.run();
  };

  const handleRowExpand = useMemoizedFn((expanded, record) => {
    if (expanded) {
      // @ts-ignore
      expandedKeys.push(record.key);
    } else {
      expandedKeys.splice(
        _.findIndex(expandedKeys, (key) => key == record.key),
        1,
      );
    }

    setExpandedKeys([...expandedKeys]);
  });

  // 展开、收起
  const toggleExpandedAll = (expanded: boolean) => () => {
    if (expanded) {
      const rows = getAllRows(dataSource as [], []);
      const keys = _.map(rows, (row: any) => row.key);

      setExpandedKeys([...keys]);
    } else {
      setExpandedKeys([]);
    }
  };

  const formatModuleEventList = useMemoizedFn((dataSource) => {
    const eventKeys = Object.keys(moduleEventList);
    _.map(eventKeys, (key: any) => {
      const app = moduleEventList[key] || {};
      let subItems: any = [];
      _.map(moduleEventList[key].modules, (module) => {
        const events = module.events;
        subItems.push({
          name: module.moduleName,
          key: module.moduleKey,
          extKey: app.extKey,
          extName: app.extName,
          moduleKey: module.moduleKey,
          moduleName: module.moduleName,
          subItems: _.map(events, (sub: any) => ({
            key: sub.eventCode,
            name: sub.eventName,
            extKey: app.extKey,
            extName: app.extName,
            moduleKey: module.moduleKey,
            moduleName: module.moduleName,
            eventCode: sub.eventCode,
            eventName: sub.eventName,
          })),
        });
      });

      const addItem = {
        key: app.extKey,
        name: app.extName,
        extKey: app.extKey,
        extName: app.extName,
        subItems,
      };
      dataSource.push(addItem);
    });
  });

  const formatModuleSettingData = useMemoizedFn((dataSource) => {
    const renderTargetObject= (item, setting) => {
      Object.assign(item, {key: setting.settingId || randomString(4),..._.pick(setting, 'channels', 'groups')})
    }


    _.map(messageSettingList, (setting: any) => {
      const targetIndexs= getTargetIndexs(dataSource, setting)
      const appItem= !_.isUndefined(targetIndexs[0]) && dataSource[targetIndexs[0]]
      const moduleItem= appItem && appItem.subItems[targetIndexs[1]]
      const eventItem= moduleItem && moduleItem.subItems[targetIndexs[2]]

      if(setting.eventCode && eventItem) {
        renderTargetObject(eventItem, setting)
      }else if(setting.moduleKey && moduleItem) {
        renderTargetObject(moduleItem, setting)
      }else if(setting.extKey && appItem){
        renderTargetObject(appItem, setting)
      }
    })

  });

  // 获取目标对象在源数据里的各层级索引集合
  const getTargetIndexs = (dataSource, settingItem) => {
    let indexList: any = []

    _.map(dataSource, (app: any, appIndex: any) => {
      // app
      if(app.extKey === settingItem.extKey) {
        indexList[0] = appIndex

        _.map(dataSource[appIndex].subItems, (module: any, moduleIndex: any) => {
          // module
          if(module.moduleKey === settingItem.moduleKey) {
            indexList[1] = moduleIndex

            _.map(dataSource[appIndex].subItems[moduleIndex].subItems, (event: any, eventIndex: any) => {
              // event
              if(event.eventCode === settingItem.eventCode) {
                indexList[2] = eventIndex
              }
            });
          }
        });

      }
    });

    return indexList
  }

  const formatDataSource = useMemoizedFn(() => {
    const dataSource = [];
    // 步骤一，先格式化应用名称
    formatModuleEventList(dataSource);
    // 步骤二，格式化对应勾选项
    formatModuleSettingData(dataSource);
    setDataSource(dataSource);
  });

  const onSubmit = () => {
    let data = [...getAllRows(dataSource, [])];
    _.map(data, (da: any) => {
      delete da.key;
      // delete da.name;
      delete da.subItems;
    });

    saveReceivingSetting(data);
  };

  const saveReceivingSetting = async (values: any) => {
    try {
      const result = await saveReceivingSettingRequest.runAsync(values);

      if (result) {
        // @ts-ignore
        editToggle();
        fetchTableData();
        message.success(t('common.error_message.save.success'));
      }
    } catch (e) {}
  };

  const formatHeaderColumn = () => {
    const columns: any[] = [
      {
        title: (
          <span style={{ paddingLeft: 32 }}>{t('notification.assignment.column.app_name')}</span>
        ),
        dataIndex: 'name',
        width: '260px',
        key: 'name',
        fixed: 'left',
        render: (name: string, record: any) => {
          const expanded = expandedKeys.includes(record?.key);
          return (
            <Row align="middle">
              <Col flex="30px">
                {record?.subItems && record?.subItems?.length && (
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
              <Col>
                <span>{name || '-'}</span>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('notification.assignment.column.all_roles'),
        key: 'groups',
        width: '80px',
        fixed: 'left',
        dataIndex: 'groups',
        render: (t: any, r: any) => {
          const checked = r.groups?.length > 0;
          // @ts-ignore
          const indeterminate = r.groups?.length < roleData.list?.length;

          return (
            <Checkbox
              checked={checked}
              indeterminate={checked && indeterminate}
              onChange={(e) => onCheckAllChange(e, r)}
              className={styles[isEditing ? '' : 'noChecked']}
            />
          );
        },
      },
    ];

    const channelList: any[] = _.map(channels, (channel: any) => ({
      title: channel.channelName,
      width: '100px',
      fixed: 'left',
      key: channel.channelId,
      render: (channelId: any, record: any) => {
        const noChecked = !record.channels?.find(
          (channelId) => channelId == channel.channelId,
        );

        return (
          <div className={styles[isEditing ? '' : 'noChecked']}>
            <Checkbox
              checked={!noChecked}
              value={channel.channelId}
              onChange={(e) => onCheckboxChange(e, record, channel, 'channels')}
            />
          </div>
        );
      },
    }));

    columns.splice(1, 0, ...channelList);

    const roleList: any[] = _.map(roleData.list, (role: any) => ({
      title: role.roleName,
      width: '100px',
      key: role.roleId,
      dataIndex: role.roleId,
      render: (roleId: any, record: any) => {
        const noChecked = !record.groups?.find((roleId: any) => roleId == role.roleId);

        return (
          <div className={styles[isEditing ? '' : 'noChecked']}>
            <Checkbox
              value={role.roleId}
              checked={!noChecked}
              onChange={(e) => onCheckboxChange(e, record, role, 'groups')}
            />
          </div>
        );
      },
    }));

    setHeaderColumn([...columns.concat(roleList)]);
  };

  const onCheckboxChange = useMemoizedFn((e: any, record: any, role: any, type: string) => {
    if (!isEditing) return;

    const list = _.cloneDeep(dataSource);
    const changeOptions = (list: any[]) => {
      if (!list) return;

      _.map(list, (li: any) => {
        if (li.key === record.key) {
          // 是否包含选项，包含则剔除，不包含则加上
          const selectedIndex = record[type]?.findIndex(
            (selectedItem: any) => selectedItem == e.target.value,
          );

          if (selectedIndex > -1) {
            record[type]?.splice(selectedIndex, 1);
          } else {
            record[type] = [...(record[type] || []), e.target.value];
          }

          li[type] = [...record[type]];
        } else if (li.subItems) {
          changeOptions(li.subItems);
        }
      });
    };

    changeOptions(list);
    setDataSource([...list]);
  });

  const onCheckAllChange = useMemoizedFn((e: any, record: any) => {
    if (!isEditing) return;

    const newList = _.cloneDeep(dataSource);

    const changeOptions = (list: any) => {
      _.map(list, (l, index) => {
        if (l.key === record.key) {
          list[index].groups = e.target.checked ? roleData.list?.map((role) => role.roleId) : [];
        } else {
          changeOptions(l.subItems);
        }
      });
    };

    changeOptions(newList);
    setDataSource([...newList]);
  });

  return (
    <div className={styles.receivingTable}>
      <Space>
        <Button onClick={toggleExpandedAll(true)}>
          <DownOutlined /> {t('common.button.expand')}{' '}
        </Button>
        <Button onClick={toggleExpandedAll(false)}>
          <UpOutlined /> {t('common.button.collapse')}
        </Button>
      </Space>

      <div style={{ marginTop: 36 }}>
        <Spin
          spinning={fetchRolesRequest.loading || saveReceivingSettingRequest.loading}
          style={{ marginTop: 36 }}
        >
          <ListTable
            noSpacing
            rowKey="key"
            scroll={{ x: 1000 }}
            columns={headerColumn}
            dataSource={dataSource}
            expandable={{
              expandedRowKeys: expandedKeys,
              childrenColumnName: 'subItems',
              // onExpand: handleRowExpand,
              expandIcon: () => null,
            }}
            loading={settingEventsRequest.loading || messageSettingListRequest.loading}
          />
        </Spin>
      </div>
    </div>
  );
};

// @ts-ignore
export default React.forwardRef(Index);
