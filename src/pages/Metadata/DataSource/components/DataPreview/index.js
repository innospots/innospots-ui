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

import React, { useState, useEffect } from 'react';
import { Row, Col, Table } from 'antd';

import _ from 'lodash';
import { useModel } from 'umi';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const DataPreview = ({ schemaRegistry }) => {
  const [previewData, setPreviewData] = useState({});

  const { t } = useI18n(['datasource']);

  const { datasetPreviewRequest } = useModel('Dataset');
  const { registryId, datasourceId } = schemaRegistry || {};

  useEffect(() => {
    if (registryId && datasourceId) {
      getPreviewData();
    }
  }, [registryId, datasourceId]);

  const getPreviewData = async () => {
    const preview = await datasetPreviewRequest.runAsync({
      registryId,
      datasourceId,
    });

    setPreviewData(preview || {});
  };

  const dataSource = previewData.list || [];
  const dataRow = dataSource[0];

  const getWidth = (len) => len * 14;

  const columns = _.map(_.keys(dataRow), (k) => ({
    key: k,
    title: k,
    dataIndex: k,
    width: getWidth(Math.min(Math.max((dataRow[k] + '').length, k.length), 200)),
    render(value) {
      if (value === '' || value === undefined || value === null) {
        return '——';
      }
      return value;
    },
  }));

  return (
    <div className={styles.previewNode}>
      <Row className={styles.previewHeader}>
        <Col>
          <div className={styles.label}>{t('dataset.form.preview')}:</div>
        </Col>
        {/*<Col>*/}
        {/*  <Button type="link" size="small" onClick={handlePreviewRun}>*/}
        {/*    <CaretRightOutlined />运行*/}
        {/*  </Button>*/}
        {/*</Col>*/}
      </Row>
      {dataRow ? (
        <div className={styles.previewTable}>
          <Table size="small" columns={columns} scroll={{ y: 120 }} dataSource={dataSource} />
        </div>
      ) : null}
      <div className={styles.previewFooter}>
        <Row justify="space-between">
          <Col>
            <p></p>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default React.memo(DataPreview);
