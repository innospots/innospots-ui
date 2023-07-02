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

import React, { useCallback, useEffect, useState } from 'react';
import { Button, DatePicker, Form, Popover, Select, Space } from 'antd';
import { FilterOutlined, RetweetOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import _ from 'lodash';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import { fetchOperateFilterOptions } from '@/services/Log';
import { fetchMember } from '@/services/User';

import styles from './style.less';

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';

const Index: React.FC = () => {
  const { operateLogData, operateLogRequest } = useModel('Log');

  const [filterForm] = Form.useForm();

  const [keywords, setKeywords] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    module?: any[];
    operate?: any[];
    resource?: any[];
    userList?: any[];
  }>({
    userList: [],
  });
  const [listParams, setListParams] = useState({});
  const { t, loading } = useI18n(['log', 'common']);

  useEffect(() => {
    getFilterOptions();
  }, []);

  useEffect(() => {
    fetchLogListData();
  }, [listParams]);

  const getFilterOptions = async () => {
    const types = ['module', 'operate', 'resource'];
    const options: {
      userList?: any[];
    } = {};

    for (let i = 0; i < types.length; ++i) {
      const type = types[i];
      options[type] = await fetchOperateFilterOptions(type);
    }

    const memberListResult = await fetchMember({
      paging: false,
    });

    options.userList = (memberListResult?.list || []).map((item) => ({
      value: item.userId,
      label: item.userName,
    }));

    setFilterOptions(options);
  };

  const fetchLogListData = (params = listParams) => {
    operateLogRequest.run(params);
  };

  const handleFormSubmit = (values) => {
    const params: {
      userIds?: string;
      fromTime?: string;
      endTime?: string;
      module?: string;
      operateType?: string;
      resourceType?: string;
    } = {};

    if (values) {
      const { module, userIds, operateType, operateTime, resourceType } = values;

      if (userIds) {
        params.userIds = userIds.join(',');
      }

      if (operateTime?.length) {
        params.fromTime = operateTime[0] ? operateTime[0].format(dateFormat) : '';
        params.endTime = operateTime[1] ? operateTime[1].format(dateFormat) : '';
      }

      if (module) {
        params.module = module;
      }

      if (operateType) {
        params.operateType = operateType;
      }

      if (resourceType) {
        params.resourceType = resourceType;
      }
    }

    setFilterOpen(false);
    setListParams(params);
  };

  const onUserSearch = useCallback((keyword?: string) => {
    setListParams({
      usernames: keyword,
    });
  }, []);

  const resetOperateLog = useCallback(() => {
    setKeywords('');
    setListParams({});
    filterForm.resetFields();
  }, []);

  const onListPageChange = (page, size) => {
    setListParams({
      ...listParams,
      page,
      size,
    });
  };

  const renderFilterForm = () => {
    return (
      <Form form={filterForm} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item name="userIds" label={t('log.main.filter.input.username.label')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.userList}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="operateTime" label={t('log.main.filter.datepicker.operation_time.label')}>
          {/*@ts-ignore*/}
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="module" label={t('log.main.filter.select.module.label')}>
          <Select
            allowClear
            placeholder={t('common.select.placeholder')}
            options={_.map(filterOptions.module, (value) => ({
              value: value,
              label: value,
            }))}
          />
        </Form.Item>
        <Form.Item name="operateType" label={t('log.main.filter.select.operation_type.label')}>
          <Select
            allowClear
            placeholder={t('common.select.placeholder')}
            options={_.map(filterOptions.operate, (value) => ({
              value: value,
              label: value,
            }))}
          />
        </Form.Item>
        <Form.Item name="resourceType" label={t('log.main.filter.select.object.label')}>
          <Select
            allowClear
            placeholder={t('common.select.placeholder')}
            options={_.map(filterOptions.resource, (value) => ({
              value: value,
              label: value,
            }))}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
            {t('common.button.confirm')}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderFilterButton = () => {
    const filterContent = (
      <div className={styles.filterContent}>
        <div className={styles.inner}>
          <p className={styles.title}>{t('log.main.filter.title')}：</p>
          {renderFilterForm()}
        </div>
      </div>
    );

    return (
      <Popover
        open={filterOpen}
        trigger="click"
        title={null}
        placement="leftTop"
        content={filterContent}
        onOpenChange={setFilterOpen}
      >
        <Button icon={<FilterOutlined />} className={styles.filterButton}>
          {t('common.button.filter')}
        </Button>
      </Popover>
    );
  };

  const renderPageHeader = () => {
    return (
      <div>
        <PageTitle
          title={t('log.operation.heading_title')}
          rightContent={{
            search: {
              value: keywords,
              placeholder: t('log.main.input.search.placeholder'),
              onChange: setKeywords,
              onSearch: onUserSearch,
            },
            button: (
              <Space size={16}>
                {renderFilterButton()}
                <Button icon={<RetweetOutlined />} type="primary" onClick={resetOperateLog}>
                  {t('common.button.reset')}
                </Button>
              </Space>
            ),
          }}
        />
      </div>
    );
  };

  const renderDataContent = () => {
    const columns:any[] = [
      {
        title: t('log.operation.column.id'),
        width: 86,
        dataIndex: 'logId',
      },
      {
        title: t('log.operation.column.datetime'),
        dataIndex: 'operateTime',
      },
      {
        title: t('log.operation.column.username'),
        width: 120,
        dataIndex: 'username',
      },
      {
        title: t('log.operation.column.module'),
        dataIndex: 'module',
      },
      {
        title: t('log.operation.column.action'),
        dataIndex: 'operate',
      },,
      {
        title: t('log.operation.column.resource_name'),
        dataIndex: 'resourceName',
      },
      {
        title: t('log.operation.column.operation'),
        dataIndex: 'detail',
        width: '25%',
        ellipsis: true,
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <ListTable
          rowKey="logId"
          columns={columns}
          loading={operateLogRequest.loading}
          dataSource={operateLogData.list}
          pagination={operateLogData.pagination}
          onPageChange={onListPageChange}
        />
      </div>
    );
  };

  if (loading) {
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
