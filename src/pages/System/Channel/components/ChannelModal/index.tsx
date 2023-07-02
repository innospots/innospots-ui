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

import React, { useEffect, useMemo, useState } from 'react';

import _ from 'lodash';
import { useModel } from 'umi';

import { Row, Col, Form, Input, message, Select, Space, Table } from 'antd';
import { FormOutlined, PlusOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';
import NiceModal from '@/components/Nice/NiceModal';
import useModal from '@/common/hooks/useModal';

import { HandleType } from '@/common/types/Types';
import HttpApiModal, { MODAL_NAME as HTTP_API_MODAL_NAME } from '@/components/HttpApiModal';

import styles from './style.less';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

export const MODAL_NAME = 'ChannelModal';

const ChannelModal: React.FC = () => {
  const [formRes] = Form.useForm();

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const [httpApiModal] = useModal(HTTP_API_MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  const {
    mappingList,
    httpApiListData,
    mappingListRequest,
    httpApiListRequest,
    saveChannelRequest,
  } = useModel('Notification');

  const { t } = useI18n(['message', 'common']);
  const [httpApiItem, setHttpApiItem] = useState<any>(null);
  const [httpApiParams, setHttpApiParams] = useState<any>([]);

  const httpApiList = useMemo(
    () =>
      httpApiListData?.map((httpApi: { name: string; datasourceId: string }) => ({
        label: httpApi.name,
        value: httpApi.datasourceId,
      })),
    [httpApiListData],
  );

  useEffect(() => {
    if (visible) {
      setInitValues();
      mappingListRequest.run();
      httpApiListRequest.run();
    } else {
      setHttpApiItem(null);
    }
  }, [visible, modalType, initValues]);

  useEffect(() => {
    if (visible && httpApiListData?.length && initValues?.datasourceId) {
      const currentHttp = _.find(
        httpApiListData,
        (http: any) => http.datasourceId === initValues.datasourceId,
      );
      setHttpApiItem(currentHttp);
    }
  }, [visible, httpApiListData, initValues?.datasourceId]);

  const setInitValues = () => {
    const values = {
      ...initValues,
    };
    formRes.setFieldsValue(values);

    const paramList: any[] = [];
    if (modalType === 'edit') {
      _.map(initValues.params, (pa: any) => {
        paramList.push({
          key: randomString(4),
          name: pa.name,
          code: pa.code,
          valueType: pa.valueType,
        });
      });
    }
    setHttpApiParams(paramList);
  };

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      saveChannel(modalType, values);
    });
  };

  const changeMapFields = (e: any, index: number) => {
    const newList = [...httpApiParams];
    newList[index] = {
      ...newList[index],
      code: e,
    };

    setHttpApiParams(newList);
  };

  const saveChannel = async (type: HandleType, values: any) => {
    try {
      const postData = {
        ...values,
        params: [],
        channelType: 'HTTP',
        ..._.pick(Object.assign(httpApiItem || {}, initValues), 'messageChannelId', 'dataSetId'),
      };

      _.map(httpApiParams, (hap: any) => {
        const obj = Object.assign({}, hap);
        delete obj.key;
        postData.params.push(obj);
      });

      if (
        _.filter(
          postData.params,
          (pa: any) => !pa.code || _.isNull(pa.code) || _.isUndefined(pa.code),
        )?.length >= postData.params?.length
      ) {
        message.warn(t('notification.channel.form.error_message'));
        return;
      }

      const result = await saveChannelRequest.runAsync(type, postData);

      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const renderForm = () => {
    return (
      <Form form={formRes} preserve={false} {...formItemLayout}>
        <Form.Item
          label={t('notification.channel.input.name.label')}
          name="channelName"
          rules={[{ required: true, message: t('notification.channel.input.name.placeholder') }]}
        >
          <Input placeholder={t('notification.channel.input.name.placeholder')} />
        </Form.Item>
        <Form.Item
          className={styles.httpItem}
          label={t('notification.channel.input.httpapi.label')}
        >
          <Row justify="space-between" align="middle" gutter={12}>
            <Col flex={9}>
              <Form.Item
                noStyle
                name="datasourceId"
                rules={[
                  { required: true, message: t('notification.channel.input.httpapi.placeholder') },
                ]}
              >
                <Select
                  options={httpApiList}
                  placeholder={t('notification.channel.input.httpapi.placeholder')}
                  onChange={(e) => {
                    const currentHttp = _.find(
                      httpApiListData,
                      (http: any) => http.datasourceId === e,
                    );
                    setHttpApiItem(currentHttp);

                    const paramList: any[] = _.map(currentHttp.httpFields, (field: any) => ({
                      key: field.fieldId,
                      name: field.name,
                      code: null,
                      valueType: field.valueType,
                    }));
                    setHttpApiParams([...paramList]);
                  }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <FormOutlined onClick={() => httpApiItem && httpApiModal.show(httpApiItem)} />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    httpApiModal.show();
                  }}
                >
                  <PlusOutlined /> {t('common.link.create')}
                </a>
              </Space>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item name="channelName" label={t('notification.channel.mapper.label')}>
          <Table
            size="small"
            columns={[
              {
                title: t('notification.channel.mapper.param'),
                dataIndex: 'name',
              },
              {
                title: t('notification.channel.mapper.var'),
                dataIndex: 'code',
                render: (code: string, record: any, index: number) => (
                  <Select
                    size="small"
                    value={code}
                    placeholder={t('common.select.placeholder')}
                    options={_.map(mappingList, (map: any) => ({
                      label: map.name,
                      value: map.label,
                    }))}
                    onChange={(e) => changeMapFields(e, index)}
                  />
                ),
              },
            ]}
            dataSource={httpApiParams}
            pagination={false}
            scroll={{
              y: 320,
            }}
          />
        </Form.Item>
      </Form>
    );
  };

  const renderHttpApiModal = () => {
    return <HttpApiModal />;
  };

  return (
    <NiceModal
      width={840}
      destroyOnClose
      visible={visible}
      title={t(`notification.channel.form.${modalType}.title`)}
      okButtonProps={{
        loading: saveChannelRequest.loading,
        onClick: handleFormSubmit,
      }}
      onCancel={modal.hide}
    >
      {renderForm()}
      {renderHttpApiModal()}
    </NiceModal>
  );
};

export default ChannelModal;
