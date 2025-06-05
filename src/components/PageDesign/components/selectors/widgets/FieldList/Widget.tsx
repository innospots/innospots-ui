import _ from 'lodash';
import cls from 'classnames';
import { Table, Select, Input, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useControllableValue, useDebounceEffect } from 'ahooks';
import { FC, useEffect, useState, useContext, useMemo, forwardRef } from 'react';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';
import type { WidgetItemType } from '@/models/AppEditor';

import { WidgetContext } from '../../WidgetProvider';
import InputFieldCascader from '../InputFieldCascader';

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

  const inputFields: any[] = [];
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

    if (type === 'FIELD') {
      if (value) {
        fieldData[code] = getDefaultField({
          opt: 'EQUAL',
          ...value
        });
      } else {
        delete fieldData[code]
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

  const formattedColumns = useMemo(() => {
    const customColumns = _.cloneDeep(settings.customColumns || []);

    const columns = customColumns.map((item) => {
      const title = item.required ? (<div><span><span style={{ color: '#ff4d4f' }}>*</span>&nbsp;<span>{item.title}</span></span></div>) : item.title
      const column: any = {
        title: title,
        width: item.width,
        dataIndex: item.code,
        render: columnRender,
      };

      switch (item.type) {
        case 'FIELD':
          column.render = (field, record, index) => {
            let filedValue = field?.code;
            const fieldNodes = field?.fieldNodes || []
            if (fieldNodes.length) {
              filedValue = _.map(fieldNodes, item => item.label)
              filedValue = filedValue.join(' - ')
            }

            if (readOnly || column.isView) {
              return <span style={{ wordBreak: 'break-all' }}>{filedValue || '-'}</span>;
            }

            return (
              <InputFieldCascader
                value={field}
                fieldSource={settings.fieldSource}
                onChange={updateFields(index, item)}
              />
            );
          };
          break;

        case 'SELECT':
          column.render = (value, record, index) => {
            if (readOnly) {
              return <span style={{ wordBreak: 'break-all' }}>{value || '-'}</span>;
            }

            return (
              <Select
                allowClear
                size="small"
                value={value}
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

            return (
              <Input
                size="small"
                value={value}
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
  }, [settings.customColumns, fields, readOnly]);

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
