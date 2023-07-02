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
import { Col, Pagination, Row, Table } from 'antd';
import { TableProps } from 'antd/es/table';
import cls from 'classnames';

import useI18n from '@/common/hooks/useI18n';
import { KeyValues } from '@/common/types/Types';

import styles from './style.less';

export type ListTableProps = TableProps<any> & {
  zebra?: boolean;
  noSpacing?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
};

const ListTable: React.FC<ListTableProps> = (props) => {
  const { size, zebra, noSpacing, pagination, onPageChange, ...rest } = props;

  let page: boolean | any = pagination;

  const { t } = useI18n(['common']);

  const renderPageNode = () => {
    // const totalText = t('common.table.pagination.total_count');
    // const currentText = t('common.table.pagination');

    if (page && page.total) {
      // const ps = size === 'mini' ? 'small' : size;
      return (
        <Row align="middle" justify="end" className={styles.pageNode}>
          <Col>
            <span style={{ fontSize: 12 }}>{t('common.table.pagination.total_count', page)}</span>
            {/*<Space>*/}
            {/*    <span>{totalText?.replace('{', page.total)?.replace('}', '')}</span>*/}
            {/*    <span>{currentText?.replace('{', `${page.current} / ${page.totalPage} `)?.replace('}', '')}</span>*/}
            {/*</Space>*/}
          </Col>
          <Col>
            <Pagination
              size="small"
              showLessItems
              showSizeChanger
              {...page}
              onChange={onPageChange}
            />
          </Col>
        </Row>
      );
    }

    return null;
  };

  return (
    <div
      className={cls(styles.listTable, size && styles[size], {
        [styles.zebra]: zebra,
        [styles.noSpacing]: noSpacing,
      })}
    >
      <Table rowKey="__key" {...rest} pagination={false} />
      {renderPageNode()}
    </div>
  );
};

export default ListTable;
