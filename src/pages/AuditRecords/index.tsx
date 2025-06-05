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
import { Col, Row, Tag, Typography, Select, DatePicker, Button, Form } from 'antd';

import { ProfileOutlined, FieldTimeOutlined, SearchOutlined, RollbackOutlined } from '@ant-design/icons';

import * as ApproveService from '@/services/Approve';

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import { DEFAULT_PAGINATION_SETTINGS, APPROVE_STATUS_TYPES } from '@/common/constants';

import ListTable from '@/components/ListTable';
import { KeyValues } from '@/common/types/Types';
import IconButton from '@/components/IconButton';
import PageHelmet from '@/components/PageHelmet';

import ExecutionRecordModal from '../Approve/components/ExecutionRecordModal';
import ExtensionFields from '../Approve/components/ExtensionFields';
import { useExtensionFields } from '../Approve/components/ExtensionFields/useExtensionFields';

import styles from './style.less';

const FormItem = Form.Item;
const { Paragraph } = Typography;

let _approveTypes: any[];
const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

const Index: React.FC = () => {
  const { t, loading: i18nLoading } = useI18n(['task', 'common', 'approve']);
  const [, extensionColumns] = useExtensionFields();

  const [queryData, setQueryData] = useState<any>({
    ...DEFAULT_PAGINATION_SETTINGS,
  });

  const [executionData, setExecutionData] = useState<any>({
    record: null,
    visible: false,
  });

  const [approves, setApproves] = useState<any[]>([]);
  const [approveTypes, setApproveTypes] = useState<any[]>([]);

  const [listLoading, setListLoading] = useState(false);

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
    getApproveTypes();
  }, []);

  const getApproves = async () => {
    try {
      const params: any = {
        ...queryData,
      };

      setListLoading(true);

      ['startTime', 'endTime'].forEach((key) => {
        if (params[key]) {
          params[key] = params[key].format(DATE_FORMAT);
        }
      });

      const result = await ApproveService.fetchAuditHistory(params);
      setApproves(
        _.map(result?.list || [], (item) => ({
          __key: `${item.approveInstanceKey}-${item.approveType}-${item.nodeKey}`,
          ...item,
        })),
      );
      setPagination(result?.pagination || DEFAULT_PAGINATION_SETTINGS);
    } catch (error) {
      console.error(error);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    getApproves();
  }, [queryData]);

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

  const renderExecutionRecordModal = () => {
    return (
      <ExecutionRecordModal {...executionData} closable onCancel={() => setExecutionData({})} />
    );
  };

  const [form] = Form.useForm();
  const renderRightContent = () => {
    return (
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
    );
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        style={{ height: 64 }}
        leftContent={
          <Row align="middle">
            <Col>
              <span className="page-header-title">{t('approve.audit.records.title')}</span>
            </Col>
          </Row>
        }
        rightContent={renderRightContent()}
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
        title: t('approve.column.proposer'),
        width: 140,
        align: 'center',
        key: 'proposer',
        dataIndex: 'proposer',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.message'),
        width: 140,
        align: 'center',
        key: 'message',
        dataIndex: 'message',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.startTime'),
        width: 160,
        key: 'startTime',
        dataIndex: 'startTime',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.endTime'),
        width: 160,
        key: 'endTime',
        dataIndex: 'endTime',
        render: (value: string) => value || '-',
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
        title: t('approve.column.result'),
        width: 140,
        key: 'result',
        dataIndex: 'result',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.userName'),
        width: 160,
        key: 'userName',
        dataIndex: 'userName',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.approveAction'),
        width: 160,
        key: 'approveAction',
        dataIndex: 'approveAction',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.nodeKey'),
        width: 160,
        key: 'nodeKey',
        dataIndex: 'nodeKey',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.actMsg'),
        width: 160,
        key: 'actMsg',
        dataIndex: 'actMsg',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.actResult'),
        width: 160,
        key: 'actResult',
        dataIndex: 'actResult',
        render: (value: string) => value || '-',
      },
      {
        title: t('approve.column.optTime'),
        width: 160,
        key: 'optTime',
        dataIndex: 'optTime',
        render: (value: string) => value || '-',
      },
      {
        title: t('task.list.column.operate'),
        key: 'operate',
        dataIndex: 'operate',
        align: 'center',
        fixed: 'right',
        width: 100,
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
                icon={<ProfileOutlined />}
                tooltip={t('common.button.detail')}
                onClick={() => {
                  history.push(
                    `/approve/page/record/${record.appKey}?aik=${record.approveInstanceKey}`,
                  );
                }}
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
          rowKey="__key"
          columns={columns}
          loading={listLoading}
          dataSource={approves}
          pagination={pagination}
          scroll={{ x: 'max-content' }}
          onPageChange={onListPageChange}
        />
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <PageHelmet title={t('approve.audit.records.title')} />
      {renderPageHeader()}
      {renderDataContent()}
      {renderExecutionRecordModal()}
    </div>
  );
};

export default Index;
