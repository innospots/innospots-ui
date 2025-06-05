import React, { useEffect, useMemo, useState } from 'react';

import {
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useReactive, useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Menu,
  message,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
  Typography,
} from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { useModel } from 'umi';

import { fetchWorkflowInstance, fetchWorkflows } from '@/services/Workflow';

import useI18n from '@/common/hooks/useI18n';
import { KeyValues } from '@/common/types/Types';
import { randomString } from '@/common/utils';
import { ExpressionInput } from '@/components/Expression';

import useModal from '@/common/hooks/useModal';
import NiceModal, { NiceModalProps } from '@/components/Nice/NiceModal';

import styles from './style.less';

const { Text } = Typography;
export const MODAL_NAME = 'WorkflowDataModal';

const METHOD_OPTIONS = [
  {
    value: 'GET',
    label: 'GET',
  },
  {
    value: 'POST',
    label: 'POST',
  },
];

type ConfigData = {
  key?: string;
  code?: string;
  name?: string;
  value?: string;
  valueType?: string;
  httpFieldType?: string;
  httpFieldParamType?: string;
};

type ConfigDataTypes = {
  pathVariable?: ConfigData[];
  bindParam?: ConfigData[];
  requestParam?: ConfigData[];
  requestHeader?: ConfigData[];
  requestBody?: ConfigData[];
};

const getDefaultField = (o?: ConfigData): ConfigData => ({
  key: randomString(4),
  name: '',
  code: '',
  valueType: 'STRING',
  ...o,
});

const DEFAULT_DATA = {
  formStatus: {
    name: undefined,
    description: undefined,
    apiUrlAddress: undefined,
  },

  responseData: {
    body: {},
    header: '',
    testResult: false,
  },

  configData: {
    pathVariable: [],
    bindParam: [],
    requestParam: [],
    requestHeader: [],
    requestBody: [],
  },

  formValues: {
    username: '',
    password: '',
    bearerToken: '',
    authType: 'NO_AUTH',
    apiMethod: 'POST',
    apiUrlAddress: '',
  },
};

const REQUEST_LEFT_TABS = [
  {
    key: 'query_params',
    label: '请求参数',
  },
  {
    key: 'headers',
    label: '请求头',
  },
  {
    key: 'body',
    label: '请求体',
  },
  {
    key: 'post_script',
    label: '后置脚本',
  },
  {
    key: 'config',
    label: '设置',
  },
];

const REQUEST_RIGHT_TABS = [
  {
    key: 'bind_params',
    label: '绑定参数',
  },
];

const RESPONSE_TABS = [
  {
    key: 'content',
    label: '响应内容',
  },
  {
    key: 'json',
    label: 'JSON结构',
  },
  {
    key: 'message',
    label: '原始报文',
  },
  {
    key: 'header',
    label: '响应头',
  },
  {
    key: 'log',
    label: '执行日志',
  },
];

const WorkflowDataModal: React.FC<
  NiceModalProps & {
    onSubmit: (type: string, data: KeyValues) => void;
  }
