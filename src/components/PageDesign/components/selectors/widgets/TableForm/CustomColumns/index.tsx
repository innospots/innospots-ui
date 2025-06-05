import _ from 'lodash';
import React, { useMemo } from 'react';
import moment from 'moment';
import { useControllableValue } from 'ahooks';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Table, Input, Select, Row, Col, Checkbox, DatePicker } from 'antd';

import { randomString } from '@/common/utils';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import OptionsModal, { MODAL_NAME } from './OptionsModal';
import DateConfigModal, { MODAL_NAME as DATE_CONFIG_MODAL_NAME } from './DateConfigModal';
import styles from '@/components/PageDesign/components/selectors/style.less';

const INPUT_TYPES = [
  {
    value: 'INPUT',
    label: 'Input',
  },
  {
    value: 'SELECT',
    label: 'Select',
  },
  {
    value: 'DATETIME',
    label: 'DateTime',
  },
  {
    value: 'NUMBER',
    label: 'Number',
  },
];

const defaultDateConfig = {
  format: 'YYYY-MM-DD HH:mm:ss',
  isRange: false,
}

const getDefaultField = (o?: any): any => {
  const key = randomString(4);
  return {
    code: 'code',
    type: 'INPUT',
    title: 'title',
    width: 'auto',
    rowKey: key,
    ...o,
  };
};

