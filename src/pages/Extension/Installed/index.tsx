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

import {
  Col,
  Row,
  Tag,
  Space,
  Input,
  Button,
  message,
  Tooltip,
  Popconfirm,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';

import { useModel, useHistory } from 'umi';

import { useSetState, useDeepCompareEffect } from 'ahooks';

import _ from 'lodash';

import styles from './style.less';
import useI18n from '@/common/hooks/useI18n';
import PermissionSection from '@/components/PermissionSection';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import PageLoading from '@/components/PageLoading';
import NiceAvatar from '@/components/Nice/NiceAvatar';
import StatusTag from '@/components/StatusTag';

const { Paragraph, Text } = Typography;

export const STATUS_TAG_COLORS = {
  AVAILABLE: {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  INSTALLED: {
    color: '#959EAD',
    bgColor: '#E9EDF1',
  },
  ENABLED: {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  DISABLED: {
    color: '#959EAD',
    bgColor: '#E9EDF1',
  },
};

export const STATUS_TAG = {
  AVAILABLE: {
    operateState: 'install',
    icon: <VerticalAlignBottomOutlined />,
    text: 'app.main.status.compatible',
    tooltipText: 'app.main.operation.install',
    confirmText: 'app.main.whether.version.install',
  },
  INSTALLED: {
    icon: null,
    tooltipText: null,
    confirmText: null,
    operateState: null,
    text: 'app.main.status.required_restart',
  },
  ENABLED: {
    operateState: 'disabled',
    text: 'common.options.activate',
    icon: <PauseCircleOutlined />,
    tooltipText: 'common.options.deactivate',
    confirmText: 'app.main.whether.version.activate',
  },
  DISABLED: {
    operateState: 'enabled',
    icon: <PlayCircleOutlined />,
    text: 'common.options.deactivate',
    tooltipText: 'common.options.activate',
    confirmText: 'app.main.whether.version.deactivate',
  },
};
const Index: React.FC = () => {
  const { changeAppStatus, installedAppList, getInstalledAppList } = useModel('Application');

  const history = useHistory();
  const { t, loading: i18nLoading } = useI18n(['app', 'common']);

  const [queryData, setQueryData] = useSetState({});

  useDeepCompareEffect(() => {
    getListData();
  }, [queryData]);

  const getListData = () => {
    getInstalledAppList.run(queryData);
  };

  const handleHeaderButtonClick = () => {
    history.push('/applications/store');
  };

  const renderPageHeader = () => {
    return (
      <Row>
        <Col flex="none">
          <PageTitle title={t('app.main.title')} />
        </Col>
        <Col flex="auto">
          <Row justify="space-between" style={{ padding: '20px 0 0 24px' }}>
            <Col>
              <PermissionSection itemKey="I18nCurrency-createCurrency">
                <Button type="primary" onClick={() => handleHeaderButtonClick()}>
                  {t('app.main.button.app_store')}
                </Button>
              </PermissionSection>
            </Col>

            <Col>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('app.main.input.search.placeholder')}
                style={{ width: 220, backgroundColor: '#fff', borderColor: '#fff' }}
                onPressEnter={(event) => setQueryData({ name: event.target.value })}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };

  const handleClickChangeStatus = async (record) => {
    if (!STATUS_TAG[record.status].operateState) return;

    const result = await changeAppStatus.runAsync({
      appKey: record.appKey,
      operateState: STATUS_TAG[record.status].operateState,
    });

    if (result?.code === '10000') {
      message.success(`${t(STATUS_TAG[record.status].tooltipText)}${t('common.options.success')}`);
      getListData();
    } else {
      message.error(`${t(STATUS_TAG[record.status].tooltipText)}${t('common.options.failure')}`);
    }
  };

  const renderDataContent = () => {
    const columns: any[] = [
      {
        title: t('app.main.column.name'),
        key: 'name',
        dataIndex: 'name',
        render: (name, record) => {
          const colors = STATUS_TAG_COLORS[record.status];

          return (
            <Row>
              <Col flex="32px" style={{ padding: '6px 0' }}>
                <NiceAvatar size={32} src={record.icon} />
              </Col>
              <Col className={styles.appNameDiv}>
                <Row>
                  <Col flex="none" style={{ fontWeight: 600 }}>
                    {name || '-'}
                  </Col>
                  <Col flex="auto" style={{ paddingLeft: 12 }}>
                    {/*<StatusTag status={record.status === 'AVAILABLE' ? 'ONLINE' : 'OFFLINE'}/>*/}
                    <Tag
                      color={colors.bgColor}
                      style={{
                        color: colors.color,
                      }}
                      className={styles.tag}
                    >
                      {t(STATUS_TAG[record.status].text)}
                    </Tag>
                  </Col>
                </Row>
                <div className={styles.authorDiv}>
                  <span>{t('app.main.description.author')}: </span>
                  <span>{record.vendor || '-'}</span>
                </div>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('app.main.column.version'),
        key: 'installVersion',
        dataIndex: 'installVersion',
      },
      {
        title: t('app.main.column.desc'),
        key: 'description',
        width: '50%',
        dataIndex: 'description',
        render: (des, record) => {
          return (
            <div className={styles.linkText}>
              <Paragraph ellipsis={{ rows: 2, tooltip: des }}>{des}</Paragraph>
              {/*<a href="#"> <DoubleRightOutlined/>查看详情</a>*/}
            </div>
          );
        },
      },
      {
        title: t('common.table.column.action'),
        key: 'operate',
        dataIndex: 'operate',
        width: 80,
        // align: 'center',
        render: (operate: any, record: any) => {
          if (record.appSource === 'CORE') return;
          if (!STATUS_TAG[record.status].icon) return;

          return (
            <Space size={8}>
              <PermissionSection itemKey="I18nCurrency-updateStatus">
                <Tooltip title={t(STATUS_TAG[record.status].tooltipText)}>
                  <Popconfirm
                    title={t(STATUS_TAG[record.status].confirmText)}
                    okText={t('common.button.confirm')}
                    cancelText={t('common.button.cancel')}
                    placement="left"
                    okButtonProps={{
                      loading: changeAppStatus.loading,
                    }}
                    onConfirm={() => handleClickChangeStatus(record)}
                  >
                    <span className="g-button opa">{STATUS_TAG[record.status].icon}</span>
                  </Popconfirm>
                </Tooltip>
              </PermissionSection>

              {/*
              <PermissionSection itemKey="I18nCurrency-updateStatus">
                <Tooltip title={t('设置')}>
                <span
                  className="g-button opa"
                  onClick={() => {
                    setModalType('update');
                    setEditData(record);
                    currencyModalToggle();
                  }}
                >
                    <SettingOutlined />
                </span>
                </Tooltip>
              </PermissionSection>

              <PermissionSection itemKey="I18nCurrency-deleteCurrency">
                {
                  record.status === 'DISABLED' && (
                    <Tooltip title={t('删除')}>
                      <Popconfirm
                        title={t('是否删除该应用?')}
                        okText={t('common.button.confirm')}
                        cancelText={t('common.button.cancel')}
                        placement="left"
                        okButtonProps={{
                          //loading: deleteCurrency.loading
                        }}
                        onConfirm={deleteCurCurrency(record.currencyId)}
                      >
                        <span className="g-button opa">
                            <DeleteOutlined/>
                        </span>
                      </Popconfirm>
                    </Tooltip>
                  )
                }
              </PermissionSection>
*/}
            </Space>
          );
        },
      },
    ];

    const expandable: any = {
      defaultExpandAllRows: true,
      rowExpandable: (record) => record.lastVersion && record.lastVersion !== record.version,
      expandedRowRender: (record) =>
        record.lastVersion ? (
          <div className={styles.versionMess}>
            <Text style={{ width: 600 }} ellipsis={{ tooltip: record.lastDescription }}>
              `${t('app.main.description.latest_version')}${record.lastVersion}`：
              {record.lastDescription}
            </Text>
            {/*｜ <a href="#">查看版本{record.lastVersion}详情</a>或<a href="#">立即更新</a>。*/}
          </div>
        ) : null,
    };

    const isExpand = !!_.find(
      installedAppList,
      (li: any) => li.lastVersion && li.lastVersion !== li.version,
    );

    return (
      <div className={styles.listWrapper}>
        <ListTable
          noSpacing
          columns={columns}
          rowKey="appInstallmentId"
          dataSource={installedAppList}
          loading={getInstalledAppList.loading}
          expandable={isExpand ? expandable : null}
        />
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderDataContent()}
    </>
  );
};

export default Index;
