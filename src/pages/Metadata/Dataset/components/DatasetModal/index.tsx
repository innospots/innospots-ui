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

import React, { useRef, useState, useEffect, useMemo } from 'react';

import { useModel } from 'umi';
import _ from 'lodash';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { format } from 'sql-formatter';

import {
  Row,
  Col,
  Tabs,
  Cascader,
  Form,
  Tree,
  Space,
  Empty,
  Input,
  Table,
  Select,
  Button,
  message,
  Dropdown,
  Popconfirm,
} from 'antd';
import {
  UpOutlined,
  PlusOutlined,
  DownOutlined,
  EditOutlined,
  TableOutlined,
  SearchOutlined,
  DeleteOutlined,
  DollarOutlined,
  FileDoneOutlined,
  CaretRightOutlined,
  NumberOutlined,
  CalendarOutlined,
  FieldStringOutlined,
} from '@ant-design/icons';

import { useReactive, useMemoizedFn, useDebounceFn, useUpdateEffect } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import { fetchSchemaRegistryTopics } from '@/services/DataSource';

import NiceModal, { NiceModalProps } from '@/components/Nice/NiceModal';
import VariableModal, { MODAL_NAME as VARIABLE_MODAL_NAME } from '../VariableModal';

import styles from './style.less';

type Props = {} & NiceModalProps;

const { TabPane } = Tabs;

const numberList = [20, 50, 100];
const TYPE_ICONS = {
  DATE: <CalendarOutlined />,
  LONG: <NumberOutlined />,
  DOUBLE: <NumberOutlined />,
  NUMERIC: <NumberOutlined />,
  INTEGER: <NumberOutlined />,
  CURRENCY: <DollarOutlined />,
  STRING: <FieldStringOutlined />,
};

let createTimer, changeTimer;

const codeMirror = require('codemirror/lib/codemirror');

require('codemirror/mode/sql/sql');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/sql-hint');

const FIELD_OPTIONS = [
  {
    value: 'STRING',
    label: '字符',
  },
  {
    value: 'INTEGER',
    label: '数值',
  },
  {
    value: 'DATE',
    label: '日期',
  },
  {
    value: 'CATEGORY',
    label: '分类',
    children: [
      {
        value: 'COUNTRY',
        label: '国家',
      },
      {
        value: 'PROVINCE',
        label: '省份',
      },
      {
        value: 'CITY',
        label: '城市',
      },
      {
        value: 'DISTRICT',
        label: '区县',
      },
    ],
  },
];

export const MODAL_NAME = 'DatasetModal';