const CustomColumns: React.FC = (props) => {
  const { t } = useI18n(['common']);
  const [optionsModal] = useModal(MODAL_NAME);
  const [dateConfigModal] = useModal(DATE_CONFIG_MODAL_NAME);
  const [value, setValue] = useControllableValue<any[]>(props, {
    defaultValue: [],
  });

  const fieldChange = (type: string, index: number) => (event: any) => {
    let val = event.target ? event.target.value : event;
    const field = value[index];
    if (type === 'required') {
      val = event.target.checked;
    } else if (type === 'type') {
      if (val === 'DATETIME') {
        if (!field['config']) {
          value[index]['config'] = defaultDateConfig;
        }
      }
    } else if (type === 'default' && field.type === 'DATETIME') {
      const dateConfig = field.config || defaultDateConfig;
      if (dateConfig.isRange) {
        val = val.map(item => item.format(dateConfig.format));
      } else {
        val = val.format(dateConfig.format);
      }
    }
    value[index][type] = val;
    setValue([...value]);
  };

  const renderConfigItem = (text: any, record: any, index: number) => {
    let el;

    if (record.type === 'SELECT') {
      el = (
        <Row gutter={8} align="middle">
          <Col flex="112px">
            <Select
              size="small"
              options={text}
              placeholder={t('common.select.placeholder')}
              style={{ width: '112px' }}
            />
          </Col>
          <Col flex="auto">
            <span
              className="b-button"
              onClick={() =>
                optionsModal.show({
                  index,
                  options: text,
                })
              }
            >
              <EditOutlined />
            </span>
          </Col>
        </Row>
      );
    } else if (record.type === 'DATETIME') {
      el = (
        <Row gutter={8} align="middle">
          <Col flex="auto">
            <span
              className="b-button"
              onClick={() =>
                dateConfigModal.show({
                  index,
                  config: record.config,
                })
              }
            >
              <span className="b-button">配置日期格式</span>
            </span>
          </Col>
        </Row>
      );
    }

    return el || '-';
  };

  const renderDefaultValueItem = (col: string, text: any, record: any, index: number) => {
    let el;

    if (col === 'default') {
      if (record.type === 'SELECT') {
        el = (
          <Select
            size="small"
            value={text}
            options={record.options}
            dropdownMatchSelectWidth={false}
            placeholder={t('common.select.placeholder')}
            onChange={fieldChange(col, index)}
          />
        );
      } else if (record.type === 'DATETIME') {
        const dateConfig = record.config || defaultDateConfig;
        const format = dateConfig.format;
        const isShowTime = format.includes(' ');
        let dateValue;

        if (dateConfig.isRange) {
          if (_.isArray(text)) {
            dateValue = text.map(item => item ? moment(item, format) : undefined);
          }
          el = (
            <DatePicker.RangePicker
              size="small"
              format={format}
              value={dateValue}
              showTime={isShowTime}
              style={{ width: '100%' }}
              onChange={fieldChange(col, index)}
            />
          );
        } else {
          if (_.isString(text)) {
            dateValue = text ? moment(text, format) : undefined;
          }
          el = (
            <DatePicker
              size="small"
              format={format}
              value={dateValue}
              showTime={isShowTime}
              style={{ width: '100%' }}
              onChange={fieldChange(col, index)}
            />
          );
        }
      }
    }

    return el || (
      <Input
        size="small"
        value={text}
        placeholder={t('common.input.placeholder')}
        onChange={fieldChange(col, index)}
      />
    );
  };

  const columnRender = (col: string) => (text: any, record: any, index: number) => {
    let el: any;
    switch (col) {
      case 'type':
        el = (
          <Select
            size="small"
            value={text}
            options={INPUT_TYPES}
            dropdownMatchSelectWidth={false}
            placeholder={t('common.select.placeholder')}
            onChange={fieldChange(col, index)}
          />
        );
        break;

      case 'required':
        el = <Checkbox checked={text} onChange={fieldChange(col, index)} />;
        break;
      case 'options':
        el = renderConfigItem(text, record, index);
        break;
      case 'action':
        el = (
          <span
            className="g-button"
            onClick={() => {
              value.splice(index, 1);
              setValue([...value]);
            }}
          >
            <DeleteOutlined />
          </span>
        );
        break;

      default:
        el = renderDefaultValueItem(col, text, record, index);
        break;
    }

    return el;
  };

  const columns = useMemo(() => {
    return [
      {
        key: 'code',
        width: 100,
        title: '标识',
        dataIndex: 'code',
        render: columnRender('code'),
      },
      {
        key: 'title',
        width: 100,
        title: '文字',
        dataIndex: 'title',
        render: columnRender('title'),
      },
      {
        key: 'type',
        width: 100,
        title: '类型',
        dataIndex: 'type',
        render: columnRender('type'),
      },
      {
        key: 'width',
        width: 100,
        title: '宽度',
        dataIndex: 'width',
        render: columnRender('width'),
      },
      {
        key: 'default',
        width: 160,
        title: '默认值',
        dataIndex: 'default',
        render: columnRender('default'),
      },
      {
        key: 'options',
        width: 160,
        title: '选项&配置',
        dataIndex: 'options',
        render: columnRender('options'),
      },
      {
        key: 'required',
        width: 60,
        title: '必填',
        align: 'center',
        dataIndex: 'required',
        render: columnRender('required'),
      },
      {
        key: 'action',
        width: 50,
        title: '操作',
        fixed: 'right',
        align: 'center',
        dataIndex: 'action',
        render: columnRender('action'),
      },
    ];
  }, [value, t]);
  const tableScroll = {
    x: 200,
    y: 140,
  };

  const addField = () => {
    const fields = value || [];
    fields.push(getDefaultField());
    setValue([...fields]);
  };

  const handleOptionsComplete = (optionsValue: any) => {
    const fields = value || [];
    if (fields[optionsValue.index]) {
      fields[optionsValue.index].options = optionsValue.options;
      setValue([...fields]);
    }
    optionsModal.hide();
  };

  const handleDateConfigComplete = (dateConfigValue: any) => {
    const fields = value || [];
    if (fields[dateConfigValue.index]) {
      fields[dateConfigValue.index].config = dateConfigValue.config;
      setValue([...fields]);
    }
    dateConfigModal.hide();
  };

  return (
    <div>
      <div className={styles.expandBtn}>
        <span className="b-button" onClick={addField}>
          + {t('common.button.add')}
        </span>
      </div>
      <Table
        size="small"
        rowKey="rowKey"
        pagination={false}
        scroll={tableScroll}
        columns={columns}
        dataSource={value}
      />
      <OptionsModal onComplete={handleOptionsComplete} />
      <DateConfigModal onComplete={handleDateConfigComplete} />
    </div>
  );
};

export default CustomColumns;