> = ({ onSubmit }) => {
  const { t, loading: i18nLoading } = useI18n(['httpapi', 'common']);
  const requestTabKeys = useReactive({
    left: REQUEST_LEFT_TABS[0].key,
    right: REQUEST_RIGHT_TABS[0].key,
  });
  const [workflowState, setWorkflowState] = useState<KeyValues>({
    params: {},
    selectedRowKeys: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [schemaFields, setSchemaFields] = useState();
  const [schemaRegistry, setSchemaRegistry] = useState<KeyValues>();
  const [workflowPageData, setWorkflowPageData] = useState<KeyValues>({});
  const { testExecuteRequest } = useModel('HttpApi');

  const [baseForm] = Form.useForm();
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;

  const formValues = useReactive<{
    username?: string;
    password?: string;
    authType?: string;
    apiMethod?: string;
    bearerToken?: string;
    apiUrlAddress?: string;
  }>({
    ...DEFAULT_DATA.formValues,
  });
  const formStatus = useReactive<{
    name: any;
    description: any;
    apiUrlAddress: any;
  }>({
    ...DEFAULT_DATA.formStatus,
  });
  const configData = useReactive<ConfigDataTypes>({
    ...DEFAULT_DATA.configData,
  });

  const workflowsRequest = useRequest(fetchWorkflows, {
    manual: true,
    onSuccess: (result: any) => {
      setWorkflowPageData(result || {});
      if (result?.list?.length) {
        workflowState.selectedRowKeys = [result.list[0].flowKey];
        setWorkflowState({
          ...workflowState,
        });
      }
    },
  });
  const workflowInstanceRequest = useRequest(fetchWorkflowInstance, {
    manual: true,
    onSuccess: (result: any) => {
      setSchemaRegistry(result || {});
      if (result) {
        setSchemaFields(result.schemaFields);
      }
    },
  });

  const getWorkflows = async (params = workflowState.params) => {
    const postData = {
      ...params,
      primitive: 'trigger',
      dataStatus: 'ONLINE',
    };

    workflowsRequest.runAsync(initValues.workflowType, postData);
  };

  useEffect(() => {
    if (visible) {
      getWorkflows(workflowState.params);
    } else {
      setCurrentStep(0);
    }
  }, [visible, workflowState.params]);

  const handleSubmit = () => {
    if (workflowState.selectedRowKeys.length) {
      const selectedKey = workflowState.selectedRowKeys[0];
      const workflowInsItem = _.find(
        workflowPageData.list,
        (item) => item.flowKey === selectedKey,
      );
      if (currentStep === 0) {
        setCurrentStep(1);
        workflowInstanceRequest.run(
          initValues.workflowType,
          workflowInsItem.workflowInstanceId,
        );
      } else {
        if (workflowInsItem) {
          const regData = { ...schemaRegistry } || {};
          onSubmit(modalType, regData);
          /*
          onSubmit(modalType, {
            name: workflowInsItem.name,
            code: workflowInsItem.flowKey,
            categoryId: workflowInsItem.categoryId,
            registryId: workflowInsItem.workflowInstanceId + '',
            registryType: 'WORKFLOW',
          });
           */
        }
      }
    }
  };

  const handleCancel = () => {
    if (currentStep === 0) {
      modal.hide();
    } else {
      setCurrentStep(0);
    }
  };

  const handleWorkflowSearch = (value) => {
    workflowState.params = {
      queryInput: value,
    };
    setWorkflowState({
      ...workflowState,
    });
  };

  const getFieldByType = (type: string, defaultData?: ConfigData) => {
    let httpFieldParamType = '';

    if (type === 'pathVariable') {
      httpFieldParamType = 'PATH_VARIABLE';
    } else if (type === 'requestParam') {
      httpFieldParamType = 'REQUEST_PARAM';
    } else if (type === 'bindParam') {
      httpFieldParamType = 'BIND_REQUEST_PARAM';
    } else if (type === 'requestHeader') {
      httpFieldParamType = 'REQUEST_HEADER';
    }

    return getDefaultField({
      name: '',
      value: '',
      valueType: 'STRING',
      httpFieldType: 'REQUEST',
      httpFieldParamType,
      ...defaultData,
    });
  };

  const matchPathParams = _.debounce((url = '') => {
    const matches = url.match(/\{\w+\}/g);
    if (matches && matches.length) {
      const list: any[] = [];
      const curPathVariable = configData.pathVariable;
      _.map(matches, (code) => {
        const c = code.replace(/\{|\}/g, '');
        const cur = _.find(curPathVariable, (item) => item.code === c);

        if (!cur) {
          const data = getFieldByType('pathVariable', {
            code: c,
          });
          list.push(data);
        } else {
          list.push(cur);
        }
      });

      configData.pathVariable = list;
    } else {
      configData.pathVariable = [];
    }
  }, 500);

  const changeListItem =
    (field: string, type: string, index: number) => (event) => {
      if (configData[type]) {
        configData[type][index] ??= {};
        configData[type][index][field] = event.target.value;
        configData[type] = [...configData[type]];
      }
    };

  const deleteListItem = (type: string, index: number) => () => {
    if (configData[type]?.length) {
      //httpFieldDeleteIds
      const record: {
        fieldId: number;
      } = configData[type][index] || {};
      if (record.fieldId) {
        // @ts-ignore
        delRef.current.push(record.fieldId);
      }

      configData[type].splice(index, 1);
      configData[type] = [...configData[type]];
    }
  };

  const addListItem = (type: string) => () => {
    if (configData[type]) {
      configData[type].push(getFieldByType(type));
      configData[type] = [...configData[type]];
    }
  };

  /**
   * 请求参数
   */
  const renderRequestParams = () => {
    const { pathVariable, requestParam } = configData;
    const getTypeAndIndex = (record, index): [string, number] => {
      const listType = record.from === 'path' ? 'pathVariable' : 'requestParam';
      if (listType === 'requestParam') {
        index -= pathVariable?.length || 0;
      }

      return [listType, index];
    };

    const columns: TableColumnsType<KeyValues> = [
      {
        title: t('httpapi.form.params.column.key'),
        dataIndex: 'code',
        render: (code: string, record: any, index: number) => (
          <Input
            size="small"
            value={code}
            readOnly={record.from === 'path'}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('code', ...getTypeAndIndex(record, index))}
          />
        ),
      },
      {
        title: '字段值',
        dataIndex: 'value',
        render: (value, record: any, index: number) => (
          <ExpressionInput size="small" />
        ),
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('requestParam')}>
            <PlusOutlined /> {t('httpapi.form.params.link.add')}
          </span>
        ),
        width: 80,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            title={t('common.text.delete_confirmation')}
            onConfirm={deleteListItem(...getTypeAndIndex(record, index))}
            okText={t('common.button.confirm')}
            cancelText={t('common.button.cancel')}
          >
            <span
              className={cls('g-button', {
                disabled: record.from === 'path',
              })}
            >
              <MinusCircleOutlined />
            </span>
          </Popconfirm>
        ),
      },
    ];

    const dataSource = _.map(pathVariable, (item: ConfigData) => ({
      ...item,
      from: 'path',
    })).concat(requestParam as []);

    return (
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{
          y: 320,
        }}
      />
    );
  };

  /**
   * 绑定参数
   */
  const renderBindParams = () => {
    const { bindParam } = configData;
    const columns: TableColumnsType<KeyValues> = [
      {
        title: t('httpapi.form.params.column.key'),
        dataIndex: 'code',
        render: (code: string, record: any, index: number) => (
          <Input
            size="small"
            value={code}
            placeholder={t('common.input.placeholder')}
            onChange={changeListItem('code', 'bindParam', index)}
          />
        ),
      },
      {
        title: '默认值',
        dataIndex: 'value',
        render: (value, record: any, index: number) => (
          <ExpressionInput size="small" />
        ),
      },
      {
        title: () => (
          <span className="b-button" onClick={addListItem('bindParam')}>
            {t('httpapi.form.params.link.add')}
          </span>
        ),
        width: 50,
        align: 'center',
        dataIndex: 'key',
        render: (key, record: any, index: number) => (
          <Popconfirm
            title={t('common.text.delete_confirmation')}
            onConfirm={deleteListItem('bindParam', index)}
            okText={t('common.button.confirm')}
            cancelText={t('common.button.cancel')}
          >
            <span className="g-button">
              <MinusCircleOutlined />
            </span>
          </Popconfirm>
        ),
      },
    ];

    return (
      <Table
        size="small"
        columns={columns}
        dataSource={bindParam}
        pagination={false}
        scroll={{
          y: 320,
        }}
      />
    );
  };

  const renderAuthConfig = () => {
    return (
      <Form layout="vertical">
        <Form.Item required name="type" label="鉴权类型">
          <Select placeholder="请选择鉴权类型" />
        </Form.Item>
        <Form.Item required name="auth" label="凭据">
          <Select placeholder="请选择凭据" />
        </Form.Item>
      </Form>
    );
  };

  const handleMethodChange = (event) => {
    formValues.apiMethod = event.key;
  };

  const handleUrlChange = (event) => {
    formValues.apiUrlAddress = event.target.value;
    matchPathParams(formValues.apiUrlAddress);
  };

  const validateBaseForm = (callback) => {
    baseForm.validateFields().then((values) => {
      if (!values.name) {
        formStatus.name = 'error';
        message.error(t('httpapi.form.input.name.error_message'));
        return;
      } else {
        formStatus.name = undefined;
      }
      if (!values.description) {
        formStatus.description = 'error';
        message.error(t('httpapi.form.input.desc.error_message'));
        return;
      } else {
        formStatus.description = undefined;
      }

      if (values.name && values.description) {
        callback(values);
      }
    });
  };

  const handleTestExecute = () => {
    validateBaseForm((values) => {
      if (!formValues.apiUrlAddress) {
        formStatus.apiUrlAddress = 'error';
      } else {
        formStatus.apiUrlAddress = undefined;
        // doExecute(values);
      }
    });
  };

  const renderBaseForm = () => {
    return (
      <div className={styles.baseForm}>
        <Form form={baseForm} layout="inline">
          <Form.Item required name="name" label="数据视图名称">
            <Input placeholder="请输入数据视图名称" style={{ width: 400 }} />
          </Form.Item>
        </Form>
      </div>
    );
  };

  const renderTestForm = () => {
    const menu = (
      <Menu
        selectedKeys={[formValues.apiMethod as string]}
        onClick={handleMethodChange}
      >
        {METHOD_OPTIONS.map((item) => (
          <Menu.Item key={item.value}>{item.label}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className={styles.testForm}>
        <Form.Item validateStatus={formStatus.apiUrlAddress}>
          <Input.Group compact>
            <Dropdown overlay={menu}>
              <Button color="cyan" variant="solid" style={{ width: 90 }}>
                {formValues.apiMethod} <DownOutlined />
              </Button>
            </Dropdown>
            <Input
              style={{ width: 894 }}
              value={formValues.apiUrlAddress}
              placeholder={t('common.input.placeholder')}
              onChange={handleUrlChange}
            />
            <Button
              type="primary"
              style={{ width: 90 }}
              loading={testExecuteRequest.loading}
              onClick={handleTestExecute}
            >
              {t('httpapi.form.button.send')}
            </Button>
          </Input.Group>
        </Form.Item>
      </div>
    );
  };

  const handleTabChange = (type: string) => (activeKey: string) => {
    requestTabKeys[type] = activeKey;
  };

  const renderRequestForms = (type) => {
    return (
      <Tabs
        size="small"
        activeKey={requestTabKeys[type]}
        items={_.map(
          type === 'left' ? REQUEST_LEFT_TABS : REQUEST_RIGHT_TABS,
          ({ key, label }) => {
            let children;

            if (key === 'query_params') {
              children = renderRequestParams();
            } else if (key === 'bind_params') {
              children = renderBindParams();
            } else if (key === 'auth_config') {
              children = renderAuthConfig();
            }

            return {
              key,
              label,
              children: <div className={styles.requestContent}>{children}</div>,
            };
          },
        )}
        onChange={handleTabChange(type)}
      />
    );
  };

  const renderRequestBox = () => {
    return (
      <div className={styles.requestBox}>
        <div className={styles.leftConfig}>{renderRequestForms('left')}</div>
        <div className={styles.rightConfig}>{renderRequestForms('right')}</div>
      </div>
    );
  };

  const renderResponseContent = () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Age',
        dataIndex: 'age',
      },
      {
        title: 'Address',
        dataIndex: 'address',
      },
    ];
    const data = [
      {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
      },
      {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      },
    ];
    return (
      <div className={styles.responseContent}>
        <Alert
          type="error"
          description="Error Description Error Description Error Description Error Description"
        />
        <Table
          style={{ display: 'none' }}
          bordered
          columns={columns}
          dataSource={data}
          size="small"
          pagination={false}
          scroll={{ y: 152 }}
        />
      </div>
    );
  };

  const renderResponseHeader = () => {
    const columns = [
      {
        title: t('httpapi.form.response.key'),
        dataIndex: 'field',
      },
      {
        title: t('httpapi.form.response.value'),
        dataIndex: 'data',
      },
    ];

    return (
      <div className={styles.responseContent}>
        <Table
          size="small"
          columns={columns}
          pagination={false}
          scroll={{
            y: 152,
          }}
        />
      </div>
    );
  };

  const renderJSONContent = () => {
    return (
      <div className={cls(styles.responseContent, styles.formatContent)}>
        {JSON.stringify(
          {
            code: 404,
            message:
              'The requested webhook "GET low-code-li1st" is not registered.',
            hint: "The workflow must be active for a production URL to run successfully. You can activate the workflow using the toggle in the top-right of the editor. Note that unlike test URL calls, production URL calls aren't shown on the canvas (only in the executions list)",
            stack:
              'ResponseError: The requested webhook "GET low-code-li1st" is not registered.\n    at ActiveWorkflowRunner.executeWebhook (/usr/local/lib/node_modules/n8n/dist/src/ActiveWorkflowRunner.js:96:23)\n    at async /usr/local/lib/node_modules/n8n/dist/src/WebhookServer.js:47:24',
          },
          null,
          '\t',
        )}
      </div>
    );
  };

  const renderMessageContent = () => {
    return (
      <div className={cls(styles.responseContent, styles.formatContent)}>
        {JSON.stringify(
          {
            code: 404,
            message:
              'The requested webhook "GET low-code-li1st" is not registered.',
            hint: "The workflow must be active for a production URL to run successfully. You can activate the workflow using the toggle in the top-right of the editor. Note that unlike test URL calls, production URL calls aren't shown on the canvas (only in the executions list)",
            stack:
              'ResponseError: The requested webhook "GET low-code-li1st" is not registered.\n    at ActiveWorkflowRunner.executeWebhook (/usr/local/lib/node_modules/n8n/dist/src/ActiveWorkflowRunner.js:96:23)\n    at async /usr/local/lib/node_modules/n8n/dist/src/WebhookServer.js:47:24',
          },
          null,
          '\t',
        )}
      </div>
    );
  };

  const renderLogContent = () => {
    return (
      <div className={cls(styles.responseContent, styles.formatContent)}>
        {JSON.stringify(
          {
            code: 404,
            message:
              'The requested webhook "GET low-code-li1st" is not registered.',
            hint: "The workflow must be active for a production URL to run successfully. You can activate the workflow using the toggle in the top-right of the editor. Note that unlike test URL calls, production URL calls aren't shown on the canvas (only in the executions list)",
            stack:
              'ResponseError: The requested webhook "GET low-code-li1st" is not registered.\n    at ActiveWorkflowRunner.executeWebhook (/usr/local/lib/node_modules/n8n/dist/src/ActiveWorkflowRunner.js:96:23)\n    at async /usr/local/lib/node_modules/n8n/dist/src/WebhookServer.js:47:24',
          },
          null,
          '\t',
        )}
      </div>
    );
  };

  const renderResponseStatus = () => {
    return (
      <Row gutter={24}>
        <Col>
          <Text>Status：</Text>
          <Text strong>Success</Text>
        </Col>
        <Col>
          <Text>Time：</Text>
          <Text strong>200 ms</Text>
        </Col>
        <Col>
          <Text>Size：</Text>
          <Text strong>1 MB</Text>
        </Col>
      </Row>
    );
  };

  const renderResponseBox = () => {
    return (
      <div className={styles.responseBox}>
        <Tabs
          tabBarExtraContent={renderResponseStatus()}
          items={_.map(RESPONSE_TABS, ({ key, label }) => {
            let children;

            if (key === 'content') {
              children = renderResponseContent();
            } else if (key === 'json') {
              children = renderJSONContent();
            } else if (key === 'message') {
              children = renderMessageContent();
            } else if (key === 'header') {
              children = renderResponseHeader();
            } else if (key === 'log') {
              children = renderLogContent();
            }

            return {
              key,
              label,
              children: (
                <Spin tip="请求发送中..." spinning={false}>
                  {children}
                </Spin>
              ),
            };
          })}
        />
      </div>
    );
  };

  const renderDataConfig = () => {
    return (
      <>
        {renderBaseForm()}
        {renderTestForm()}
        {renderRequestBox()}
        {renderResponseBox()}
      </>
    );
  };

  const renderWorkflowHeader = () => {
    return (
      <div className={styles.header}>
        <Row justify="space-between">
          <Col>
            <h4 style={{ marginBottom: 0, lineHeight: '32px' }}>
              选择Webhook工作流
            </h4>
          </Col>
          <Col>
            <Form size="small" layout="inline">
              {/* <Form.Item>
                <Select placeholder="请选择分类"/>
              </Form.Item> */}
              <Form.Item style={{ marginRight: 0 }}>
                <Input.Search
                  allowClear
                  placeholder="请输入工作流名称"
                  onSearch={handleWorkflowSearch}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    );
  };

  const handleWorkflowListChange = (pagination) => {
    workflowState.params = {
      ...workflowState.params,
      page: pagination.current,
      size: pagination.pageSize,
    };
    setWorkflowState({
      ...workflowState,
    });
  };

  const onSelectChange = (selectedRowKeys) => {
    workflowState.selectedRowKeys = selectedRowKeys;
    setWorkflowState({
      ...workflowState,
    });
  };

  const renderWorkflowList = () => {
    const columns = [
      {
        title: '工作流名称',
        dataIndex: 'name',
      },
      // {
      //   title: '所属分类',
      //   dataIndex: 'categoryId'
      // },
      {
        title: '创建人',
        dataIndex: 'updatedBy',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedTime',
      },
      // {
      //   width: 60,
      //   title: '操作',
      //   align: 'center',
      //   dataIndex: 'action',
      //   render: () => (
      //     <Button size="small" type="text">
      //       <ArrowRightOutlined/>
      //     </Button>
      //   )
      // }
    ];
    const data = workflowPageData.list;
    const rowSelection: any = {
      type: 'radio',
      selectedRowKeys: workflowState.selectedRowKeys,
      onChange: onSelectChange,
    };
    return (
      <div>
        <Table
          size="small"
          rowKey="flowKey"
          scroll={{ y: 300 }}
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
          loading={workflowsRequest.loading}
          pagination={workflowPageData.pagination}
          onChange={handleWorkflowListChange}
        />
      </div>
    );
  };

  const renderWorkflow = () => {
    return (
      <div className={styles.workflow}>
        {renderWorkflowHeader()}
        {renderWorkflowList()}
      </div>
    );
  };

  const renderSchemaFields = () => {
    const columns = [
      {
        title: '字段名称',
        dataIndex: 'name',
      },
      {
        title: '字段标识',
        dataIndex: 'code',
      },
      {
        title: '字段类型',
        dataIndex: 'valueType',
      },
      {
        title: '默认值',
        dataIndex: 'defaultValue',
      },
    ];
    const data = schemaFields;
    return (
      <div style={{ padding: 24 }}>
        <Table
          size="small"
          rowKey="code"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 300 }}
          loading={workflowInstanceRequest.loading}
        />
      </div>
    );
  };

  const renderTitle = useMemo(() => {
    return (
      <Row justify="space-between" style={{ width: 450 }}>
        <Col>新建工作流数据视图</Col>
        <Col>
          {/* <Steps
            size="small"
            current={currentStep}
            items={[
              {
                title: '选择工作流'
              }, {
                title: '视图配置'
              }
            ]}
            onChange={setCurrentStep}
          /> */}
        </Col>
      </Row>
    );
  }, [currentStep]);

  return (
    <NiceModal
      width={1124}
      destroyOnClose
      open={visible}
      style={{ top: 20 }}
      title={renderTitle}
      okText={currentStep === 0 ? '下一步' : '保存'}
      bodyStyle={{ padding: 0, minHeight: 500 }}
      // okButtonProps={{
      //   disabled: currentStep === 0
      // }}
      okButtonProps={{
        disabled: !workflowState.selectedRowKeys.length,
      }}
      cancelText={currentStep === 0 ? '取消' : '上一步'}
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      {currentStep === 0 ? renderWorkflow() : renderSchemaFields()}
    </NiceModal>
  );
};

export default WorkflowDataModal;
