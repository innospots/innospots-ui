import _ from 'lodash';
import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  Space,
  Drawer,
  message,
  DatePicker,
  InputNumber,
} from 'antd';
import moment from 'moment';
import { useModel } from 'umi';
import { useSetState } from 'ahooks';
import type { RangePickerProps } from 'antd/es/date-picker';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import {
  JOB_TYPES,
  WEEK_OPTIONS,
  MONTH_OPTIONS,
  SCHEUDLE_MODE_OPTIONS,
  TIME_PERIOD_OPTIONS,
} from '../../config';

import JobList from './JobList';
import JobParams, { KeyValuePair } from './JobParams';

import styles from './style.less';

export const DRAWER_NAME = 'ScheduleJobDrawer';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

const formatDateToString = (value: any, format: string = 'YYYY-MM-DD HH:mm:ss') => {
  if (value) {
    return value.format(format);
  }
  return '';
};

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < moment().endOf('day');
};

const ScheduleJobDrawer: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useI18n(['schedule', 'common']);

  const [drawer, drawerInfo] = useModal(DRAWER_NAME);
  const { visible, modalType, initValues = {} } = drawerInfo;

  const isView = initValues.type === 'view';

  const [jobParams, setJobParams] = useState<KeyValuePair[]>([]);
  const jobParamsRef = useRef<KeyValuePair[]>([]);

  const [jobFlow, setJobFlow] = useState<any>({});
  const jobFlowRef = useRef<any>();

  const [listenMap, setListenMap] = useSetState<Record<string, string>>({
    jobType: '',
    timePeriod: '',
    scheduleMode: '',
  });

  const jobTypeOptions = useMemo(() => {
    return JOB_TYPES.map((type) => ({
      value: type,
      label: t(`schedule.job_type.${type}`),
    }));
  }, [t]);

  const scheduleModeOptions = useMemo(() => {
    return SCHEUDLE_MODE_OPTIONS.map((type) => ({
      value: type,
      label: t(`schedule.schedule_mode.${type}`),
    }));
  }, [t]);

  const timePeriodOptions = useMemo(() => {
    return TIME_PERIOD_OPTIONS.map((type) => ({
      value: type,
      label: t(`schedule.time_period.${type}`),
    }));
  }, [t]);

  const weekOptions = useMemo(() => {
    return WEEK_OPTIONS.map((type) => ({
      value: type,
      label: t(`schedule.week.options.${type}`),
    }));
  }, [t]);

  const monthOptions = useMemo(() => {
    return MONTH_OPTIONS.map((type) => ({
      value: type,
      label: t(`schedule.day.options.${type}`),
    }));
  }, [t]);

  const { createScheduleJobRequest, updateScheduleJobRequest } = useModel(
    'ScheduleJob',
    (model) => ({
      createScheduleJobRequest: model.createScheduleJobRequest,
      updateScheduleJobRequest: model.updateScheduleJobRequest,
    }),
  );

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initValues) {
        setInitValues();
      } else {
        setJobFlow({});
        setJobParams([]);
        setListenMap({
          jobType: '',
          timePeriod: '',
          scheduleMode: '',
        });
        jobFlowRef.current = {};
        jobParamsRef.current = [];
        form.resetFields();
      }
    }
  }, [visible, modalType, initValues]);

  const setInitValues = () => {
    const values = {
      ...initValues,
    };
    const timeConfig = values.timeConfig || {};

    if (values.scheduleMode === 'SCHEDULED') {
      if (values.startTime && values.endTime) {
        values.timeLimit = [moment(values.startTime), moment(values.endTime)];
      }
    }

    if (['DAY', 'HOUR', 'MINUTE'].includes(timeConfig.timePeriod)) {
      values.runCycle = timeConfig.periodTimes[0];
    }

    if (timeConfig.runTime) {
      timeConfig.runTime = moment(
        timeConfig.runTime,
        values.scheduleMode === 'ONCE' ? 'YYYY-MM-DD HH:mm:ss' : 'HH:mm:ss',
      );
    }

    if (values.jobType === 'FLOW_JOB' && values.jobKey) {
      setJobFlow({
        flowKey: values.jobKey,
        name: values.jobName,
      });
    }

    form.setFieldsValue({
      ...values,
    });

    setListenMap({
      jobType: values.jobType,
      scheduleMode: values.scheduleMode,
      timePeriod: values.timeConfig?.timePeriod,
    });

    setJobParams(
      _.map(_.keys(values.params), (key) => ({
        id: key,
        key,
        value: values.params[key],
      })),
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const postData = modalType === 'edit' ? { ...initValues, ...values } : { ...values };

      const { jobType, scheduleMode, timeConfig, timeLimit } = postData;

      if (scheduleMode === 'ONCE') {
        timeConfig.runTime = formatDateToString(timeConfig.runTime);
      } else if (scheduleMode === 'SCHEDULED') {
        if (['WEEK', 'MONTH'].includes(listenMap.timePeriod) && timeConfig.runTime) {
          timeConfig.runTime = formatDateToString(timeConfig.runTime, 'HH:mm:ss');
        } else if (['DAY', 'HOUR', 'MINUTE'].includes(listenMap.timePeriod) && postData.runCycle) {
          timeConfig.periodTimes = [postData.runCycle];
          delete postData.runCycle;
        }

        if (timeLimit?.length === 2) {
          postData.startTime = formatDateToString(timeLimit[0]);
          postData.endTime = formatDateToString(timeLimit[1]);
          delete postData.timeLimit;
        }
      }

      if (jobType === 'FLOW_JOB') {
        const jobFlow = jobFlowRef.current;
        if (jobFlow) {
          postData.jobKey = jobFlow.flowKey;
          postData.jobName = jobFlow.name;
        }
        delete postData.jobClass;
      }

      if (jobParamsRef.current.length > 0) {
        postData.params = {};
        jobParamsRef.current.forEach((item) => {
          postData.params[item.key] = item.value;
        });
      }

      let result;
      if (modalType === 'edit') {
        result = await updateScheduleJobRequest.runAsync(postData);
      } else {
        result = await createScheduleJobRequest.runAsync(postData);
      }

      if (result) {
        message.success(t('common.error_message.save.success'));
        drawer.hide();
        onSuccess();
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handleParamsChange = (params: KeyValuePair[]) => {
    jobParamsRef.current = params;
  };

  const handleValuesChange = (changedValues: any) => {
    let changedKey = '';
    _.find(_.keys(listenMap), (key) => {
      if (key in changedValues || key in (changedValues.timeConfig || {})) {
        let newVal = changedValues[key];
        if (changedValues.timeConfig) {
          newVal = changedValues.timeConfig[key];
        }

        setListenMap({ [key]: newVal });
        changedKey = key;
        return true;
      }
      return false;
    });

    if ('timePeriod' === changedKey) {
      form.setFieldsValue({
        timeConfig: {
          runTime: undefined,
          periodTimes: undefined,
        },
      });
    } else if ('scheduleMode' === changedKey) {
      form.setFieldsValue({
        runCycle: undefined,
        timeLimit: undefined,
        timeConfig: {
          runTime: undefined,
          timePeriod: undefined,
          cronExpression: undefined,
        },
      });
      setListenMap({
        timePeriod: '',
      });
    } else if ('jobType' === changedKey) {
      form.setFieldsValue({
        jobFlow: undefined,
        jobClass: undefined,
        jobName: undefined,
      });
    }
  };

  const renderBaseForm = () => {
    return (
      <>
        <Form.Item
          name="jobType"
          label={t('schedule.form.label.job_type')}
          rules={[{ required: true, message: t('schedule.form.rule.job_type_required') }]}
        >
          <Select
            allowClear
            options={jobTypeOptions}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        {/* {listenMap.jobType === 'FLOW_JOB' && (
          <Form.Item
            name="jobFlow"
            label={t('schedule.form.label.job_flow')}
            rules={[{ required: true, message: t('schedule.form.rule.job_flow_required') }]}
          >
            <Select allowClear options={jobFlowOptions} placeholder={t('common.select.placeholder')} />
          </Form.Item>
        )} */}
        {listenMap.jobType === 'EXECUTE' && (
          <>
            <Form.Item
              name="jobClass"
              label={t('schedule.form.label.job_class')}
              rules={[{ required: true, message: t('schedule.form.rule.job_class_required') }]}
            >
              <Input allowClear placeholder={t('common.input.placeholder')} />
            </Form.Item>
            <Form.Item
              name="jobName"
              label={t('schedule.form.label.job_name')}
              rules={[{ required: true, message: t('schedule.form.rule.job_name_required') }]}
            >
              <Input allowClear placeholder={t('common.input.placeholder')} />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="scheduleMode"
          label={t('schedule.form.label.schedule_type')}
          rules={[{ required: true, message: t('schedule.form.rule.schedule_type_required') }]}
        >
          <Select
            allowClear
            options={scheduleModeOptions}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="subJobCount"
          label={t('schedule.form.label.node_count')}
          rules={[{ required: true, message: t('schedule.form.rule.node_count_required') }]}
        >
          <InputNumber
            min={0}
            precision={0}
            placeholder={t('common.input.placeholder')}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </>
    );
  };

  const renderRunTimeForm = () => {
    return (
      <Form.Item
        name={['timeConfig', 'runTime']}
        label={t('schedule.form.label.run_time')}
        rules={[{ required: true, message: t('schedule.form.rule.run_time_required') }]}
      >
        <DatePicker
          showTime
          allowClear
          showNow={false}
          style={{ width: '100%' }}
          disabledDate={disabledDate}
        />
      </Form.Item>
    );
  };

  const renderScheduleTimeForm = () => {
    return (
      <Form.Item
        name={['timeConfig', 'runTime']}
        label={t('schedule.form.label.schedule_time')}
        rules={[{ required: true, message: t('schedule.form.rule.schedule_time_required') }]}
      >
        <DatePicker.TimePicker allowClear style={{ width: '100%' }} />
      </Form.Item>
    );
  };

  const renderPeriodTimesForm = () => {
    const timePeriod = listenMap.timePeriod;
    if (['WEEK', 'MONTH'].includes(timePeriod)) {
      return (
        <>
          <Form.Item
            name={['timeConfig', 'periodTimes']}
            label={t('schedule.form.label.period_times')}
            rules={[{ required: true, message: t('schedule.form.rule.period_times_required') }]}
          >
            <Select
              allowClear
              mode="multiple"
              options={timePeriod === 'WEEK' ? weekOptions : monthOptions}
              placeholder={t('common.select.placeholder')}
            />
          </Form.Item>
          {renderScheduleTimeForm()}
        </>
      );
    } else if (timePeriod) {
      return (
        <>
          <Form.Item
            name="runCycle"
            label={t('schedule.form.label.period_times')}
            rules={[{ required: true, message: t('schedule.form.rule.node_count_required') }]}
          >
            <InputNumber
              min={1}
              precision={0}
              addonAfter={t(`schedule.form.addon.run_cycle_${timePeriod.toLowerCase()}`)}
              addonBefore={t('schedule.form.addon.run_cycle_every')}
              style={{ width: '100%' }}
              placeholder={t('common.input.placeholder')}
            />
          </Form.Item>
          {timePeriod === 'DAY' && renderScheduleTimeForm()}
        </>
      );
    }
  };

  const renderTimeConfigForms = () => {
    return (
      <>
        <Form.Item name="timeLimit" label={t('schedule.form.label.time_limit')}>
          <DatePicker.RangePicker
            showTime
            allowClear
            showNow={false}
            style={{ width: '100%' }}
            disabledDate={disabledDate}
          />
        </Form.Item>
        <Form.Item
          name={['timeConfig', 'timePeriod']}
          label={t('schedule.form.label.time_period')}
          rules={[{ required: true, message: t('schedule.form.rule.time_period_required') }]}
        >
          <Select
            allowClear
            options={timePeriodOptions}
            placeholder={t('common.select.placeholder')}
          />
        </Form.Item>
        {renderPeriodTimesForm()}
      </>
    );
  };

  const renderExtraForms = () => {
    const scheduleMode = listenMap.scheduleMode;
    if (scheduleMode === 'ONCE') {
      return renderRunTimeForm();
    } else if (scheduleMode === 'CRON') {
      return (
        <Form.Item
          name={['timeConfig', 'cronExpression']}
          label={t('schedule.form.label.cron_expression')}
          tooltip={t('schedule.job.drawer.cron_expression_tooltip')}
          rules={[{ required: true, message: t('schedule.form.rule.cron_expression_required') }]}
        >
          <Input.TextArea
            allowClear
            rows={2}
            style={{ width: '100%' }}
            placeholder={t('common.input.placeholder')}
          />
        </Form.Item>
      );
    } else if (scheduleMode === 'SCHEDULED') {
      return renderTimeConfigForms();
    }
  };

  const renderScheduleForm = () => {
    if (!listenMap.scheduleMode) {
      return (
        <div className={styles.emptyTimeConfig}>
          <p>{t('schedule.job.drawer.time_config_empty')}</p>
        </div>
      );
    }

    return renderExtraForms();
  };

  const renderJobForm = () => {
    return (
      <div style={{ margin: '24px 0' }}>
        <Form form={form} disabled={isView} {...formItemLayout} onValuesChange={handleValuesChange}>
          {renderBaseForm()}
          {renderScheduleForm()}
        </Form>
      </div>
    );
  };

  const handleJobFlowChange = (flowData: any) => {
    jobFlowRef.current = flowData;
  };

  const renderJobList = () => {
    if (listenMap.jobType === 'FLOW_JOB') {
      return <JobList value={jobFlow} isView={isView} onChange={handleJobFlowChange} />;
    }
    return null;
  };

  const renderJobParamsForm = () => {
    return <JobParams value={jobParams} isView={isView} onChange={handleParamsChange} />;
  };

  return (
    <Drawer
      width={600}
      open={visible}
      onClose={drawer.hide}
      title={t(`schedule.drawer.${initValues.type || 'add'}.title`)}
      footer={
        !isView && (
          <Row justify="end">
            <Space>
              <Button onClick={drawer.hide}>{t('common.button.cancel')}</Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={
                  modalType === 'edit'
                    ? updateScheduleJobRequest.loading
                    : createScheduleJobRequest.loading
                }
              >
                {t('common.button.confirm')}
              </Button>
            </Space>
          </Row>
        )
      }
    >
      {renderJobForm()}
      {renderJobParamsForm()}
      {renderJobList()}
    </Drawer>
  );
};

export default ScheduleJobDrawer;
