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

import React, {useEffect, useState} from 'react';

import {Breadcrumb, Button, Col, DatePicker, Form, Input, Popover, Row, Select, Space, Spin, Tag, Tooltip} from 'antd';
import {ContainerOutlined, HomeOutlined, SearchOutlined} from '@ant-design/icons';

import {useModel} from 'umi';
import useI18n from '@/common/hooks/useI18n';

import PageLoading from '@/components/PageLoading';
import IconButton from "@/components/IconButton";
import useModal from "@/common/hooks/useModal";
import ListTable from "@/components/ListTable";
import PageHelmet from '@/components/PageHelmet';

import FlowPreview, {MODAL_NAME as PREVIEW_MODAL_NAME} from "../Index/components/FlowPreview/FlowPreview";

import styles from './index.less';

const {RangePicker} = DatePicker;

const dateFormat = 'YYYY-MM-DD';

const STATUS_TAG_COLORS = {
  OFFLINE: {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
  ONLINE: {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  '500': {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
  '200': {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
  'FAILED': {
    color: '#FF4445',
    bgColor: '#FFF1F2',
  },
  'COMPLETE': {
    color: '#31CB8A',
    bgColor: '#DBF4EC',
  },
};

const PAGE_TITLE = {
  CRONTIMER: 'workflow.board.execution.record.schedule.title',
  WEBHOOK: 'workflow.board.execution.record.webhook.title',
  KAFKA_TRIGGER: 'workflow.board.execution.record.kafka.title',
};

export const MODAL_NAME = 'FLOW_PREVIEW';

const DEFAULT_PAGE_DATA = {
  page: 1,
  size: 20,
};

const Index: React.FC<any> = ({location}) => {
  const {
    strategyDetail,
    resultCodeList,
    executionRecordData,

    fetchResultCodeRequest,
    fetchStrategyDetailRequest,
    fetchExecutionRecordRequest,
  } = useModel('Preview');

  const [filterForm] = Form.useForm();
  const [previewDrawer] = useModal(PREVIEW_MODAL_NAME);

  const workflowId = location.query?.instanceId || 0;
  const curCategoryId = location.query?.category || 0;
  const [tabId, setTabId] = useState('production');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const [pageData, setPageData] = useState<any>({
    ...DEFAULT_PAGE_DATA
  });

  const [input, setInput] = useState<any>('');

  const {t, loading: i18nLoading} = useI18n(['strategy', 'workflow', 'common']);

  useEffect(() => {
    fetchStrategyDetailRequest.run(workflowId);
  }, []);

  useEffect(() => {
    getExecutionRecord();
  }, [workflowId, pageData]);

  useEffect(() => {
    const params: any = {}
    if (strategyDetail.triggerCode === 'WEBHOOK' && !!input) {
      params.inputs = input;
    }

    if (strategyDetail.triggerCode === 'KAFKA_TRIGGER' && !!input) {
      params.outputs = input;
    }
    getExecutionRecord(params);
  }, [input]);

  useEffect(() => {
    if (strategyDetail.triggerCode === 'WEBHOOK' || strategyDetail.triggerCode === 'CRONTIMER') {
      fetchResultCodeRequest.run()
    }
  }, [strategyDetail.triggerCode]);

  const getExecutionRecord = (params = {}) => {
    fetchExecutionRecordRequest.run({
      ...pageData,
      workflowId,
      ...params
    });
  };

  if (i18nLoading) {
    return <PageLoading/>;
  }

  const handleReset = () => {
    setPageData({
      ...DEFAULT_PAGE_DATA
    });
    setInput('');

    filterForm.resetFields();
  };

  const handlePageChange = (page: number, size: number) => {
    setPageData({
      page,
      size,
    });
  };

  const handleFormSubmit = (values) => {
    const params: {
      inputs?: string;
      outputs?: string;
      statuses?: string;
      startTime?: string;
      endTime?: string;
    } = {};
    if (values) {

      const {status, createdTime} = values;

      if (status) {
        params.statuses = status.join(',');
      }

      if (strategyDetail.triggerCode === 'WEBHOOK' && !!input) {
        params.inputs = input;
      }

      if (strategyDetail.triggerCode === 'KAFKA_TRIGGER' && !!input) {
        params.outputs = input;
      }

      if (createdTime?.length) {
        params.startTime = createdTime[0] ? createdTime[0].format(dateFormat) : '';
        params.endTime = createdTime[1] ? createdTime[1].format(dateFormat) : '';
      }
    }

    setFilterOpen(false);

    getExecutionRecord(params);
  };

  const renderFilterForm = () => {
    return (
      <Form form={filterForm} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item name="createdTime" label={t('请求时间')}>
          <RangePicker style={{width: '100%'}}/>
        </Form.Item>
        {
          (strategyDetail.triggerCode === 'WEBHOOK' || strategyDetail.triggerCode === 'CRONTIMER') && (
            <Form.Item name="status" label={t('响应码')}>
              <Select
                allowClear
                mode="multiple"
                placeholder={t('common.select.placeholder')}
                options={resultCodeList.map(re => ({label: re, value: re}))}
              />
            </Form.Item>
          )
        }
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{float: 'right'}}>
            {t('common.button.confirm')}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderPageTitle = () => {
    const inputPlaceholder = strategyDetail.triggerCode === 'WEBHOOK' ? 'workflow.board.execution.record.message.placeholder' : 'workflow.board.execution.record.info.placeholder'

    const filterContent = (
      <div className={styles.filterContent}>
        <div className={styles.inner}>
          <p className={styles.title}>{t('common.button.filter')}：</p>
          {renderFilterForm()}
        </div>
      </div>
    );

    return (
      <Row className={styles.recordPageTitle} justify="space-between">
        <Col>
          <Row className={styles.recordTitle}>
            <Col>{t(PAGE_TITLE[strategyDetail?.triggerCode]) || '---'}</Col>
            {/*<Col className={styles.titleTab}>
                            <div className={tabId === 'production' ? styles.activeTab : ''}
                                 onClick={() => setTabId('production')}>
                                {t('workflow.board.execution.record.environment.production')}
                            </div>
                            <div className={tabId === 'test' ? styles.activeTab : ''}
                                 onClick={() => setTabId('test')}>
                                {t('workflow.board.execution.record.environment.test')}
                            </div>
                        </Col>*/}
          </Row>
        </Col>
        <Col>
          <Space>
            {
              strategyDetail.triggerCode !== 'CRONTIMER' && (
                <Input
                  prefix={<SearchOutlined/>}
                  value={input}
                  placeholder={t(inputPlaceholder)}
                  style={{width: 280, backgroundColor: '#fff', borderColor: '#fff'}}
                  onChange={(event) => setInput(event.target.value)}
                  onPressEnter={(event) => setInput(event.target.value)}
                />
              )
            }
            <Popover
              open={filterOpen}
              trigger="click"
              title={null}
              placement="leftTop"
              content={filterContent}
              onOpenChange={setFilterOpen}
            >
              <Button type="primary">{t('common.button.filter')}</Button>
            </Popover>
            <Button type="primary" onClick={handleReset}>{t('common.button.reset')}</Button>
          </Space>
        </Col>
      </Row>
    );
  };

  const renderExecutionRecord = () => {
    const columnsData: any = {
      'WEBHOOK': [
        {
          title: t('workflow.board.card.columns.requestTime'),
          dataIndex: 'startTime',
        },
        {
          title: t('workflow.board.card.columns.lastedTime'),
          dataIndex: 'lastTime',
          render: (lastTime, record) => {
            const {startTime, endTime} = record;
            if (startTime && endTime) {
              const eT = new Date(endTime).getTime();
              const sT = new Date(startTime).getTime();

              const mss = eT - sT;

              return mss + ' ms ';
            } else {
              return '---';
            }
          },
        },
        {
          title: t('workflow.board.card.columns.requestIp'),
          dataIndex: 'ip',
          render: () => '127.0.0.1',
        },
        {
          title: t('workflow.board.card.columns.requestCode'),
          dataIndex: 'resultCode',
          render: (resultCode) => {
            const colors = STATUS_TAG_COLORS[resultCode];
            return (
              <Tag
                color={colors?.bgColor || '#E9EDF1'}
                style={{
                  color: colors?.color || '#959EAD',
                }}
              >
                {resultCode}
              </Tag>
            );
          },
        },
        {
          title: t('workflow.board.card.columns.requestBody'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'input',
          render: (input) => (
            <Tooltip placement="topLeft" title={JSON.stringify(input)}>
              {JSON.stringify(input)}
            </Tooltip>
          ),
        },
        {
          title: t('workflow.board.card.columns.responseData'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'output',
          render: (output) => (
            <Tooltip placement="topLeft" title={JSON.stringify(output)}>
              {JSON.stringify(output)}
            </Tooltip>
          ),
        },
      ],
      'KAFKA_TRIGGER': [
        {
          title: t('workflow.board.card.columns.processingTime'),
          dataIndex: 'createdTime',
        },
        {
          title: t('workflow.board.card.columns.lastedTime'),
          dataIndex: 'lastTime',
          render: (lastTime, record) => {
            const {startTime, endTime} = record;
            if (startTime && endTime) {
              const eT = new Date(endTime).getTime();
              const sT = new Date(startTime).getTime();

              const mss = eT - sT;

              return mss + ' ms ';
            } else {
              return '---';
            }
          },
        },
        {
          title: t('workflow.board.card.columns.kafka.requestBody'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'output',
          render: (output) => (
            <Tooltip placement="topLeft" title={JSON.stringify(output)}>
              {JSON.stringify(output)}
            </Tooltip>
          ),
        },
      ],
      'CRONTIMER': [
        {
          title: t('workflow.board.card.columns.jobId'),
          dataIndex: 'flowExecutionId',
        },
        {
          title: t('workflow.board.card.columns.triggerMode'),
          dataIndex: 'executeMode'
        },
        {
          title: t('workflow.board.card.columns.triggerTime'),
          dataIndex: 'createdTime',
        },
        {
          title: t('workflow.board.card.columns.status'),
          dataIndex: 'status',
          render: (status) => {
            const colors = STATUS_TAG_COLORS[status];
            return (
              <Tag
                color={colors?.bgColor || '#E9EDF1'}
                style={{
                  color: colors?.color || '#959EAD',
                }}
              >
                {status}
              </Tag>
            );
          },
        },
        {
          title: t('workflow.board.card.columns.startTime.and.endTime'),
          ellipsis: {
            showTitle: false,
          },
          dataIndex: 'time',
          render: (time, record) => (
            <>
              <div>{record.startTime || '---'}</div>
              <div>{record.endTime || '---'}</div>
            </>
          ),
        },
        {
          title: t('workflow.board.card.columns.lastedTime'),
          dataIndex: 'lastTime',
          render: (lastTime, record) => {
            const {startTime, endTime} = record;
            if (startTime && endTime) {
              const eT = new Date(endTime).getTime();
              const sT = new Date(startTime).getTime();

              const mss = eT - sT;

              return mss + ' ms ';
            } else {
              return '---';
            }
          },
        }
      ],
    }
    const column = columnsData[strategyDetail?.triggerCode] || []

    if (column.length > 0) {
      column.push(
        {
          title: t('common.table.column.action'),
          dataIndex: 'flowInstanceId',
          width: 60,
          align: 'center',
          render: (id: number, record: any) => {
            return (
              <IconButton
                icon={<ContainerOutlined/>}
                tooltip={t('common.button.detail')}
                onClick={() => previewDrawer.show({
                  id
                })}
              />
            );
          },
        }
      )
    }

    return (
      <Spin spinning={fetchExecutionRecordRequest.loading}>
        <div className={styles.recordTable}>
          <ListTable
            rowKey="flowInstanceId"
            columns={column}
            loading={fetchExecutionRecordRequest.loading}
            dataSource={executionRecordData.list}
            pagination={executionRecordData.pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </Spin>
    );
  };

  const renderBreadcrumb = () => {
    return (
      <div className={styles.pageBreadcrumb}>
        <Breadcrumb separator=">">
          <Breadcrumb.Item> <HomeOutlined/> {t('workflow.board.breadcrumb.home.title')}</Breadcrumb.Item>
          <Breadcrumb.Item
            href={`/workflow/index?category=${curCategoryId}`}>{t('workflow.main.heading_title')}</Breadcrumb.Item>
          <Breadcrumb.Item
            href={`/workflow/preview?category=${curCategoryId}&&instanceId=${workflowId}`}>{strategyDetail?.name || '---'}</Breadcrumb.Item>
          <Breadcrumb.Item>{t(PAGE_TITLE[strategyDetail?.triggerCode]) || '---'}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
    )
  };

  const renderFlowDrawer = () => <FlowPreview/>;

  return (
    <>
      <PageHelmet title={[strategyDetail?.name, t('workflow.board.execution.record.title')].join(' - ')}/>
      {/*{renderBreadcrumb()}*/}
      {renderPageTitle()}
      {renderExecutionRecord()}

      {renderFlowDrawer()}
    </>
  );
};

export default Index;
