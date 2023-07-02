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

import React, { useEffect } from 'react';
import { useModel } from 'umi';
import cls from 'classnames';

import { Row, Col, Spin, Card, Empty, Avatar, Popconfirm, Typography } from 'antd';

import { IconFont } from '@/components/Nice/NiceIcon';
import InnoIcon from '@/components/Icons/InnoIcon';

import PageTitle from '@/components/PageTitle';
import HttpApiModal, { MODAL_NAME } from '@/components/HttpApiModal';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';
import PermissionSection, { usePermission } from '@/components/PermissionSection';

import styles from './style.less';

const { Meta } = Card;
const { Paragraph } = Typography;

const HttpApi: React.FC = () => {
  const [modal] = useModal(MODAL_NAME);
  const [deleteAuth] = usePermission('HttpApi-deleteHttpApi');
  const { t, loading: i18nLoading } = useI18n(['httpapi', 'common']);
  const { httpApis, httpApisRequest, deleteHttpApiRequest } = useModel('HttpApi');

  useEffect(() => {
    httpApisRequest.run();
  }, []);

  const editCurData = (item: any) => {
    modal.show(item);
  };

  const deleteConfirm = (id: number) => () => {
    return new Promise<void>(async (resolve) => {
      await deleteHttpApiRequest.runAsync(id);

      resolve();
    });
  };

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={t('httpapi.main.heading_title')}
        rightContent={{
          search: {
            placeholder: t('httpapi.main.input.search.placeholder'),
            onSearch: (value: string) => {
              httpApisRequest.run(value);
            },
          },
          button: {
            label: t('httpapi.main.button.add'),
            itemKey: 'HttpApi-createHttpApi',
            onClick: () => {
              modal.show();
            },
          },
        }}
      />
    );
  };

  const renderCardNode = () => {
    let displayNode;

    if (httpApisRequest.loading) {
      displayNode = (
        <div className="g-loading" style={{ marginTop: 140 }}>
          <Spin />
        </div>
      );
    } else if (!httpApis?.length) {
      displayNode = (
        <div style={{ marginTop: 140 }}>
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={t('httpapi.main.info.empty')}
          />
        </div>
      );
    } else {
      displayNode = (
        <Row gutter={[20, 20]}>
          {httpApis.map((item, index) => {
            const actions:any[] = [];
            const method = (item.apiMethod || 'get').toLowerCase();

            actions.push(
              <>
                <PermissionSection itemKey="HttpApi-updateHttpApi">
                  <div onClick={() => editCurData(item)}>
                    <InnoIcon type="edit-alt" /> {t('common.button.edit')}
                  </div>
                </PermissionSection>
              </>
            );

            if (deleteAuth) {
              actions.push(
                <div>
                  <Popconfirm
                    title={t('common.text.delete_confirmation')}
                    onConfirm={deleteConfirm(item.registryId)}
                    okText={t('common.button.confirm')}
                    cancelText={t('common.button.cancel')}
                  >
                    <InnoIcon type="delete" /> {t('common.button.delete')}
                  </Popconfirm>
                </div>,
              );
            } else {
              actions.push(
                <PermissionSection itemKey="HttpApi-deleteHttpApi">
                  <div>
                    <InnoIcon type="delete" /> {t('common.button.delete')}
                  </div>
                </PermissionSection>,
              );
            }

            return (
              <Col span={8} key={['card', item.registryId].join('-')}>
                <Card actions={actions} bordered={false}>
                  <Meta
                    avatar={
                      <Avatar size={48} className={cls(styles.avatar)}>
                        <IconFont type={`innospot-icon-http-${method}`} />
                      </Avatar>
                    }
                    title={item.name}
                    description={item.configCode}
                  />
                  <div style={{ clear: 'both' }} />
                  <div className={styles.infoWrapper}>
                    <Row justify="space-between">
                      <Col span={8}>
                        <p>• {t('httpapi.main.card.author')}</p>
                        <Paragraph ellipsis={{ rows: 1 }}>{item.createdBy || '--'}</Paragraph>
                      </Col>
                      <Col span={8}>
                        <p>• {t('httpapi.main.card.create_time')}</p>
                        <p>{(item.createdTime || '').split(' ')[0] || '--'}</p>
                      </Col>
                      <Col span={8}>
                        <p>• {t('httpapi.main.card.update_time')}</p>
                        <p>{(item.updatedTime || '').split(' ')[0] || '--'}</p>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      );
    }

    return <div className={styles.cardListWrapper}>{displayNode}</div>;
  };

  const renderHttpApiModal = () => <HttpApiModal />;

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {renderPageHeader()}
      {renderCardNode()}
      {renderHttpApiModal()}
    </>
  );
};

export default HttpApi;
