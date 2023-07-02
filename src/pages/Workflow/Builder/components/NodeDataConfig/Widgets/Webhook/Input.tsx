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

import React, {useContext, useEffect} from 'react';
import {Input, Row, Col, Typography, Divider} from 'antd';
import {useMount, useControllableValue} from 'ahooks';
import _ from 'lodash';
import {useModel} from 'umi';

import useI18n from '@/common/hooks/useI18n';
import CurContext from '../../../../common/context';

import type {FormItemProps} from '../types';

const {Paragraph} = Typography;

const WebhookInput: React.FC<FormItemProps> = ({schema, addons, readOnly, ...rest}) => {
  const {t} = useI18n(['workflow', 'common']);
  const {flowKey} = useContext(CurContext);

  const {webhookAddress, fetchWebhookAddressRequest} = useModel('Workflow', (model) =>
    _.pick(model, ['webhookAddress', 'fetchWebhookAddressRequest'])
  );

  const [inputValue, setInputValue] = useControllableValue<string>(rest);

  useEffect(() => {
    if (!readOnly && _.isUndefined(inputValue)) {
      setInputValue(flowKey);
    }
  }, [inputValue, readOnly, flowKey]);

  useMount(() => {
    if (readOnly && !webhookAddress.webhookApiServer && !fetchWebhookAddressRequest.loading) {
      getWebhookAddress();
    }
  });

  const getWebhookAddress = () => {
    fetchWebhookAddressRequest.run();
  };

  return (
    <div style={{width: '100%'}}>
      <Row gutter={[0, 8]} align="middle">
        {readOnly ? (
          <Col span={24}>{inputValue || '-'}</Col>
        ) : (
          <>
            <Col span={24}>
              <Input
                value={inputValue}
                placeholder={schema.placeholder || t('common.input.placeholder')}
                onChange={(event) => {
                  setInputValue(event.target.value)
                }}
              />
            </Col>
            {
              webhookAddress?.webhookApiServer && (
                <Col span={24}>
                  <Row gutter={8}>
                    <Col>{t('workflow.webhook.production.url')}:</Col>
                    <Col>
                      <Paragraph style={{marginBottom: 0}} copyable>
                        {`${webhookAddress.webhookApiServer}${inputValue}`}
                      </Paragraph>
                    </Col>
                  </Row>
                </Col>
              )
            }
            {
              webhookAddress?.webhookApiTest && (
                <Col span={24}>
                  <Row gutter={8}>
                    <Col>{t('workflow.webhook.test.url')}:</Col>
                    <Col>
                      <Paragraph style={{marginBottom: 0}} copyable>
                        {`${webhookAddress.webhookApiTest}/${flowKey}`}
                      </Paragraph>
                    </Col>
                  </Row>
                </Col>
              )
            }
          </>
        )}
      </Row>
      <Divider />
    </div>
  );
};

export default WebhookInput;
