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

import {Button, DatePicker, Form, message, Modal, Popover, Progress, Select, Space, Spin, Tag, Typography} from 'antd';

import Icon, {ExclamationCircleOutlined, FilterOutlined} from '@ant-design/icons';

import {useSetState} from "ahooks";

import styles from "./style.less";

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import PageTitle from "@/components/PageTitle";
import PageHelmet from '@/components/PageHelmet';
import {DEFAULT_PAGINATION_SETTINGS} from '@/common/constants';

import InstanceContext from './contexts/InstanceContext'

import {useModel, history} from "umi";
import ListTable from "@/components/ListTable";
import type {KeyValues} from "@/common/types/Types";
import IconButton from "@/components/IconButton";

import {STATUS_TYPES} from './constants';
import {fetchTaskApp, fetchTaskCode, updateInstanceStatus} from "@/services/Instances";

const {RangePicker} = DatePicker;
const {Paragraph} = Typography;

const dateFormat = 'YYYY-MM-DD';

const OPERATE_ICON_MAP = {
  'detail': () => (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" id="mx_n_1692090202131" width="16"
      height="16">
      <path
        d="M435.73767 653.351702l54.765246 54.664962 195.557712-195.499384-195.557712-195.549526-54.765246 54.723291 101.692998 101.63467L158.029018 473.325716l0 78.324801 379.40165 0L435.73767 653.351702zM783.851765 160.502347 236.296515 160.502347c-43.036122 0-78.266473 35.173046-78.266473 78.149816l0 156.523736 78.266473 0 0-156.523736 547.55525 0 0 547.671907L236.296515 786.32407l0-156.465408-78.266473 0 0 156.465408c0 43.026913 35.231374 78.209168 78.266473 78.209168l547.55525 0c42.976771 0 78.208145-35.182255 78.208145-78.209168l0-547.671907C862.058886 195.675392 826.828535 160.502347 783.851765 160.502347"
      />
    </svg>
  ),
  'enable': () => (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16"
      height="16">
      <path
        d="M512 960c-247.424 0-448-200.512-448-448s200.576-448 448-448c247.488 0 448 200.512 448 448s-200.512 448-448 448zM512 138.88v-0.256C297.92 138.688 138.88 306.304 138.88 512S306.304 885.12 512 885.12s373.12-167.36 373.12-373.12S717.76 138.88 512 138.88z m-66.048 554.816a26.88 26.88 0 0 1-30.336 0.832 35.456 35.456 0 0 1-15.424-29.952V321.984c0-12.416 5.888-23.872 15.424-29.952a26.88 26.88 0 0 1 30.4 0.896l238.912 171.328c8.64 6.272 13.952 17.28 13.952 29.056s-5.312 22.784-14.016 28.992l-238.912 171.392z"/>
    </svg>
  ),
  'rerun': () => (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16"
      height="16">
      <path
        d="M512 938.678857C276.370286 938.678857 85.321143 747.629714 85.321143 512S276.370286 85.321143 512 85.321143 938.678857 276.370286 938.678857 512 747.629714 938.678857 512 938.678857zM512 146.285714C310.016 146.285714 146.285714 310.016 146.285714 512s163.730286 365.714286 365.714286 365.714286 365.714286-163.730286 365.714286-365.714286S713.984 146.285714 512 146.285714z m140.251429 316.708572a14.884571 14.884571 0 0 1-18.395429 0V420.571429h-243.748571a15.250286 15.250286 0 0 0-15.250286 15.250285v53.321143a30.464 30.464 0 1 1-60.964572 0V420.571429c0-33.645714 27.318857-60.964571 60.964572-60.964572h258.998857v-27.355428a14.921143 14.921143 0 0 1 18.395429 0l69.083428 57.673142a9.654857 9.654857 0 0 1 0 15.36l-69.083428 57.709715z m-262.070858 97.828571v34.998857h243.712c8.411429 0 15.250286-6.838857 15.250286-15.250285v-53.321143a30.464 30.464 0 1 1 60.964572 0v68.571428c0 33.645714-27.318857 60.928-60.964572 60.928h-258.998857v34.816a14.994286 14.994286 0 0 1-18.468571 0L302.445714 633.892571a9.654857 9.654857 0 0 1 0-15.36l69.266286-57.673142a14.994286 14.994286 0 0 1 18.468571 0z"
        fill="#000000"/>
    </svg>
  ),
  'stop': () => (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
      id="mx_n_1692168520816" width="14" height="14">
      <path
        d="M874.058005 149.941995a510.06838 510.06838 0 1 0 109.740156 162.738976 511.396369 511.396369 0 0 0-109.740156-162.738976z m66.278708 362.178731A428.336713 428.336713 0 1 1 512 83.663287a428.698892 428.698892 0 0 1 428.336713 428.336713z"
        fill="#4D4D4D"/>
      <path
        d="M417.954256 281.533601a41.046923 41.046923 0 0 0-41.77128 40.201839v385.116718a41.892007 41.892007 0 0 0 83.663287 0v-385.116718a41.167649 41.167649 0 0 0-41.892007-40.201839zM606.045744 281.533601a41.046923 41.046923 0 0 0-41.77128 40.201839v385.116718a41.892007 41.892007 0 0 0 83.663287 0v-385.116718a41.167649 41.167649 0 0 0-41.892007-40.201839z"
        fill="#4D4D4D"/>
    </svg>
  ),
  'go': () => (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16"
      height="16">
      <path
        d="M512 936a424.1 424.1 0 0 1-165.05-814.66 424.1 424.1 0 0 1 330.1 781.33A421.38 421.38 0 0 1 512 936z m0-768c-189.68 0-344 154.32-344 344s154.32 344 344 344 344-154.32 344-344-154.32-344-344-344z"
        fill="#494848"/>
      <path
        d="M529.48 536.5L362.4 633a28.39 28.39 0 0 1-42.58-24.59V415.45a28.39 28.39 0 0 1 42.58-24.59l167.08 96.47a28.39 28.39 0 0 1 0 49.17z"
        fill="#494848"/>
      <path
        d="M736 536.5L568.91 633a28.39 28.39 0 0 1-42.58-24.59V415.45a28.39 28.39 0 0 1 42.58-24.59L736 487.33a28.39 28.39 0 0 1 0 49.17z"
        fill="#494848"/>
    </svg>
  ),
  'log': () => (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16"
      height="16">
      <path
        d="M568.888889 910.222222H56.888889V113.777778h739.555555v398.222222h-56.888888V170.666667H113.777778v682.666666h398.222222z"
        fill="#333333"/>
      <path
        d="M711.111111 512c108.088889 0 199.111111 91.022222 199.111111 199.111111S819.2 910.222222 711.111111 910.222222 512 819.2 512 711.111111 603.022222 512 711.111111 512m0-56.888889C568.888889 455.111111 455.111111 568.888889 455.111111 711.111111s113.777778 256 256 256 256-113.777778 256-256S853.333333 455.111111 711.111111 455.111111zM227.555556 56.888889h56.888888v170.666667H227.555556zM568.888889 56.888889h56.888889v170.666667h-56.888889zM170.666667 341.333333h512v56.888889H170.666667zM170.666667 512h284.444444v56.888889H170.666667zM170.666667 682.666667h227.555555v56.888889H170.666667z"
        fill="#333333"/>
      <path d="M853.333333 796.444444h-170.666666v-227.555555h56.888889v170.666667h113.777777z" fill="#333333"/>
    </svg>
  ),
}

