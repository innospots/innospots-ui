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
import { Button, DatePicker, Form, Popover, Select, Space, TableColumnsType } from 'antd';
import { FilterOutlined, RetweetOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useModel } from 'umi';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import { fetchLoginFilterOptions } from '@/services/Log';
import { fetchMember } from '@/services/User';

import StatusTag, { Status } from '@/components/StatusTag';
import { KeyValues } from '@/common/types/Types'

import styles from './style.less';

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';

const Index: React.FC = () => {
  const { loginLogData, loginLogRequest } = useModel('Log');

  const [filterForm] = Form.useForm();

  const [keywords, setKeywords] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    os?: any[];
    status?: any[];
    browser?: any[];
    userList?: any[];
  }>({
    userList: [],
  });
  const [listParams, setListParams] = useState({});

  const { t, loading } = useI18n(['log', 'common']);

  useEffect(() => {
    formatFilterOptions();
  }, []);

  useEffect(() => {
    loginLogRequest.run(listParams);
  }, [listParams]);

  const formatFilterOptions = async () => {
    const options: {
      os?: any;
      browser?: any;
      userList?: any;
    } = {};

    options.os = await fetchLoginFilterOptions('operation-systems');
    options.browser = await fetchLoginFilterOptions('browsers');

    const memberListResult = await fetchMember({
      paging: false,
    });

    options.userList = (memberListResult?.list || []).map((item) => ({
      value: item.userId,
      label: item.userName,
    }));

    setFilterOptions(options);
  };

  const onListPageChange = (page: number, size: number) => {
    setListParams({
      ...listParams,
      page,
      size
    });
  };

  const handleFormSubmit = (values) => {
    const params: {
      os?: string;
      userIds?: string;
      fromTime?: string;
      endTime?: string;
      status?: string;
      browser?: string;
    } = {};

    if (values) {
      const { os, userIds, logTime, status, browser } = values;

      if (userIds) {
        params.userIds = userIds.join(',');
      }

      if (logTime?.length) {
        params.fromTime = logTime[0] ? logTime[0].format(dateFormat) : '';
        params.endTime = logTime[1] ? logTime[1].format(dateFormat) : '';
      }

      if (os) {
        params.os = os;
      }

      if (browser) {
        params.browser = browser;
      }

      if (status) {
        params.status = status;
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

  const resetLoginLog = useCallback(() => {
    setKeywords('');
    setListParams({});
    filterForm.resetFields();
  }, []);

  const renderFilterForm = () => {

    return (
      <Form form={filterForm} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item name="userIds" label={t('log.main.filter.input.username.label')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.userList}
            className={styles.multiSelector}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="logTime" label={t('log.main.filter.datepicker.log_time.label')}>
          {/*@ts-ignore*/}
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="browser" label={t('log.main.filter.select.browser.label')}>
          <Select
            allowClear
            placeholder={t('common.select.placeholder')}
            options={_.map(filterOptions.browser, (value) => ({
              value: value,
              label: value,
            }))}
          />
        </Form.Item>
        <Form.Item name="os" label={t('log.main.filter.select.os.label')}>
          <Select
            allowClear
            placeholder={t('common.select.placeholder')}
            options={_.map(filterOptions.os, (value) => ({
              value: value,
              label: value,
            }))}
          />
        </Form.Item>
        <Form.Item name="status" label={t('log.main.filter.radio.status.label')}>
          <Select
            allowClear
            placeholder={t('common.select.placeholder')}
            options={_.map(['SUCCESS', 'FAILURE'], (value) => ({
              value: value,
              label: t(`common.options.${value.toLowerCase()}`),
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
        title={null}
        trigger="click"
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
          title={t('log.login.headig_title')}
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
                <Button icon={<RetweetOutlined />} type="primary" onClick={resetLoginLog}>
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
    const columns:TableColumnsType<KeyValues> = [
      {
        title: t('log.login.column.id'),
        dataIndex: 'logId',
      },
      {
        title: t('log.login.column.datetime'),
        dataIndex: 'loginTime',
      },
      {
        title: t('log.login.column.username'),
        dataIndex: 'userName',
      },
      {
        title: t('log.login.column.ip'),
        dataIndex: 'ip',
      },
      {
        title: t('log.login.column.browser'),
        dataIndex: 'browser',
      },
      {
        title: t('log.login.column.os'),
        dataIndex: 'os',
      },
      {
        title: t('log.login.column.status'),
        align: 'center',
        dataIndex: 'status',
        width: 112,
        render: (status: Status) => <StatusTag status={status} />,
      },
      {
        title: t('log.login.column.detail'),
        dataIndex: 'detail',
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <ListTable
          rowKey="logId"
          columns={columns}
          loading={loginLogRequest.loading}
          dataSource={loginLogData.list}
          pagination={loginLogData.pagination}
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
