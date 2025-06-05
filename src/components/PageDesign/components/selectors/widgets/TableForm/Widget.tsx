import _ from 'lodash';
import cls from 'classnames';
import moment from 'moment';
import {useModel} from 'umi'
import { Table, Select, Input, InputNumber, DatePicker } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useControllableValue, useDebounceEffect } from 'ahooks';
import { FC, useEffect, useState, useContext, useMemo, forwardRef } from 'react';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';
import type { WidgetItemType } from '@/models/AppEditor';

import { WidgetContext } from '../../WidgetProvider';

import styles from '../../style.less';

const getDefaultField = (o?: any) => {
  const key = randomString(4);
  return {
    code: key,
    rowKey: key,
    ...o,
  };
};

const FieldList: FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const [fields, setFields] = useControllableValue<any[]>(props, {
    defaultValue: [],
  });
  const [tableScroll, setTableScroll] = useState<{
    x: true | string | number;
    y: string | number;
  }>({
    x: true,
    y: 140,
  });
  const { size } = useContext(WidgetContext);

  const { formErrorFields, getErrorField } = useModel('AppEditor', (model) => ({
    getErrorField: model.getErrorField,
    formErrorFields: model.formErrorFields
  }));

  const readOnly: boolean = widgetType === 'view';

  useDebounceEffect(
    () => {
      if (size?.height) {
        setTableScroll({
          x: size.width - 80,
          y: size.height - 74,
        });
      }
    },
    [size],
    {
      wait: 100,
    },
  );

  const errorField = useMemo(() => getErrorField(props.name), [formErrorFields, props.name])

  useEffect(() => {
    setFields(fields || []);
  }, [fields]);

  const columnRender = (value) => {
    if (value === '' || _.isUndefined(value)) {
      return '-';
    }
    return value;
  };

  const updateFields = (index, item) => (value) => {
    const fieldData: any = {
      ...fields[index],
    };
    const { code, type } = item;

    if (type === 'DATETIME') {
      const { format, isRange } = item.config || {};
      if (isRange) {
        fieldData[code] = value.map(item => moment(item, format));
      } else {
        fieldData[code] = moment(value, format);
      }
    } else {
      fieldData[code] = value?.target ? value.target.value : value;
    }

    if (index > -1) {
      fields[index] = fieldData;
    } else {
      fields.push(fieldData);
    }

    setFields([...fields]);
  };

  const getStatus = (value: any, isError: boolean) => {
    if (isError && (_.isNil(value) || value === '')) {
      return 'error'
    }
    return undefined
  }

  const formattedColumns = useMemo(() => {
    const customColumns = _.cloneDeep(settings.customColumns || []);
    const errorCodes = errorField?.errors || []

    const columns = customColumns.map((item) => {
      const title = item.required ? (<div><span>{!readOnly && (<><span style={{ color: '#ff4d4f' }}>*</span>&nbsp;</>)}<span>{item.title}</span></span></div>) : item.title
      const column: any = {
        title: title,
        width: item.width,
        dataIndex: item.code,
        render: columnRender,
      };

      const isError = errorCodes.includes(item.code)

      switch (item.type) {
        case 'DATETIME':
          column.render = (value, record, index) => {
            if (readOnly || column.isView) {
              return <span style={{ wordBreak: 'break-all' }}>{value || '-'}</span>;
            }

            let dateValue
            const { format, isRange } = item.config || {};
            const isShowTime = format.includes(' ');
            const status = getStatus(value, isError)

            if (isRange) {
              if (_.isArray(value)) {
                dateValue = value.map(item => item ? moment(item, format) : undefined);
              }
              return (
                <DatePicker.RangePicker
                  size="small"
                  status={status}
                  value={dateValue}
                  showTime={isShowTime}
                  style={{ width: '100%' }}
                  onChange={updateFields(index, item)}
                />
              );
            } else {
              if (_.isString(value)) {
                dateValue = value ? moment(value, format) : undefined;
              }

              return (
                <DatePicker
                  size="small"
                  status={status}
                  value={dateValue}
                  showTime={isShowTime}
                  style={{ width: '100%' }}
                  onChange={updateFields(index, item)}
                />
              );
            }
          };
          break;

        case 'SELECT':
          column.render = (value, record, index) => {
            if (readOnly) {
              const currentItem = _.find(item.options, (item) => item.value === value)
              const viewValue = currentItem ? currentItem.label : value;
              return <span style={{ wordBreak: 'break-all' }}>{viewValue || '-'}</span>;
            }
            const status = getStatus(value, isError)

            return (
              <Select
                allowClear
                size="small"
                value={value}
                status={status}
                style={{ width: '100%' }}
                options={item.options}
                onChange={updateFields(index, item)}
                placeholder={t('common.select.placeholder')}
              />
            );
          };
          break;

        case 'NUMBER':
          column.render = (value, record, index) => {
            if (readOnly) {
              return <span style={{ wordBreak: 'break-all' }}>{value || '-'}</span>;
            }

            return (
              <InputNumber
                size="small"
                value={value}
                style={{ width: '100%' }}
                onChange={updateFields(index, item)}
              />
            );
          };
          break;

        default:
          column.render = (value, record, index) => {
            if (readOnly) {
              return <span style={{ wordBreak: 'break-all' }}>{value || '-'}</span>;
            }
            const status = getStatus(value, isError)

            return (
              <Input
                size="small"
                value={value}
                status={status}
                placeholder={t('common.input.placeholder')}
                onChange={updateFields(index, item)}
              />
            );
          };
          break;
      }

      return column;
    });

    if (!readOnly) {
      columns.push({
        width: 60,
        align: 'center',
        title: '操作',
        fixed: 'right',
        dataIndex: '__ACTION__',
        render: (value, record, index) => (
          <span
            className="g-button"
            onClick={() => {
              fields.splice(index, 1);
              setFields([...fields]);
            }}
          >
            <DeleteOutlined />
          </span>
        ),
      });
    }

    return columns;
  }, [settings.customColumns, fields, readOnly, errorField]);

  const addField = () => {
    // if (!isConfig) return;

    const values = _.reduce(
      settings.customColumns,
      (value, item) => {
        value[item.code] = item.default;
        return value;
      },
      {},
    );

    const fieldValue = (fields || []).concat([]);

    fieldValue.push(getDefaultField(values));
    setFields(fieldValue);
  };

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formLabel}>{settings.label}</div>
        <div className={styles.formItem}>
          {!readOnly && (
            <div className={styles.expandBtn}>
              <span className="cur-btn" onClick={addField}>
                + {t('common.button.add')}
              </span>
            </div>
          )}
          <Table
            size="small"
            rowKey="rowKey"
            pagination={false}
            scroll={tableScroll}
            columns={formattedColumns}
            dataSource={fields}
          />
        </div>
      </div>
    </div>
  );
});

export default FieldList;
