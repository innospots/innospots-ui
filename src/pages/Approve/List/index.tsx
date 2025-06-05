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
import _ from 'lodash';
import { history } from 'umi';
import React, { useEffect, useState, useMemo } from 'react';
import { Col, Row, Tag, Form, Button, DatePicker, Typography, Select, Input } from 'antd';

import {
  PlusOutlined,
  SearchOutlined,
  ProfileOutlined,
  RollbackOutlined,
  FileDoneOutlined,
  FieldTimeOutlined,
  InteractionOutlined,
} from '@ant-design/icons';

import { useSetState, useDebounceEffect } from 'ahooks';

import * as Service from '@/services/App';
import * as ApproveService from '@/services/Approve';

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import PageHelmet from '@/components/PageHelmet';
import { DEFAULT_PAGINATION_SETTINGS, APPROVE_STATUS_TYPES } from '@/common/constants';

import ListTable from '@/components/ListTable';
import { KeyValues } from '@/common/types/Types';
import IconButton from '@/components/IconButton';

import ExecutionRecordModal from '../components/ExecutionRecordModal';
import ExtensionFields from '../components/ExtensionFields';
import { useExtensionFields } from '../components/ExtensionFields/useExtensionFields';

import styles from '../style.less';

const FormItem = Form.Item;
const { Paragraph } = Typography;