const Index: React.FC = () => {

  const [filterForm] = Form.useForm();

  const {
    instanceData,
    taskInstanceRequest,
  } = useModel('Instances');

  const {t, loading: i18nLoading} = useI18n(['instance', 'common']);

  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    taskCode?: any[];
    apps?: any[];
  }>({
    taskCode: [],
    apps: [],
  });

  const [queryData, setQueryData] = useSetState<any>({
    queryInput: '',
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    formatFilterOptions();
  }, []);

  useEffect(() => {
    taskInstanceRequest.run(queryData);
  }, [queryData]);

  const formatFilterOptions = async () => {
    const options: {
      taskCode?: any;
      apps?: any;
    } = {};

    const taskCodeResult = await fetchTaskCode();
    const taskAppResult = await fetchTaskApp();

    // @ts-ignore
    options.taskCode = (taskCodeResult || []).map((item) => ({
      value: item,
      label: item,
    }));

    // @ts-ignore
    options.apps = (taskAppResult || []).map((item) => ({
      value: item,
      label: item,
    }));

    setFilterOptions(options);
  };

  const onListPageChange = (page: number, size: number) => {
    setQueryData({
      ...queryData,
      page,
      size
    });
  };

  const handleFormSubmit = (values) => {
    const params: {
      endDate?: string;
      startDate?: string;
      apps?: any[];
      taskCodes?: any[];
    } = {};

    if (values) {
      const {
        logTime,
        apps,
        taskCodes
      } = values;

      if (logTime?.length) {
        params.startDate = logTime[0] ? logTime[0].format(dateFormat) : '';
        params.endDate = logTime[1] ? logTime[1].format(dateFormat) : '';
      }

      if (apps) {
        params.apps = apps;
      }

      if (taskCodes) {
        params.taskCodes = taskCodes;
      }
    }

    // @ts-ignore
    setQueryData(params);
    setFilterOpen(false);
  };

  const renderFilterForm = () => {

    return (
      <Form form={filterForm} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item name="appNames" label={t('instance.filter.form.label.app')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.apps}
            className={styles.multiSelector}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="taskCodes" label={t('instance.filter.form.label.status')}>
          <Select
            allowClear
            mode="multiple"
            options={filterOptions.taskCode}
            className={styles.multiSelector}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item name="logTime" label={t('instance.filter.form.label.time')}>
          {/*@ts-ignore*/}
          <RangePicker style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{float: 'right'}}>
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
          <p className={styles.title}>{t('common.button.filter')}：</p>
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
        <Button icon={<FilterOutlined/>} className={styles.filterButton}>
          {t('common.button.filter')}
        </Button>
      </Popover>
    );
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        style={{height: 64}}
        title={t('instance.main.page.title')}
        rightContent={{
          search: {
            placeholder: t('instance.main.page.search.placeholder'),
            onSearch: (value: string) => {
              // @ts-ignore
              setQueryData({
                queryInput: value,
                ...DEFAULT_PAGINATION_SETTINGS
              });
            },
          },
          button: (
            <Space size={16}>
              {renderFilterButton()}
            </Space>
          ),
        }}
      />
    );
  };

  const updateStatus = (id: number, type: string) => async () => {
    const res = await updateInstanceStatus(id, type)

    if (res) {
      message.success(t(type === 'STOP' ? 'instance.list.message.deactivated_success' : 'instance.list.message.rerun_success'));

      taskInstanceRequest.run(queryData);
    }
  }

  const renderDataContent = () => {
    // @ts-ignore
    const columns: KeyValues[] = [
      {
        title: t('instance.list.column.id'),
        key: 'taskExecutionId',
        fixed: 'left',
        dataIndex: 'taskExecutionId',
      },
      {
        title: t('instance.list.column.name'),
        fixed: 'left',
        key: 'taskName',
        dataIndex: 'taskName',
        render: (taskName) => {
          return (
            <Paragraph ellipsis={{rows: 2, tooltip: taskName}}>{taskName}</Paragraph>
          )
        }
      },
      {
        title: t('instance.list.column.app'),
        width: 160,
        key: 'appName',
        dataIndex: 'appName'
      },
      {
        title: t('instance.list.column.status'),
        width: 120,
        key: 'executionStatus',
        dataIndex: 'executionStatus',
        render: (executionStatus: string) => {
          const priority = STATUS_TYPES[executionStatus] || STATUS_TYPES.FAILED
          return (
            <Tag
              color={priority.bgColor}
              style={{color: priority.color}}
            >
              {t(priority.text)}
            </Tag>
          )
        }
      },
      {
        title: t('instance.list.column.progress'),
        width: 160,
        align: 'center',
        key: 'percent',
        dataIndex: 'percent',
        render: (percent: number) => {
          return (
            <Progress percent={percent} showInfo={false} strokeColor={'#b0d28a'}/>
          )
        }
      },
      {
        title: t('instance.list.column.create_time'),
        key: 'startTime',
        dataIndex: 'startTime',
      },
      {
        title: t('instance.list.column.end_time'),
        key: 'endTime',
        dataIndex: 'endTime'
      },
      {
        title: t('instance.list.column.operate'),
        key: 'operate',
        dataIndex: 'operate',
        fixed: 'right',
        render: (operate: any, record: any) => {
          const taskStatus = record.executionStatus
          return (
            <>
              <IconButton
                icon={<Icon component={OPERATE_ICON_MAP.detail}/>}
                tooltip={t('common.button.detail')}
                onClick={() => {
                  const {search} = location
                  const urlList: any[] = record.detailUrl.split('/')

                  if (urlList[2] === 'CRONTIMER') {
                    history.push(`/instances/index/detail${search?.length > 0 ? search + '&' : '?'}instanceId=${urlList[3]}`)
                  }
                }}
              />
              {
                taskStatus === 'FAILED' &&
                  <IconButton
                    icon={<Icon component={OPERATE_ICON_MAP.rerun}/>}
                    tooltip={t('instance.list.operate.again')}
                    onClick={() => {
                      Modal.confirm({
                        title: t('instance.list.operate.rerun.title'),
                        icon: <ExclamationCircleOutlined />,
                        content: t('instance.list.operate.rerun.content'),
                        okText: t('common.button.confirm'),
                        cancelText: t('common.button.cancel'),
                        onOk: () => updateStatus(record.taskExecutionId, 'RERUN')(),
                      });
                    }}
                  />
              }
              {
                taskStatus === 'RUNNING' &&
                  <IconButton
                    icon={<Icon component={OPERATE_ICON_MAP.stop}/>}
                    tooltip={t('instance.list.operate.stop')}
                    onClick={() => {
                      Modal.confirm({
                        title: t('instance.list.operate.stop.title'),
                        icon: <ExclamationCircleOutlined />,
                        content: t('instance.list.operate.stop.content'),
                        okText: t('common.button.confirm'),
                        cancelText: t('common.button.cancel'),
                        onOk: () => updateStatus(record.taskExecutionId, 'STOP')(),
                      });
                    }}
                  />
              }
              {
                taskStatus === 'STOPPED' &&
                  <IconButton
                    icon={<Icon component={OPERATE_ICON_MAP.go}/>}
                    tooltip={t('instance.list.operate.continue')}
                    onClick={() => {
                      Modal.confirm({
                        title: t('instance.list.operate.rerun.title'),
                        icon: <ExclamationCircleOutlined />,
                        content: t('instance.list.operate.rerun.content'),
                        okText: t('common.button.confirm'),
                        cancelText: t('common.button.cancel'),
                        onOk: () => updateStatus(record.taskExecutionId, 'RERUN')(),
                      });
                    }}
                  />
              }
              {/*<IconButton
                icon={<Icon component={OPERATE_ICON_MAP.log}/>}
                tooltip={t('instance.list.operate.log')}
                onClick={() => {
                }}
              />*/}
            </>
          );
        },
      },
    ];

    return (
      <div className={styles.listWrapper}>
        <Spin spinning={taskInstanceRequest.loading}>
          <ListTable
            noSpacing
            rowKey='taskExecutionId'
            columns={columns}
            scroll={{x: 'max-content'}}
            dataSource={instanceData.list}
            onPageChange={onListPageChange}
            loading={taskInstanceRequest.loading}
            pagination={instanceData.pagination}
          />
        </Spin>
      </div>
    );
  }

  if (i18nLoading) {
    return <PageLoading/>;
  }

  return (
    <InstanceContext.Provider value={{}}>
      <PageHelmet title={t('instance.main.page.title')} />
      {renderPageHeader()}
      {renderDataContent()}
    </InstanceContext.Provider>
  );
};

export default Index;
