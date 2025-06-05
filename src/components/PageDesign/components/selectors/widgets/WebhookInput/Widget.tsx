import _ from 'lodash';
import cls from 'classnames'
import {useModel, useParams} from 'umi';
import React, {forwardRef, useEffect} from 'react';
import {Input, Row, Col, Typography} from 'antd';
import {useMount, useControllableValue} from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import type { WidgetItemType } from '@/models/AppEditor';

import styles from '../../style.less';

const {Paragraph} = Typography;

type Props = {
  inForm?: boolean;
} & WidgetItemType;

const WebhookInput: React.FC<Props> = forwardRef(({ settings = {}, ...rest }, ref) => {
  const {t} = useI18n(['workflow', 'common']);
  const flowKey = ''
  const readOnly = false

  const {webhookAddress, fetchWebhookAddressRequest} = useModel('Workflow', (model) =>
    _.pick(model, ['webhookAddress', 'fetchWebhookAddressRequest'])
  );

  const {workflowType} = useParams();
  const [inputValue, setInputValue] = useControllableValue<string>(rest);

  useEffect(() => {
    if (!readOnly && _.isUndefined(inputValue)) {
      setInputValue(flowKey);
    }
  }, [inputValue, readOnly, flowKey]);

  const getWebhookAddress = () => {
    fetchWebhookAddressRequest.run(workflowType);
  };

  useMount(() => {
    if (readOnly && !webhookAddress.webhookApiServer && !fetchWebhookAddressRequest.loading) {
      getWebhookAddress();
    }
  });

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          <Row gutter={[0, 8]} align="middle">
            {readOnly ? (
              <Col span={24}>{inputValue || '-'}</Col>
            ) : (
              <>
                <Col span={24}>
                  <Input
                    value={inputValue}
                    placeholder={settings.placeholder || t('common.input.placeholder')}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                    }}
                  />
                </Col>
                {webhookAddress?.webhookApiServer && (
                  <Col span={24}>
                    <Row gutter={8}>
                      <Col>{t('workflow.webhook.production.url')}:</Col>
                      <Col>
                        <Paragraph style={{ marginBottom: 0 }} copyable>
                          {`${webhookAddress.webhookApiServer}${inputValue}`}
                        </Paragraph>
                      </Col>
                    </Row>
                  </Col>
                )}
                {webhookAddress?.webhookApiTest && (
                  <Col span={24}>
                    <Row gutter={8}>
                      <Col>{t('workflow.webhook.test.url')}:</Col>
                      <Col>
                        <Paragraph style={{ marginBottom: 0 }} copyable>
                          {`${webhookAddress.webhookApiTest}/${inputValue}`}
                        </Paragraph>
                      </Col>
                    </Row>
                  </Col>
                )}
              </>
            )}
          </Row>
        </div>
      </div>
    </div>
  );
})

export default WebhookInput;
