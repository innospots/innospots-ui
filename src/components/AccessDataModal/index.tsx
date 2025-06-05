import React, { useMemo, useState, useEffect } from 'react';

import {
  Col,
  Row,
  Form,
  Input,
  Table,
} from 'antd';
import _ from 'lodash';
import { useModel } from 'umi';
import { useUpdateEffect } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import { KeyValues } from '@/common/types/Types';

import useModal from '@/common/hooks/useModal';
import NiceModal, { NiceModalProps } from '@/components/Nice/NiceModal';

import styles from './style.less';

export const MODAL_NAME = 'AccessDataModal';

export const REGISTRY_TYPES = [
  { label: '接入工作流', key: 'EVENT_FLOW' },
  { label: '接入审批流', key: 'APPROVAL_FLOW' },
  { label: '接入 API', key: 'API' },
  { label: '接入数据集', key: 'DATASET' },
];

const DEFAULT_PAGE_DATA = {
  name: '',
  page: 1,
  size: 10,
};

const AccessDataModal: React.FC<
  NiceModalProps & { onSubmit: (type: string, data: any) => void }
> = ({ onSubmit }) => {
  const { t, loading: i18nLoading } = useI18n(['httpapi', 'common']);

  const [workflowState, setWorkflowState] = useState<KeyValues>({
    params: {
      ...DEFAULT_PAGE_DATA
    },
    selectedRowKeys: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const { registryListPage, registryListRequest, registryFieldsRequest } = useModel('App', (model) => ({
    registryListPage: model.registryListPage,
    registryListRequest: model.registryListRequest,
    registryFieldsRequest: model.registryFieldsRequest,
  }));

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, modalType, initValues } = modalInfo;

  const modalTitle = useMemo(() => {
    return REGISTRY_TYPES.find((item) => item.key === initValues?.registryType)?.label || '';
  }, [initValues?.registryType]);
  const registryList = useMemo(() => {
    return registryListPage?.list || [];
  }, [registryListPage?.list]);

  useEffect(() => {
    if (visible && initValues?.registryType) {
      setWorkflowState({
        params: {
          ...DEFAULT_PAGE_DATA,
        },
        selectedRowKeys: [],
      });
    } else {
      setCurrentStep(0);
    }
  }, [visible, initValues?.registryType]);

  useUpdateEffect(() => {
    registryListRequest.run(initValues?.registryType, workflowState.params);
  }, [workflowState.params]);

  const handleSubmit = () => {
    if (workflowState.selectedRowKeys.length) {
      const selectedKey = workflowState.selectedRowKeys[0];
      if (currentStep === 0) {
        setCurrentStep(1);
        registryFieldsRequest.run(initValues.registryType, selectedKey);
      } else {
        // const registryData = _.find(registryList, (item) => item.code === selectedKey) || {};
        onSubmit(modalType, registryFieldsRequest.data);
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
      ...DEFAULT_PAGE_DATA,
      name: value,
    };
    setWorkflowState({
      ...workflowState,
    });
  };

  const renderWorkflowHeader = () => {
    return (
      <div className={styles.header}>
        <Row justify="space-between">
          <Col>
            <h4 style={{ marginBottom: 0, lineHeight: '32px' }}>选择Webhook工作流</h4>
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
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '标识',
        dataIndex: 'updatedBy',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedTime',
      }
    ];
    const rowSelection: any = {
      type: 'radio',
      selectedRowKeys: workflowState.selectedRowKeys,
      onChange: onSelectChange,
    };
    return (
      <div>
        <Table
          size="small"
          rowKey="code"
          scroll={{ y: 300 }}
          columns={columns}
          dataSource={registryList}
          rowSelection={rowSelection}
          loading={registryListRequest.loading}
          pagination={registryListPage?.pagination}
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
        render: (value) => value || '--'
      },
      {
        title: '默认值',
        dataIndex: 'defaultValue',
        render: (value) => value || '--'
      },
    ];
    const schemaFields = registryFieldsRequest.data?.schemaFields as any[];
    return (
      <div style={{ padding: 24 }}>
        <Table
          size="small"
          rowKey="code"
          columns={columns}
          pagination={false}
          scroll={{ y: 300 }}
          dataSource={schemaFields}
          loading={registryFieldsRequest.loading}
        />
      </div>
    );
  };

  const renderTitle = useMemo(() => {
    return (
      <Row justify="space-between" style={{ width: 450 }}>
        <Col>{modalTitle}</Col>
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
  }, [modalTitle]);

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
      cancelButtonProps={{
        onClick: handleCancel,
      }}
      cancelText={currentStep === 0 ? '取消' : '上一步'}
      onOk={handleSubmit}
      onCancel={() => modal.hide()}
    >
      {currentStep === 0 ? renderWorkflow() : renderSchemaFields()}
    </NiceModal>
  );
};

export default AccessDataModal;
