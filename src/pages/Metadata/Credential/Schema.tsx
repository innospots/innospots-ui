

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

import React, { useRef, useMemo, useState, useEffect } from 'react';
import _ from 'lodash';
import cls from 'classnames';
import { useSize, useReactive } from 'ahooks';
import { useModel } from 'umi';

import {
  Row,
  Col,
  Spin,
  Table,
  Input,
  Empty,
  Button,
  Select,
  message,
  Checkbox,
  Popconfirm,
  Typography,
} from 'antd';
import {
  KeyOutlined,
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import PageHeader from './components/Header';
import SQLQuery from './components/SQLQuery';
import DataPreview from './components/DataPreview';
import KafkaTableModal, { MODAL_NAME } from '@/components/KafkaTableModal';

import { randomString } from '@/common/utils';

import { DATA_TYPES } from '@/common/constants';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import PageLoading from '@/components/PageLoading';

import styles from './style.less';

const { Option } = Select;
const { Link } = Typography;

interface DataType {
  pkey: string;
  code: string;
  name: string;
  [key: string]: any
}

const getFieldItem = (item?: any) => ({
  key: randomString(4),
  valueType: 'STRING',
  ...item,
});

interface DataFieldType {
  list: {
    pkey?: string;
    fieldId?: number;
  }[];
  isNew: boolean;
  editData: any;
}

const Page = ({ location }) => {
  const [kafkaModal] = useModal(MODAL_NAME);

  const { t, loading: i18nLoading } = useI18n(['datasource', 'dataset', 'common']);

  const fieldsRef = useRef<any>();
  const fieldsSizeRef = useSize(fieldsRef);

  const dataField = useReactive<DataFieldType>({
    list: [],
    isNew: false,
    editData: null,
  });

  const [queryCode, setQueryCode] = useState('');
  const [schemaRegistry, setSchemaRegistry] = useState<{
    registryId: number;
    configs?: any;
    description: string;
    name: string;
  } | null>(null);
  const [dataSetKeyword, setDataSetKeyword] = useState('');
  const [credentialDetail, setCredentialDetail] = useState<{
    configCode?: string;
    database?: any;
    schemaTable?: any;
  }>({});

  const pkFieldId = useMemo(() => {
    const item = _.find(dataField.list, (item) => item.pkey);
    if (item) {
      // @ts-ignore
      return item.fieldId;
    }
    return null;
  }, [dataField.list]);

  const credentialId = location.query.credentialId * 1;

  const {
    detailRequest,
    saveSchemaFieldRequest,
    deleteSchemaFieldRequest,
    deleteSchemaRegistryRequest,

    schemaRegistries,
    schemaRegistryRequest,
    fetchSchemaFieldsRequest,
  } = useModel('Credential');

  useEffect(() => {
    dataField.list = [];
    getDataSourceData();
  }, [credentialId]);

  useEffect(() => {
    return () => {
      dataField.list = [];
      setSchemaRegistry(null);
    };
  }, []);

  useEffect(() => {
    if (schemaRegistry?.registryId && credentialId) {
      getDataFields();
    }
  }, [schemaRegistry?.registryId, credentialId]);

  const isShowDataSet = useMemo(
    () => ['kafka', 'collect'].includes(credentialDetail.configCode as string),
    [credentialDetail],
  );
  const filterSchemaRegistries = useMemo(
    () =>
      _.filter(
        schemaRegistries,
        (item) => item?.credentialId === credentialId && item?.name.indexOf(dataSetKeyword) > -1,
      ),
    [dataSetKeyword, schemaRegistries, credentialId],
  );

  useEffect(() => {
    setSchemaRegistry(filterSchemaRegistries[0] || null);
  }, [dataSetKeyword]);

  const getDataSourceData = async () => {
    const result = await detailRequest.runAsync(credentialId);

    await schemaRegistryRequest.runAsync(credentialId);

    setCredentialDetail(result);
  };

  const handleDataSetFilter = (event) => {
    setDataSetKeyword(event.target.value);
  };

  const getDataFields = async () => {
    const params: {
      queryCode?: string;
      registryId?: number;
      credentialId?: number;
    } = {
      credentialId: credentialId,
      registryId: schemaRegistry?.registryId,
    };

    if (queryCode !== '') {
      params.queryCode = queryCode;
    }

    const resData = await fetchSchemaFieldsRequest.runAsync(params);
    if (resData) {
      dataField.list = _.map(resData, (item) => getFieldItem(item));
    }
  };

  const deleteSchemaRegistry = (registryId: number) => () =>
    new Promise<void>(async (resolve) => {
      const result = await deleteSchemaRegistryRequest.runAsync(registryId);
      if (!result) {
        message.error(t('common.error_message.delete.fail'));
      } else {
        if (registryId === schemaRegistry?.registryId) {
          setSchemaRegistry(filterSchemaRegistries[0]);
        }
      }

      resolve();
    });

  const handleAddDataField = () => {
    const newData = getFieldItem();
    dataField.isNew = true;
    dataField.editData = newData;
  };

  const updateTableFieldParam = (key, value) => {
    dataField.editData[key] = value;
  };

  const handleSaveDataField = async () => {
    const editData = dataField.editData;
    let error;

    if (!editData?.code) {
      error = 'datasource.kafka_schema.wizard.input.code.empty_message';
    } else if (!editData.name) {
      error = 'datasource.kafka_schema.wizard.input.schema_name.empty_message';
    }

    if (error) {
      message.error(t(error));
    } else if (schemaRegistry) {
      const config = schemaRegistry.configs || {};
      const registryId = schemaRegistry.registryId;
      const resData = await saveSchemaFieldRequest.runAsync({
        ...editData,
        registryId,
        registryCode: config.topic,
        credentialId: credentialId,
      });

      if (resData) {
        message.success(t('common.error_message.save.success'));

        getDataFields();

        dataField.isNew = false;
        dataField.editData = null;
      }
    }
  };

  const deleteCurDataField = (fieldId: number) => () =>
    new Promise<void>(async (resolve) => {
      const resData = await deleteSchemaFieldRequest.runAsync(fieldId);
      if (resData) {
        resolve();
        dataField.list = _.filter(dataField.list, (item) => item.fieldId !== fieldId);
      }
    });

  const renderDataSetList = () => {
    return (
      <div className={styles.dataset}>
        <div className={styles.header}>
          <Row justify="space-between" align="middle">
            <Col>
              <h3 className={styles.title}>{t('datasource.kafka_schema.schema.title')}</h3>
            </Col>
            <Col>
              <Link onClick={() => kafkaModal.show()}>
                <PlusCircleOutlined style={{ fontSize: 16 }} />
              </Link>
            </Col>
          </Row>
        </div>
        <div className={styles.datasetInner}>
          <div className={styles.search}>
            <Input
              bordered={false}
              placeholder={t('datasource.kafka_schema.wizard.topic.placeholder')}
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              onChange={_.debounce(handleDataSetFilter, 500)}
            />
          </div>

          <div className={styles.curTree}>
            {!filterSchemaRegistries.length ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <ul>
                {_.map(filterSchemaRegistries, (item) => (
                  <li
                    key={item.registryId}
                    className={cls({
                      [styles.active]: schemaRegistry?.registryId === item.registryId,
                    })}
                    onClick={() => {
                      setSchemaRegistry(item);
                    }}
                  >
                    <Row justify="space-between">
                      <Col>
                        <span className={styles.icon}>
                          <UnorderedListOutlined />
                        </span>
                        <span>{item.name}</span>
                      </Col>
                      <Col>
                        <span
                          className={styles.btn}
                          onClick={() => {
                            setSchemaRegistry(item);
                            kafkaModal.show(item);
                          }}
                        >
                          <EditOutlined />
                        </span>
                        <Popconfirm
                          title={t('common.text.delete_confirmation')}
                          onConfirm={deleteSchemaRegistry(item.registryId)}
                        >
                          <span className={styles.btn}>
                            <DeleteOutlined />
                          </span>
                        </Popconfirm>
                      </Col>
                    </Row>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getDataSetInfo = () => {
    const ds = schemaRegistry || {
      name: '',
      configs: {},
      description: '',
    };
    const configs = ds.configs || {};

    return (
      <div className={styles.datasetInfo}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('datasource.kafka_schema.table.message')}</h3>
        </div>
        <div className={styles.infoInner}>
          <p className={styles.title}>{t('datasource.kafka_schema.name')}：</p>
          <p>{ds.name || '--'}</p>
          <p className={styles.title}>Kafka Topic：</p>
          <p>{configs['topic'] || '--'}</p>
          <p className={styles.title}>{t('datasource.kafka_schema.column.coment')}：</p>
          <p>{ds.description || '--'}</p>
          <p className={styles.title}>消息格式：</p>
          <p>{configs['message.format'] || '--'}</p>
          <p className={styles.title}>scan.startup.mode：</p>
          <p>{configs['scan.startup.mode'] || '--'}</p>
        </div>
      </div>
    );
  };

  const getDataBaseNode = () => {
    const database = credentialDetail.database;
    const schemaTable = credentialDetail.schemaTable;

    if (!database) return null;

    const value = database.nameList[0];

    return (
      <div className={styles.dataBase}>
        <Row justify="space-between" className={styles.dataBaseTop}>
          <span className={styles.title}>数据库表</span>
          <span className={styles.refresh}>刷新</span>
        </Row>
        <div className={styles.search}>
          <Input className={styles.searchDefaultInput} bordered={false} placeholder="搜索表名称" />
        </div>
        {schemaTable && (
          <div className={styles.curTree}>
            <ul>
              {_.map(schemaTable.nameList, (name) => {
                return (
                  <li key={name}>
                    <Row justify="space-between">
                      <Col>
                        <span>{name}</span>
                      </Col>
                    </Row>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const getLeftNode = () => {
    return (
      <div className={styles.left}>
        <div className={styles.bgInner}>
          <div className={styles.top}>
            {isShowDataSet ? renderDataSetList() : getDataBaseNode()}
          </div>
          <div className={styles.bottom}>{getDataSetInfo()}</div>
        </div>
      </div>
    );
  };

  const getFieldList = () => {
    const isUpdate = (record) => {
      const editData = dataField.editData;
      return editData && editData?.key === record.key;
    };

    const columns: ColumnsType<DataType> = [
      {
        title: 'PK',
        dataIndex: 'pkey',
        width: 80,
        align: 'center',
        render: (value, record) => {
          if (isUpdate(record)) {
            return (
              <Checkbox
                checked={!!value}
                disabled={!!(pkFieldId && pkFieldId !== record.fieldId)}
                onChange={(event) => updateTableFieldParam('pkey', event.target.checked)}
              />
            );
          } else {
            return value ? <KeyOutlined /> : null;
          }
        },
      },
      {
        title: t('datasource.metadata.column.code'),
        dataIndex: 'code',
        sortOrder: 'ascend',
        sorter: true,
        render: (value, record) => {
          const editData = dataField.editData;
          if (isUpdate(record)) {
            return (
              <Input
                placeholder={t('common.input.placeholder')}
                value={editData.code}
                onChange={(event) => updateTableFieldParam('code', event.target.value)}
              />
            );
          } else {
            return value;
          }
        },
      },
      {
        title: t('datasource.metadata.column.type'),
        dataIndex: 'valueType',
        render: (value, record) => {
          const editData = dataField.editData;
          if (isUpdate(record)) {
            return (
              <Select
                value={editData.valueType}
                style={{ width: '100%' }}
                placeholder={t('common.input.placeholder')}
                onChange={(value) => updateTableFieldParam('valueType', value)}
              >
                {_.map(DATA_TYPES, (type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: t('datasource.metadata.column.comment'),
        dataIndex: 'name',
        sortOrder: 'ascend',
        sorter: true,
        render: (value, record) => {
          const editData = dataField.editData;
          if (isUpdate(record)) {
            return (
              <Input
                placeholder={t('common.input.placeholder')}
                value={editData?.name}
                onChange={(event) => updateTableFieldParam('name', event.target.value)}
              />
            );
          } else {
            return value;
          }
        },
      },
      {
        title: t('datasource.metadata.column.action'),
        width: 100,
        align: 'center',
        render: (value, record) => {
          if (isUpdate(record)) {
            return (
              <div className={styles.configEdit}>
                {saveSchemaFieldRequest.loading ? (
                  <span>
                    <Spin size="small" />
                  </span>
                ) : (
                  <span className="b-button" onClick={handleSaveDataField}>
                    <CheckOutlined />
                  </span>
                )}
                <span
                  className="b-button"
                  onClick={() => {
                    // @ts-ignore
                    dataField.editData['pkey'] = false;
                    dataField.editData = null;
                  }}
                >
                  <CloseOutlined />
                </span>
              </div>
            );
          } else {
            return (
              <div className={styles.configEdit}>
                <span className="g-button" onClick={() => (dataField.editData = record)}>
                  <EditOutlined />
                </span>
                <Popconfirm
                  title={t('common.text.delete_confirmation')}
                  onConfirm={deleteCurDataField(record.fieldId)}
                >
                  <span className="g-button">
                    <DeleteOutlined />
                  </span>
                </Popconfirm>
              </div>
            );
          }
        },
      },
    ];

    // @ts-ignore
    let dataSource: any[] = [].concat(dataField.list);
    if (dataField.editData && dataField.isNew) {
      dataSource.push(dataField.editData);
    }

    return (
      <div className={styles.fieldList}>
        <Row justify="end" gutter={[10, 20]}>
          <Col>
            <Input
              value={queryCode}
              prefix={<SearchOutlined />}
              placeholder={t('datasource.kafka_schema.search.placeholder')}
              onChange={(e) => setQueryCode(e.target.value)}
              onPressEnter={(e) => {
                if (schemaRegistry?.registryId && credentialId) {
                  getDataFields();
                }
              }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!schemaRegistry}
              onClick={handleAddDataField}
            >
              {t('datasource.kafka_schema.button.add')}
            </Button>
          </Col>
        </Row>

        <div className={styles.listNode} ref={fieldsRef}>
          <Table
            columns={columns}
            pagination={false}
            dataSource={dataSource}
            loading={fetchSchemaFieldsRequest.loading}
            scroll={{
              y: fieldsSizeRef?.height ?  fieldsSizeRef?.height - 60 : 100
            }}
          />
        </div>
      </div>
    );
  };

  const getPreviewNode = () => {
    return <DataPreview schemaRegistry={schemaRegistry} />;
  };

  const getRightNode = () => {
    return (
      <div className={styles.right}>
        <div className={cls(styles.bgInner, styles.preview)}>
          <div className={styles.top}>{getFieldList()}</div>
          <div className={styles.bottom}>{getPreviewNode()}</div>
        </div>
      </div>
    );
  };

  const getSQLQueryNode = () => {
    return <SQLQuery />;
  };

  const getKafkaTableModal = () => {
    return (
      // @ts-ignore
      <KafkaTableModal
        dataSource={credentialDetail}
        onSuccess={(resData) => {
          kafkaModal.hide();
          setSchemaRegistry(resData);
          dataField.list = _.map(resData.schemaFields, (item) => getFieldItem(item));
        }}
      />
    );
  };

  if (i18nLoading) {
    return <PageLoading />;
  }

  return (
    <div className={styles.detailPage}>
      <PageHeader dataSource={credentialDetail} pageType={undefined} onTabChange={undefined} />

      <div className={styles.content}>
        {getLeftNode()}
        {getRightNode()}
        {getKafkaTableModal()}
      </div>
    </div>
  );
};

export default Page;
