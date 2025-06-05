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
import React, { useMemo } from 'react';

import ReactJson from '@microlink/react-json-view';

import DataList from './DataList';
import { getTextWidth } from '@/common/utils';

interface ResultProps {
  dataSource: any;
}

const Result: React.FC<ResultProps> = ({ dataSource }) => {
  const getResultList = useMemo(() => {
    if (!_.isArray(dataSource)) {
      return null;
    }

    const dataRow = {
      ...dataSource[0],
    };

    delete dataRow.__key;

    const columns = _.map(_.keys(dataRow), (k) => ({
      key: k,
      title: k,
      dataIndex: k,
      width: ['data', 'outputs'].includes(k) ? 320 : Math.max(getTextWidth(k), 140),
    }));

    return <DataList columns={columns} dataSource={dataSource} />;
  }, [dataSource]);

  const getJsonView = useMemo(() => {
    if (!_.isPlainObject(dataSource) || _.isEmpty(dataSource)) {
      return null;
    }

    return (
      <div style={{ height: '100%' }} className="custom-scrollbar">
        {/* @ts-ignore */}
        <ReactJson
          name={false}
          src={dataSource}
          iconStyle="square"
          enableClipboard={false}
          displayDataTypes={false}
        />
      </div>
    );
  }, [dataSource]);

  return getResultList || getJsonView;
};

export default Result;
