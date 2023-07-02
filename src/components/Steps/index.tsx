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

import React, { FC } from 'react';
import {Col, Row} from 'antd';
import cls from 'classnames';

import styles from './style.less';

export type StepsProps = {
  current?: number,
  items: {
    title: string
    description: string
  }[]
};

const Steps:FC<StepsProps> = ({ items, current }) => {

  return (
    <Row gutter={38} className={styles.steps}>
      {
        items.map((item, index) => (
          <Col className={cls(styles.stepItem, {
            [styles.active]: index === (current || 0)
          })} key={index}>
            <Row gutter={12} align="middle">
              <Col>
                <div className={styles.stepItemIcon}>{ index + 1 }</div>
              </Col>
              <Col>
                <p className={styles.stepItemTitle}>{ item.title }</p>
                <p className={styles.stepItemDescription}>{ item.description }</p>
              </Col>
            </Row>
          </Col>
        ))
      }
    </Row>
  )
}

export default Steps;