const DatasetModal: React.FC<Props> = ({}) => {
  const editorRef = useRef<{
    doc: any,
    on: (type: string, handler: (any) => void) => void,
    off: (type: string, handler: (any) => void) => void,
    toTextArea: () => void,
  }>(null);
  const modalBody = useRef(null);
  const [formRes] = Form.useForm();
  const [queryCode, setQueryCode] = useState('');
  const [dataCollapsed, setDataCollapsed] = useState(false);
  const formStatus = useReactive<{
    name: any;
    category: any;
  }>({
    name: undefined,
    category: undefined,
  });
  const dataSet = useReactive({
    list: [],
  });
  const variableData = useReactive<{
    type: string;
    list: any[];
    data: any;
    visible: boolean;
  }>({
    type: 'create',
    list: [],
    data: null,
    visible: false,
  });
  const dataPreview = useReactive<{
    time: number;
    columns: any[];
    dataSource: any[];
    pageBody: {
      pagination: {
        total: number;
      }
    };
    isExecute: boolean;
  }>({
    time: 0,
    columns: [],
    dataSource: [],
    pageBody: {
      pagination: {
        total: 0
      }
    },
    isExecute: false,
  });
  const dataViewValues = useReactive({
    sql: '',
    model: {},
    credentialId: -1,
    pageSize: numberList[0],
  });

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const [variableModal] = useModal(VARIABLE_MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;
  const previewDataCount = dataPreview.pageBody?.pagination?.total || 0;

  const { categories, selectedCategoryId, saveDatasetRequest, datasetExecuteRequest } =
    useModel('Dataset');

  const { credentials, fetchSchemaFieldsRequest } = useModel('Credential', (model) => ({
    credentials: model.credentials,
    fetchSchemaFieldsRequest: model.fetchSchemaFieldsRequest,
  }));

  const schemaRegistryTopicsRequest = useRequest(fetchSchemaRegistryTopics, {
    manual: true,
    debounceWait: 300,
  });

  const { t } = useI18n(['dataset', 'common']);
  const isUpdate = modalType === 'edit' && initValues;

  const filterCredentials = useMemo(() => {
    return _.map(_.filter(credentials, item => item.connectType === 'JDBC'), item => ({
      label: item.name,
      value: item.credentialId,
    }))
  }, [ credentials ])

  useEffect(() => {
    if (visible) {
      setInitValues();
    }
  }, [visible, isUpdate]);

  useEffect(() => {
    if (!visible) {
      setQueryCode('');
      destroySQLEditor();
      dataViewValues.model = {};
    }
  }, [visible]);

  useUpdateEffect(() => {
    if (dataViewValues.credentialId !== -1) {
      const params: {
        queryCode?: string;
      } = {};

      if (queryCode) {
        params.queryCode = queryCode;
      }

      fetchTopics(dataViewValues.credentialId, params);
    }
  }, [dataViewValues.credentialId, queryCode]);

  const setInitValues = () => {
    dataPreview.time = 0;
    dataPreview.columns = [];
    dataPreview.dataSource = [];
    dataPreview.pageBody.pagination = {
      total: 0,
    };
    dataPreview.isExecute = false;

    if (isUpdate) {
      formRes.setFieldsValue(initValues);
      dataViewValues.sql = initValues.script;
      dataViewValues.credentialId = initValues.credentialId;
      variableData.list = initValues.variables || [];
      try {
        dataViewValues.model = JSON.parse(initValues.model);
      } catch (e) {}
    } else {
      dataViewValues.sql = '';
      dataViewValues.model = {};
      dataViewValues.credentialId = -1;

      formRes.setFieldsValue({
        categoryId: selectedCategoryId,
      });
    }

    dataViewValues.pageSize = numberList[0];

    createCodeEditor(dataViewValues.sql);
  };

  const createCodeEditor = (value) => {
    const _create = () => {
      const queryTextarea = document.querySelector('#curCodeEditor');

      if (!queryTextarea) return;

      // @ts-ignore
      queryTextarea.style.display = '';
      // @ts-ignore
      editorRef.current = codeMirror.fromTextArea(queryTextarea, {
        mode: 'text/x-mysql',
        theme: 'eclipse',
        width: '100%',
        height: '100%',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        extraKeys: {
          Ctrl: 'autocomplete',
        },
      });

      if (editorRef.current) {
        editorRef.current.on('change', handleSQLChange);
        editorRef.current.on('keypress', handleEditorChange);
      }

      if (value) {
        // @ts-ignore
        editorRef.current.doc.setValue(value);
      }
    };

    if (editorRef.current) {
      editorRef.current.doc.setValue(value);
    } else {
      if (createTimer) {
        clearTimeout(createTimer);
        createTimer = null;
      }

      createTimer = setTimeout(_create, 500);
    }
  };

  const destroySQLEditor = () => {
    if (editorRef.current) {
      editorRef.current.off('change', handleSQLChange);
      editorRef.current.off('keypress', handleEditorChange);
      editorRef.current.toTextArea();
      // @ts-ignore
      editorRef.current = null;
      const queryTextarea = document.querySelector('#curCodeEditor');
      // @ts-ignore
      queryTextarea.style.display = 'none';
    }
  };

  const handleEditorChange = (editor) => {
    if (changeTimer) {
      clearTimeout(changeTimer);
      changeTimer = null;
    }

    changeTimer = setTimeout(() => {
      editor.showHint();
    }, 200);
  };

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      if (_.isUndefined(values.name) || _.isNull(values.name) || !values.name) {
        formStatus.name = 'error';
      } else {
        formStatus.name = undefined;
      }
      if (_.isUndefined(values.categoryId)) {
        formStatus.category = 'error';
      } else {
        formStatus.category = undefined;
      }

      if (_.isUndefined(formStatus.name) && _.isUndefined(formStatus.category)) {
        let postData: {
          code?: string;
          name?: string;
          type?: string;
        } = {};

        if (isUpdate) {
          postData = {
            ...initValues,
          };
        }

        postData = {
          ...postData,
          ...values,
          script: editorRef.current?.doc.getValue(),
          variables: variableData.list,
          credentialId: dataViewValues.credentialId,
          model: JSON.stringify(dataViewValues.model),
        };

        if (!postData.code) {
          postData.code = postData.name;
        }

        if (!postData.type) {
          postData.type = 'VIEW';
        }

        saveDataViewData(postData);
      }
    });
  };

  const fetchTopics = async (credentialId: number, params: any) => {
    try {
      dataSet.list = [];
      const result = await schemaRegistryTopicsRequest.runAsync(credentialId, params);
      // @ts-ignore
      dataSet.list = result;
    } catch (e) {}
  };

  const saveDataViewData = async (values: any) => {
    try {
      const result = await saveDatasetRequest.runAsync(values, modalType);
      if (result) {
        message.success(t('common.error_message.save.success'));
        modal.hide();
      }
    } catch (e) {}
  };

  const { run: updateQueryCode } = useDebounceFn(
    (event) => {
      setQueryCode(event.target.value);
    },
    {
      wait: 500,
    },
  );

  const handleDataSourceChange = useMemoizedFn((credentialId: number) => {
    dataViewValues.credentialId = credentialId;
  });

  const handleTreeSelect = useMemoizedFn(
    (selectedKeys, { selected, selectedNodes, node, event }) => {},
  );

  const handleLoadData = ({ code, children }: any) =>
    new Promise<void>(async (resolve) => {
      if (children) {
        resolve();
        return;
      }
      const list = await fetchSchemaFieldsRequest.runAsync({
        tableName: code,
        credentialId: dataViewValues.credentialId,
      });
      const curItem = _.find(dataSet.list, (item: any) => item.code === code);

      if (curItem) {
        curItem.children = _.map(list, (item: any) => ({
          ...item,
          icon: () => TYPE_ICONS[item.valueType],
          isLeaf: true,
        }));
      }

      dataSet.list = [...dataSet.list];

      resolve();
    });

  const handleSQLFormat = () => {
    if (editorRef.current) {
      const formatSql = format(editorRef.current.doc.getValue());
      editorRef.current.doc.setValue(formatSql);
    }
  };

  const handleDataPreview = async () => {
    if (dataViewValues.credentialId) {
      let time = +new Date();
      const listData = await datasetExecuteRequest.runAsync({
        script: dataViewValues.sql
      }, {
        page: 1,
        size: dataViewValues.pageSize,
        credentialId: dataViewValues.credentialId,
      });

      dataPreview.isExecute = true;

      if (listData) {
        const model = {};

        dataPreview.time = +new Date() - time;
        dataPreview.pageBody = listData.pageBody;
        dataPreview.columns = _.map(listData.columns, (item: any) => {
          const title = item.name;

          model[title] = {
            type: item.type || 'STRING',
            category: item.category || 'UNCATEGORIZED',
          };

          return {
            title,
            width: 150,
            ellipsis: true,
            dataIndex: title,
            render: (value) => (<span className={styles.field}>{ value }</span>)
          };
        });
        dataPreview.dataSource = _.map(listData.rows, (dataList: any[]) => {
          const data = {};
          _.map(dataPreview.columns, (col: any, index) => {
            const value = (data[col.dataIndex] = dataList[index]);
            // const valWidth = getTextWidth(value);
            // const colWidth = getTextWidth(col.title);
            // col.width = Math.max(valWidth, colWidth);
          });

          return data;
        });

        dataViewValues.model = model;
      }
    }
  };

  const handleEditorDidMount = (editor: any) => {
    // editRef.current = editor;
  };

  const handleSQLChange = _.debounce((editor: any) => {
    dataViewValues.sql = editor.doc.getValue();
  }, 200);

  const handleVariableSuccess = useMemoizedFn((type, values) => {
    if (type === 'add') {
      // @ts-ignore
      variableData.list.push(values);
    } else {
      const index = _.findIndex(variableData.list, (item: any) => item.id === values.id);
      if (index > -1) {
        // @ts-ignore
        variableData.list[index] = values;
      }
    }
    variableData.visible = false;
  });

  const showVariableModal = (type, initData) => () => {
    variableModal.show({
      modalType: type,
      initValues: initData,
    });
  };

  const removeCurVariable = (id: string) => () => {
    // @ts-ignore
    variableData.list = _.filter(variableData.list, (item: any) => item.id !== id);
  };

  const renderBaseForm = () => {
    return (
      <div className={styles.baseForm}>
        <Form form={formRes} preserve={false} layout="inline">
          <Row className={styles.formRow} gutter={[48, 0]}>
            <Col>
              <Form.Item
                required
                name="name"
                label={t('dataset.form.input.name.label')}
                validateStatus={formStatus.name}
              >
                <Input
                  className={styles.formItem}
                  placeholder={t('dataset.form.input.name.placeholder')}
                  onChange={(e) => {
                    if (_.isUndefined(e.target.value) || !e.target.value) {
                      formStatus.name = 'error';
                    } else {
                      formStatus.name = undefined;
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                required
                name="categoryId"
                label={t('dataset.form.input.category.label')}
                validateStatus={formStatus.category}
              >
                <Select
                  placeholder={t('dataset.form.input.category.placeholder')}
                  options={_.map(categories, (item) => ({
                    value: item.categoryId,
                    label: item.categoryName,
                  }))}
                  className={styles.formItem}
                  onChange={(e) => {
                    if (_.isUndefined(e)) {
                      formStatus.category = 'error';
                    } else {
                      formStatus.category = undefined;
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const renderLeftContent = () => {
    let treeData = dataSet.list;

    // if (queryCode) {
    //     // @ts-ignore
    //     treeData = _.filter(treeData, (item: any) => item.code.indexOf(queryCode) > -1)
    // }

    const datasourceValue =
      dataViewValues.credentialId === -1 ? undefined : dataViewValues.credentialId;

    return (
      <div className={styles.leftContent}>
        <div className={styles.header}>
          <span>{t('dataset.form.select.datasource.label')}</span>
        </div>
        <div className={styles.filterForms}>
          <Select
            size="small"
            value={datasourceValue}
            options={filterCredentials}
            placeholder={t('dataset.form.select.datasource.placeholder')}
            style={{ width: '100%', marginBottom: 8 }}
            onChange={handleDataSourceChange}
          />
          <Input
            size="small"
            prefix={<SearchOutlined />}
            placeholder={t('dataset.form.search.placeholder')}
            onChange={updateQueryCode}
          />
        </div>
        <div className={styles.treeList}>
          {treeData?.length && dataViewValues.credentialId !== -1 ? (
            <Tree
              showIcon
              treeData={treeData}
              icon={<TableOutlined />}
              fieldNames={{
                key: 'code',
                title: 'name',
              }}
              loadData={handleLoadData}
              onSelect={handleTreeSelect}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>
    );
  };

  const renderConfigEditor = () => {
    const runDisabled =
      !dataViewValues.credentialId || dataViewValues.credentialId < 0 || !dataViewValues.sql;

    return (
      <div className={styles.configEditor}>
        <div className={styles.header}>
          <div>
            <Space size={16}>
              <Button
                size="small"
                type="primary"
                icon={<CaretRightOutlined />}
                disabled={runDisabled}
                loading={datasetExecuteRequest.loading}
                onClick={handleDataPreview}
              >
                {t('dataset.form.button.run')}
              </Button>
              <Button
                size="small"
                type="text"
                icon={<FileDoneOutlined />}
                onClick={handleSQLFormat}
              >
                {t('dataset.form.button.format')}
              </Button>
            </Space>
          </div>
          <div>
            <Row>
              <Col style={{ lineHeight: '28px' }}>{t('dataset.form.select.pagesize.label')}：</Col>
              <Col>
                <Select
                  size="small"
                  placeholder={t('common.select.placeholder')}
                  style={{ width: 90 }}
                  value={dataViewValues.pageSize}
                  options={numberList.map((n) => ({
                    value: n,
                    label: t('common.data.items', {
                      count: n,
                    }),
                  }))}
                  onChange={(pageSize: number) => (dataViewValues.pageSize = pageSize)}
                />
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.editor}>
          {/*<MonacoEditor*/}
          {/*    theme="dqlTheme"*/}
          {/*    language="dql"*/}
          {/*    options={{*/}
          {/*        lineDecorationsWidth: 1,*/}
          {/*        selectOnLineNumbers: true*/}
          {/*    }}*/}
          {/*    value={dataViewValues.sql}*/}
          {/*    onChange={handleSQLChange}*/}
          {/*    editorWillMount={handleEditorWillMount}*/}
          {/*    editorDidMount={handleEditorDidMount}*/}
          {/*/>*/}
          <textarea
            style={{ display: 'none' }}
            id="curCodeEditor"
            placeholder={t('common.input.placeholder')}
          />
        </div>
      </div>
    );
  };

  const renderOtherConfig = () => {
    return (
      <div className={styles.otherConfig}>
        <Tabs
          defaultActiveKey="1"
          tabBarExtraContent={
            <span className="g-button" onClick={showVariableModal('add', null)}>
              <PlusOutlined />
            </span>
          }
        >
          <TabPane key="1" tab={t('dataset.form.variables')}>
            {variableData.list.length ? (
              <ul className={styles.variableList}>
                {variableData.list.map((item: any) => (
                  <li key={item.id} className={styles.listItem}>
                    <span>{item.name}</span>
                    <Space>
                      <span className="g-button" onClick={showVariableModal('edit', item)}>
                        <EditOutlined />
                      </span>
                      <Popconfirm
                        title={t('common.text.delete_confirmation')}
                        onConfirm={removeCurVariable(item.id)}
                      >
                        <span className="g-button">
                          <DeleteOutlined />
                        </span>
                      </Popconfirm>
                    </Space>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const renderConfigContent = () => {
    return (
      <div className={styles.configContent}>
        {renderConfigEditor()}
        {renderOtherConfig()}
      </div>
    );
  };

  const renderDataPreview = () => {
    const model = dataViewValues.model;
    const columns = _.map(dataPreview.columns, (col: any) => {
      const curModel = model?.[col.title];
      return {
        ...col,
        title: (
          <div className={styles.colTitle}>
            <span className={styles.title}>{col.title}</span>
            <Cascader
              size="small"
              options={FIELD_OPTIONS}
              expandTrigger="hover"
              popupClassName={styles.popupClassName}
              onChange={(s) => {
                try {
                  let type = s[s.length - 1];
                  type = ['COUNTRY', 'PROVINCE', 'CITY', 'DISTRICT'].includes(type as string) ? 'STRING' : type;
                  dataViewValues.model[col.title].type = type;
                } catch (e) {}
              }}
              getPopupContainer={() => modalBody.current as any}
            >
              <span className={styles.type}>
                <span className="g-button">{TYPE_ICONS[curModel?.type]}</span>
              </span>
            </Cascader>
          </div>
        ),
      };
    });

    return (
      <div
        className={cls(styles.preview, {
          [styles.showFooter]: previewDataCount > 0,
        })}
      >
        <div className={styles.header}>
          <Dropdown overlay={<></>}>
            <span className={styles.previewLabel} onClick={() => setDataCollapsed(!dataCollapsed)}>
              {t('dataset.form.preview')} {dataCollapsed ? <UpOutlined /> : <DownOutlined />}
            </span>
          </Dropdown>
        </div>
        <div className={styles.previewData}>
          <Table
            size="small"
            columns={columns}
            scroll={{ y: 198 - (previewDataCount > 0 ? 28 : 0) }}
            pagination={false}
            dataSource={dataPreview.dataSource}
            loading={datasetExecuteRequest.loading}
          />
        </div>
        <div className={styles.footer}>
          <span>{t('dataset.form.result', { data: previewDataCount || '-' })}</span>
          <span>{t('dataset.form.execute.time', { data: dataPreview.time || '-' })}</span>
        </div>
      </div>
    );
  };

  const renderRightContent = () => {
    return (
      <div className={cls(styles.rightContent, {
        [styles.previewCollapsed]: dataCollapsed
      })}>
        {renderConfigContent()}
        {renderDataPreview()}
      </div>
    );
  };

  const renderMainContent = () => {
    return (
      <div className={styles.mainContent}>
        {renderLeftContent()}
        {renderRightContent()}
      </div>
    );
  };

  const renderVariableModal = () => {
    return <VariableModal onSuccess={handleVariableSuccess} />;
  };

  return (
    <NiceModal
      width={1120}
      destroyOnClose
      title={t(`dataset.form.${modalType}.title`)}
      okButtonProps={{
        loading: saveDatasetRequest.loading,
        disabled: !dataPreview.isExecute,
        onClick: handleFormSubmit,
      }}
      visible={visible}
      style={{ top: 20 }}
      onCancel={modal.hide}
    >
      <div className={styles.modalBody} ref={modalBody}>
        {renderBaseForm()}
        {renderMainContent()}
        {renderVariableModal()}
      </div>
    </NiceModal>
  );
};

export default DatasetModal;
