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

import React, {useMemo, useRef, useState, useEffect, useContext} from 'react';
import _ from 'lodash';
import cls from 'classnames';
import {useSize} from 'ahooks';
import {useModel} from 'umi';
import {Typography, Select, Row, Col} from 'antd';

import type {ExecutionItemProps} from './types';
import {formatListData} from '@/common/utils';
import ListTable from '@/components/ListTable';
import CurContext from '../../../common/context';

import LS from '@/common/utils/LocalStorage';
import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const {Text} = Typography;

const Result: React.FC<ExecutionItemProps> = ({executeData}) => {
  const {t} = useI18n(['workflow']);

  const conRef = useRef<any>(null);
  const sizeRef = useSize(conRef);
  const [filterOption, setFilterOption] = useState();
  const { executeLoading, executionPageData, setExecutionPageData } = useModel('Builder', (model) => ({
    executeLoading: model.executeLoading,
    executionPageData: model.executionPageData,
    setExecutionPageData: model.setExecutionPageData
  }));
  const {node, onExecute} = useContext(CurContext);

  const filterOptions = useMemo(() => {
    const outputs = (executeData || {}).outputs || [];
    const names = _.reduce(
      outputs,
      (result, item) => {
        if (item?.name) {
          result[item.name] = 1;
        }
        return result;
      },
      {}
    );
    const keys = _.keys(names);

    if (keys.length) {
      return _.map(keys, (k) => ({
        value: k,
        label: k
      }));
    }
    return [];
  }, [executeData]);

  useEffect(() => {
    if (filterOptions.length && !filterOption) {
      // @ts-ignore
      setFilterOption(filterOptions[0].value);
    }
  }, [filterOptions, filterOption]);

  const handlePageChange = (page, size) => {
    LS.set('EXEC_PAGE_SIZE', size);

    setExecutionPageData({
      ...executionPageData,
      page, size
    })
  }

  const getExecResultList = useMemo(() => {
    const outputs = (executeData || {}).outputs || [];
    const outputField = filterOption
      ? _.find(outputs, (item) => item.name === filterOption)
      : outputs[0];
    const resultData = (outputField || {}).results || {};
    const dataList = formatListData(resultData.list || []);
    const pagination = resultData.pagination;
    const dataRow = {
      ...dataList[0]
    };

    if (pagination) {
      pagination.showQuickJumper = true
      pagination.pageSizeOptions = [
        20,
        50,
        100,
        200,
        500
      ]
    }

    delete dataRow.__key;

    // const getWidth = (len) => len * 8

    const getValue = v => {
      if (v === '' || v === undefined || v === null) {
        return '-';
      } else if (_.isArray(v)) {
        return v.map((item, index) => {
          return (
            <span key={index}>{ getValue(item) }</span>
          )
        })
      } else if (_.isObject(v)) {
        return JSON.stringify(v);
      }
      return v.toString();
    }

    const columns = _.map(_.keys(dataRow), (k) => ({
      key: k,
      title: k,
      dataIndex: k,
      // width: getWidth(Math.min(Math.max((dataRow[k] + '').length, k.length), 200)),
      render: getValue
    }));

    const size = (sizeRef || {}) as any;

    return (
      <div ref={conRef} className={cls(styles.preview, styles.contentBox, 'content-box')}>
        {filterOptions.length ? (
          <Row justify="end" align="middle" gutter={12}>
            <Col>{t('workflow.conditions.preview.output.label')}</Col>
            <Col>
              <Select
                size="small"
                value={filterOption}
                options={filterOptions}
                onChange={setFilterOption}
                dropdownMatchSelectWidth={false}
              />
            </Col>
          </Row>
        ) : null}
        {columns.length ? (
          <div className={styles.table}>
            <ListTable
              zebra
              noSpacing
              size="small"
              scroll={{
                x: columns.length * 150,
                y: size.height ? size.height - 120 : 400
              }}
              columns={columns}
              dataSource={dataList}
              pagination={pagination}
              loading={executeLoading}
              onPageChange={handlePageChange}
            />
          </div>
        ) : !executeLoading ? (
          <div>
            <p style={{marginTop: 24}}>
              <Text strong>{t('workflow.builder.execution.empty')}</Text>
            </p>
            <p>{t('workflow.builder.execution.empty.desc')}</p>
          </div>
        ) : null}
      </div>
    );
  }, [executeData, filterOption, executeLoading]);

  return getExecResultList;
};

export default Result;