let _approveTypes: any[];
const DATE_FORMAT = 'YYYY-MM-DD HH:mm';
const Index: React.FC = () => {
  const { t, loading: i18nLoading } = useI18n(['task', 'common', 'approve']);
  const [, extensionColumns] = useExtensionFields();

  const [listLoading, setListLoading] = useState(true);
  const [executionData, setExecutionData] = useState<any>({
    record: null,
    visible: false,
  });

  const [allExecutionData, setAllExecutionData] = useState<any>({
    record: null,
    visible: false,
  });

  const [queryData, setQueryData] = useState<any>({
    queryInput: '',
    ...DEFAULT_PAGINATION_SETTINGS,
  });

  const [approves, setApproves] = useState<any[]>([]);
  const [approveApps, setApproveApps] = useState<any[]>([]);
  const [approveTypes, setApproveTypes] = useState<any[]>([]);

  const [removeLoading, setRemoveLoading] = useState(false);

  const approveAppsOptions = useMemo(() => {
    return approveApps.map((app) => ({
      key: app.appKey,
      label: app.name,
      icon: <PlusOutlined />,
    }));
  }, [approveApps]);

  const approveStatusOptions = useMemo(() => {
    return _.map(APPROVE_STATUS_TYPES, (item, key) => ({
      value: key,
      label: t(item.text),
    }));
  }, [approveTypes, t]);

  const approveTypeOptions = useMemo(() => {
    return _.map(approveTypes, (item) => ({
      value: item.value,
      label: item.name,
    }));
  }, [approveTypes]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const getApproveApps = async () => {
    try {
      const result = await Service.fetchShowApps<any>({
        paging: false,
        appType: 'APPROVAL',
        dataStatus: 'ONLINE',
      });
      setApproveApps(result.list);
    } catch (error) {
      console.error(error);
    }
  };

  const getApproveTypes = async () => {
    if (_approveTypes) {
      setApproveTypes(_approveTypes);
      return;
    }

    try {
      const result = await ApproveService.fetchApproveTypes();
      _approveTypes = result as any[];
      setApproveTypes(_approveTypes);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getApproveApps();
    getApproveTypes();
  }, []);

  const getApproves = async () => {
    try {
      setListLoading(true);

      const params: any = {
        ...queryData,
      };

      ['startTime', 'endTime'].forEach((key) => {
        if (params[key]) {
          params[key] = params[key].format(DATE_FORMAT);
        }
      });

      const result = await ApproveService.fetchApproveList(params);
      setApproves(result?.list || []);
      setPagination(result?.pagination || DEFAULT_PAGINATION_SETTINGS);
    } catch (error) {
      console.error(error);
    } finally {
      setListLoading(false);
    }
  };

  useDebounceEffect(
    () => {
      getApproves();
    },
    [queryData],
    { wait: 100 },
  );

  const revokeRecord = async (id: string) => {
    try {
      setRemoveLoading(true);
      const result = await ApproveService.revokeInstance(id);
      if (result) {
        getApproves();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRemoveLoading(false);
    }
  };

  const onListPageChange = (page: number, size: number) => {
    setQueryData({
      ...queryData,
      page, size,
    });
  };

  const onSearch = (values: any) => {
    setQueryData({
      ...queryData,
      ...values,
      ...DEFAULT_PAGINATION_SETTINGS,
    });
  };

  const onReset = () => {
    setQueryData({
      ...DEFAULT_PAGINATION_SETTINGS,
    } as any);
  };

  const [form] = Form.useForm();
  const renderSearchForm = () => {
    return (
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Form form={form} layout="inline" onFinish={onSearch} onReset={onReset}>
            <FormItem name="exetensions">
              <ExtensionFields />
            </FormItem>
            <FormItem name="startTime">
              <DatePicker
                showTime
                allowClear
                format={DATE_FORMAT}
                placeholder={t('common.text.select_start_time')}
              />
            </FormItem>
            <FormItem name="endTime">
              <DatePicker
                showTime
                allowClear
                format={DATE_FORMAT}
                placeholder={t('common.text.select_end_time')}
              />
            </FormItem>
            <FormItem name="approveType">
              <Select
                allowClear
                options={approveTypeOptions}
                placeholder={t('common.text.select_approve_type')}
              />
            </FormItem>
            <FormItem name="approveStatus">
              <Select
                allowClear
                options={approveStatusOptions}
                dropdownMatchSelectWidth={false}
                placeholder={t('common.text.select_approve_status')}
              />
            </FormItem>
            <FormItem name="proposer">
              <Input
                allowClear
                style={{ width: 140 }}
                placeholder={t('common.text.input_proposer')}
              />
            </FormItem>
            <FormItem name="appName">
              <Input
                allowClear
                style={{ width: 140 }}
                placeholder={t('common.text.input_app_name')}
              />
            </FormItem>
            <FormItem>
              <Button type="primary" loading={listLoading} htmlType="submit">
                <SearchOutlined />
              </Button>
            </FormItem>
            <FormItem>
              <Button htmlType="reset">
                <RollbackOutlined />
              </Button>
            </FormItem>
          </Form>
        </Col>
      </Row>
    );
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        style={{ height: 64 }}
        leftContent={
          <Row align="middle">
            <Col>
              <span className="page-header-title">{t('approve.list_page.title')}</span>
            </Col>
          </Row>
        }
      />
    );
  };

  const renderDataContent = () => {
    const columns: KeyValues[] = [
      {
        title: t('approve.column.id'),
        width: 120,
        fixed: 'left',
        align: 'center',
        dataIndex: 'approveInstanceKey',
      },
      ...extensionColumns,
      {
        title: t('approve.column.appName'),
        width: 160,
        key: 'appName',
        dataIndex: 'appName',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.type'),
        width: 140,
        key: 'approveType',
        dataIndex: 'approveType',
        render: (approveType) => {
          const type = _.find(approveTypes, (item) => item.value === approveType);
          return (
            <Paragraph ellipsis={{ rows: 2, tooltip: type?.label }}>
              {type?.name || approveType || '-'}
            </Paragraph>
          );
        },
      },
      {
        title: t('approve.column.status'),
        width: 140,
        key: 'approveStatus',
        dataIndex: 'approveStatus',
        render: (approveStatus) => {
          if (!approveStatus) return '-';

          const status = APPROVE_STATUS_TYPES[approveStatus] || {};
          return (
            <Tag color={status.bgColor} style={{ color: status.color }}>
              {t(status.text)}
            </Tag>
          );
        },
      },
      {
        title: t('approve.column.created_time'),
        width: 160,
        key: 'updatedTime',
        dataIndex: 'updatedTime',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.created_user'),
        width: 140,
        align: 'center',
        key: 'proposer',
        dataIndex: 'proposer',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.approve_user'),
        width: 140,
        key: 'approver',
        dataIndex: 'approver',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.approve_time'),
        width: 160,
        key: 'lastApproveDateTime',
        dataIndex: 'lastApproveDateTime',
        render: (value: string) => value || '-',
      },
      {
        title: t('task.list.column.operate'),
        key: 'operate',
        dataIndex: 'operate',
        align: 'center',
        fixed: 'right',
        width: 170,
        render: (operate: any, record: any) => {
          return (
            <>
              <IconButton
                icon={<FieldTimeOutlined />}
                tooltip={t('common.button.execution_detail')}
                onClick={() => {
                  setExecutionData({
                    approveInstanceKey: record.approveInstanceKey,
                  });
                }}
              />
              <IconButton
                icon={<FileDoneOutlined />}
                tooltip={t('common.button.all_execution_detail')}
                onClick={() => {
                  setAllExecutionData({
                    approveInstanceKey: record.approveInstanceKey,
                  });
                }}
              />
              <IconButton
                icon={<ProfileOutlined />}
                tooltip={t('common.button.detail')}
                onClick={() => {
                  window.open(
                    `#/approve/page/list-detail/${record.appKey}?aik=${record.approveInstanceKey}`,
                    '_blank',
                  );
                }}
              />
              <IconButton
                icon={<InteractionOutlined />}
                tooltip={t('common.tooltip.revoke')}
                permissions="ApproveFlowInstance-revoke"
                popConfirm={{
                  title: t('common.text.revoke_confirmation'),
                  placement: 'topRight',
                  okButtonProps: {
                    loading: removeLoading,
                  },
                  onConfirm: () => revokeRecord(record.approveInstanceKey),
                }}
                disabled={['DRAFT'].includes(record.approveStatus)}
              />
            </>
          );
        },
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <ListTable
          noSpacing
          rowKey="approveInstanceKey"
          columns={columns}
          dataSource={approves}
          loading={listLoading}
          scroll={{ x: 'max-content' }}
          pagination={pagination}
          onPageChange={onListPageChange}
        />
      </div>
    );
  };

  const renderExecutionRecordModal = () => {
    return (
      <ExecutionRecordModal {...executionData} closable onCancel={() => setExecutionData({})} />
    );
  };

  const renderAllExecutionRecordModal = () => {
    return (
      <ExecutionRecordModal
        {...allExecutionData}
        closable
        listType="instance"
        onCancel={() => setAllExecutionData({})}
      />
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      {renderPageHeader()}
      {renderSearchForm()}
      {renderDataContent()}
      {renderExecutionRecordModal()}
      {renderAllExecutionRecordModal()}
      <PageHelmet title={t('approve.list_page.title')} />
    </div>
  );
};

export default Index;
