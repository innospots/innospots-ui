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

import React, { useMemo } from 'react';
import cls from 'classnames';
import _ from 'lodash';

import { Row, Col, Image, Button, Collapse, Typography, Empty } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';

import styles from './index.less';

const { Panel } = Collapse;
const { Text } = Typography;

const getSuffix = (name: string) => {
  const fs = name.split('.');
  return (fs[fs.length - 1] || '').toLowerCase();
}

const isImage = (name: string) => {
  const suffix = getSuffix(name);
  return ['png', 'jpg', 'jpeg', 'gif'].includes(suffix)
}

const Attachment:React.FC<any> = ({executeData}) => {

  const resources = useMemo(() => {
    const { outputs } = executeData || {};
    if (outputs?.length) {
      return outputs[0].resources
    }
    return null;
  }, [ executeData ]);

  const { t } = useI18n(['workflow', 'common']);

  return (
    <div className={cls(styles.preview, styles.contentBox, styles.attachmentContainer, 'content-box')}>
      {
        resources ? (
          <Collapse ghost defaultActiveKey={['0', '1']}>
            {
              _.map(resources, (files, index) => (
                <Panel header={`#${index}`} key={index} style={{marginBottom: 4}}>
                  <Row gutter={[12, 12]}>
                    {
                      _.map(files, (item, num) => {

                        return (
                          <Col span={8} key={['f', num].join('_')}>
                            <div className={styles.attachCard}>
                              <div className={styles.cardInner}>
                                <div className={styles.cardHead}>
                                  <span>attachment_{ (num + 1) }</span>
                                </div>
                                <div className={styles.cardContent}>
                                  <div className={styles.fileBlock}>
                                    <p className={styles.title}>{t('workflow.builder.text.filename')}</p>
                                    <Text ellipsis className={styles.text} title={item.resourceName}>{ item.resourceName }</Text>
                                  </div>
                                  <div className={styles.fileBlock}>
                                    <Row>
                                      <Col span={12}>
                                        <p className={styles.title}>{t('workflow.builder.text.suffix')}</p>
                                        <Text ellipsis className={styles.text}>{ getSuffix(item.resourceName) }</Text>
                                      </Col>
                                      <Col span={12}>
                                        <p className={styles.title}>{t('workflow.builder.text.mime')}</p>
                                        <Text ellipsis className={styles.text} title={item.mimeType}>{ item.mimeType }</Text>
                                      </Col>
                                    </Row>
                                  </div>
                                  {
                                    isImage(item.resourceName) ? (
                                      <div className={styles.fileBox}>
                                        <Image height="100%" src={item.resourceUri} alt={item.resourceName} />
                                      </div>
                                    ) : (
                                      <div className={cls(styles.fileBox, styles.ghost)}>
                                        <Row align="middle" justify="center" style={{height: '100%'}}>
                                          <Col>
                                            <Button
                                              size="small"
                                              shape="round"
                                              type="primary"
                                              className={styles.downloadBtn}
                                            >
                                              {t('common.button.download_file')}
                                            </Button>
                                          </Col>
                                        </Row>
                                      </div>
                                    )
                                  }
                                </div>
                              </div>
                            </div>
                          </Col>
                        )
                      })
                    }
                    {/*<Col span={8}>*/}
                    {/*  <div className={styles.attachCard}>*/}
                    {/*    <div className={styles.cardInner}>*/}
                    {/*      <div className={styles.cardHead}>*/}
                    {/*        <span>attachment_0</span>*/}
                    {/*      </div>*/}
                    {/*      <div className={styles.cardContent}>*/}
                    {/*        <div className={styles.fileBlock}>*/}
                    {/*          <p className={styles.title}>{t('workflow.builder.text.filename')}</p>*/}
                    {/*          <p className={styles.text}>iShot_2022-12-25_14.10.12.png</p>*/}
                    {/*        </div>*/}
                    {/*        <div className={styles.fileBlock}>*/}
                    {/*          <Row>*/}
                    {/*            <Col span={12}>*/}
                    {/*              <p className={styles.title}>{t('workflow.builder.text.suffix')}</p>*/}
                    {/*              <p className={styles.text}>png</p>*/}
                    {/*            </Col>*/}
                    {/*            <Col span={12}>*/}
                    {/*              <p className={styles.title}>{t('workflow.builder.text.mime')}</p>*/}
                    {/*              <p className={styles.text}>application/png</p>*/}
                    {/*            </Col>*/}
                    {/*          </Row>*/}
                    {/*        </div>*/}
                    {/*        <div className={styles.fileBox}>*/}
                    {/*          <Image height="100%" src="http://1.15.20.45/prototype/v1.2/images/%E6%96%87%E4%BB%B6%E6%A0%87%E7%AD%BE%E9%A1%B5%E5%B1%95%E7%A4%BA%E8%A7%84%E5%88%99/u612.png" alt=""/>*/}
                    {/*        </div>*/}
                    {/*      </div>*/}
                    {/*    </div>*/}
                    {/*  </div>*/}
                    {/*</Col>*/}
                    {/*<Col span={8}>*/}
                    {/*  <div className={styles.attachCard}>*/}
                    {/*    <div className={styles.cardInner}>*/}
                    {/*      <div className={styles.cardHead}>*/}
                    {/*        <span>attachment_0</span>*/}
                    {/*      </div>*/}
                    {/*      <div className={styles.cardContent}>*/}
                    {/*        <div className={styles.fileBlock}>*/}
                    {/*          <p className={styles.title}>{t('workflow.builder.text.filename')}</p>*/}
                    {/*          <p className={styles.text}>iShot_2022-12-25_14.10.12.png</p>*/}
                    {/*        </div>*/}
                    {/*        <div className={styles.fileBlock}>*/}
                    {/*          <Row>*/}
                    {/*            <Col span={12}>*/}
                    {/*              <p className={styles.title}>{t('workflow.builder.text.suffix')}</p>*/}
                    {/*              <p className={styles.text}>png</p>*/}
                    {/*            </Col>*/}
                    {/*            <Col span={12}>*/}
                    {/*              <p className={styles.title}>{t('workflow.builder.text.mime')}</p>*/}
                    {/*              <p className={styles.text}>application/png</p>*/}
                    {/*            </Col>*/}
                    {/*          </Row>*/}
                    {/*        </div>*/}
                    {/*        <div className={cls(styles.fileBox, styles.ghost)}>*/}
                    {/*          <Row align="middle" justify="center" style={{height: '100%'}}>*/}
                    {/*            <Col>*/}
                    {/*              <Button*/}
                    {/*                size="small"*/}
                    {/*                shape="round"*/}
                    {/*                type="primary"*/}
                    {/*                className={styles.downloadBtn}*/}
                    {/*              >*/}
                    {/*                {t('common.button.download_file')}*/}
                    {/*              </Button>*/}
                    {/*            </Col>*/}
                    {/*          </Row>*/}
                    {/*        </div>*/}
                    {/*      </div>*/}
                    {/*    </div>*/}
                    {/*  </div>*/}
                    {/*</Col>*/}
                    {/*<Col span={8}>*/}
                    {/*  <div className={styles.attachCard}>*/}
                    {/*    <div className={styles.cardInner}>*/}
                    {/*      <div className={styles.cardHead}>*/}
                    {/*        <span>attachment_0</span>*/}
                    {/*      </div>*/}
                    {/*      <div className={styles.cardContent}>*/}
                    {/*        <div className={styles.fileBlock}>*/}
                    {/*          <p className={styles.title}>{t('workflow.builder.text.filename')}</p>*/}
                    {/*          <p className={styles.text}>iShot_2022-12-25_14.10.12.png</p>*/}
                    {/*        </div>*/}
                    {/*        <div className={styles.fileBlock}>*/}
                    {/*          <Row>*/}
                    {/*            <Col span={12}>*/}
                    {/*              <p className={styles.title}>{t('workflow.builder.text.suffix')}</p>*/}
                    {/*              <p className={styles.text}>png</p>*/}
                    {/*            </Col>*/}
                    {/*            <Col span={12}>*/}
                    {/*              <p className={styles.title}>{t('workflow.builder.text.mime')}</p>*/}
                    {/*              <p className={styles.text}>application/png</p>*/}
                    {/*            </Col>*/}
                    {/*          </Row>*/}
                    {/*        </div>*/}
                    {/*        <div className={styles.fileBox}>*/}
                    {/*          <Row justify="space-between">*/}
                    {/*            <Col>*/}
                    {/*              <div className={styles.fileBlock}>*/}
                    {/*                <p className={styles.title}>{t('workflow.builder.text.filename')}</p>*/}
                    {/*              </div>*/}
                    {/*            </Col>*/}
                    {/*            <Col>*/}
                    {/*              <span className="g-button"><DownloadOutlined /></span>*/}
                    {/*            </Col>*/}
                    {/*          </Row>*/}
                    {/*          <p>iShot_2022-12-25_14.10.12.png</p>*/}
                    {/*          <p>iShot_2022-12-25_14.10.12.png</p>*/}
                    {/*          <p>iShot_2022-12-25_14.10.12.png</p>*/}
                    {/*        </div>*/}
                    {/*      </div>*/}
                    {/*    </div>*/}
                    {/*  </div>*/}
                    {/*</Col>*/}
                  </Row>
                </Panel>
              ))
            }
          </Collapse>
        ) : (
          <div style={{paddingTop: 40}}>
            <Empty />
          </div>
        )
      }
    </div>
  )
}

export default Attachment;