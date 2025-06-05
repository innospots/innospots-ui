import { useLockFn, useRequest } from 'ahooks';
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Spin,
  Tabs,
  TimePicker,
} from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import React from 'react';

import useI18n from '@/common/hooks/useI18n';
import { executeWorkflowInstance, fetchInputFields } from '@/services/Builder';
import CurContext from '../../common/context';
import Json from '../NodeDataConfig/ExecutionItems/Json';

import styles from './index.less';

const FORM_MAP = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
  YEAR_MONTH: 'YYYY-MM',
  YEAR_MONTH_DATE: 'YYYY-MM-DD',
  MONTH: 'YYYY-MM',
  MONTH_DATE: 'YYYY-MM-DD',
};

const isNumberType = (type: string) => {
  return ['INTEGER', 'LONG', 'DOUBLE', 'DECIMAL', 'NUMERIC'].includes(type);
};

const isDateType = (type: string) => {
  return [
    'DATE',
    'YEAR_MONTH',
    'YEAR_MONTH_DATE',
    'MONTH',
    'MONTH_DATE',
    'DAY_OF_MONTH',
  ].includes(type);
};

const isTimeType = (type: string) => {
  return ['TIME', 'DATE_TIME'].includes(type);
};

const getDateFormat = (type: string) => {
  return FORM_MAP[type as keyof typeof FORM_MAP] || FORM_MAP.DATE;
};

const TestPanel = ({ onClose }: { onClose: () => void }) => {
  const { t } = useI18n(['workflow', 'common']);
  const { testNode, workflowType, flowInstance } = React.useContext(CurContext);

  const [form] = Form.useForm();

  const [viewTab, setViewTab] = React.useState<string>('input');
  const [inputFields, setInputFields] = React.useState<any[]>([]);
  const [testResult, setTestResult] = React.useState<any>(null);

  const executeRequest = useRequest(executeWorkflowInstance, {
    manual: true,
  });

  const inputFieldsRequest = useRequest(fetchInputFields, {
    manual: true,
  });

  const getInputFields = useLockFn(async () => {
    const nodeKey = testNode.nodeKey;
    const result = await inputFieldsRequest.runAsync({
      nodeKey,
      workflowType,
      workflowInstanceId: flowInstance.workflowInstanceId,
    });

    if (result) {
      const node = _.find(result, (item) => item.nodeKey === nodeKey);
      if (node) {
        setInputFields(node.fields);
      }
    }
  });

  React.useEffect(() => {
    if (testNode && workflowType && flowInstance.workflowInstanceId) {
      getInputFields();
    }
  }, [testNode, workflowType, flowInstance.workflowInstanceId]);

  const formatValues = (values: any) => {
    const newValues: any = {};
    _.each(values, (value, key) => {
      if (!_.isNil(value)) {
        const field = inputFields.find((v) => v.value === key);
        if (field) {
          const { type } = field;
          if (isDateType(type) || isTimeType(type)) {
            newValues[key] = value.format(getDateFormat(type));
          } else {
            newValues[key] = value;
          }
        }
      }
    });
    return newValues;
  };

  const handleSubmit = useLockFn(async (values: any) => {
    const result = await executeRequest.runAsync({
      workflowInstanceId: flowInstance.workflowInstanceId,
      workflowType,
      data: formatValues(values),
    });
    if (result) {
      setViewTab('result');
      setTestResult(result[testNode.nodeKey]);
    }
  });

  const resetTestData = () => {
    form.resetFields();
    setTestResult(null);
  };

  const renderFooter = () => {
    return (
      <div className={styles.footer}>
        <Flex gap={16} justify="end">
          <Button onClick={resetTestData}>
            {t('common.button.reset')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={executeRequest.loading}
          >
            {t('common.button.run')}
          </Button>
        </Flex>
      </div>
    );
  };

  const renderInputForm = () => {
    return (
      <div className={cls(styles.inputForm, 'custom-scrollbar')}>
        {inputFieldsRequest.loading ? (
          <Flex justify="center" align="center" style={{ paddingTop: 100 }}>
            <Spin spinning={inputFieldsRequest.loading} />
          </Flex>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {_.map(inputFields, (field) => {
              const { type } = field;
              return (
                <Form.Item
                  key={field.value}
                  label={field.label}
                  name={field.value}
                >
                  {isNumberType(type) ? (
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('common.input.placeholder')}
                    />
                  ) : isTimeType(type) ? (
                    <TimePicker
                      style={{ width: '100%' }}
                      format={getDateFormat(type)}
                    />
                  ) : isDateType(type) ? (
                    <DatePicker
                      style={{ width: '100%' }}
                      format={getDateFormat(type)}
                    />
                  ) : (
                    <Input
                      style={{ width: '100%' }}
                      placeholder={t('common.input.placeholder')}
                    />
                  )}
                </Form.Item>
              );
            })}
            {renderFooter()}
          </Form>
        )}
      </div>
    );
  };

  const renderResult = () => {
    return (
      <div className={cls(styles.testResult, 'custom-scrollbar')}>
        <Json executeData={testResult} />
      </div>
    );
  };

  const renderTabNode = () => {
    const tabItems = _.map(['input', 'result'], (tab) => ({
      key: tab,
      label: (
        <span className={styles.tabBar}>
          {t(`workflow.builder.test.${tab}.title`)}
        </span>
      ),
      children: (
        <div className={styles.content}>
          {tab === 'input' ? renderInputForm() : renderResult()}
        </div>
      ),
    }));

    return <Tabs activeKey={viewTab} items={tabItems} onChange={setViewTab} />;
  };

  return (
    <div className={styles.wrapper} style={{ bottom: 20 }}>
      {renderTabNode()}
    </div>
  );
};

export default TestPanel;
