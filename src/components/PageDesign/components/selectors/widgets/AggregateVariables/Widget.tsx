import _ from 'lodash';
import cls from 'classnames';
import { Table, Button } from 'antd';
import { useModel } from 'umi'
import React, { useState, useMemo, useContext, forwardRef } from 'react';
import { useControllableValue, useDebounceEffect } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import { randomString } from '@/common/utils';

import VariableModal from './VariableModal';
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

const AggregateVariables:React.FC<any> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const [fields, setFields] = useControllableValue<any[]>(props, {
    defaultValue: [],
  });
  const { inputData, getOptionsByFieldSource } = useModel('AppData', (model) => ({
    inputData: model.inputData,
    getOptionsByFieldSource: model.getOptionsByFieldSource
  }));
  const [tableScroll, setTableScroll] = useState<{
    x: true | string | number;
    y: string | number;
  }>({
    x: true,
    y: 140,
  });
  const { size } = useContext(WidgetContext);

  const [modalData, setModalData] = useState<Record<string, any>>({
    type: 'create',
    open: false
  })

  const options: any[] = settings.options
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

  const inputFields = useMemo(() => getOptionsByFieldSource(settings.fieldSource), [inputData, settings.fieldSource]);

  const columns:any[] = useMemo(() => {
    const cols = [
      {
        title: '字段标识',
        dataIndex: 'code',
        render: (text) => (
          <span>{text || '-'}</span>
        ),
      }, {
        title: '字段名称',
        dataIndex: 'comment',
        render: (text) => (
          <span>{text || '-'}</span>
        ),
      },
    ];

    if (!readOnly) {
      cols.push({
        width: 120,
        title: '操作',
        align: 'center',
        dataIndex: 'action',
        render: (text, record, index) => (
          <>
            <Button size="small" type="link" onClick={() => {
              setModalData({
                open: true,
                type: 'update',
                treeData: inputFields,
                initValues: {
                  ...record
                }
              })
            }}>
              编辑
            </Button>
            <Button danger size="small" type="link" onClick={() => {
              (fields || []).splice(index, 1)
              setFields([
                ...fields
              ])
            }}>
              删除
            </Button>
          </>
        ),
      })
    }

    return cols
  }, [ readOnly, inputFields ])

  const addField = () => {
    setModalData({
      type: 'create',
      open: true,
      treeData: inputFields
    })
  };

  const handleClose = () => {
    setModalData({
      open: false
    })
  }

  const handleVarSubmit = (data) => {
    const newData = getDefaultField(data);
    const list: any[] = _.cloneDeep(fields || []);
    if (modalData.type === 'create') {
      list.push(newData);
    } else {
      const index = _.findIndex(fields, item => item.key === modalData.initValues.key);
      if (index > -1) {
        list[index] = newData;
      }
    }

    setFields(list);
    setModalData({
      open: false
    })
  }

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem}>
          {
            !readOnly && (
              <div className={styles.expandBtn}>
                <span className="cur-btn" onClick={addField}>
                  + {t('common.button.add')}
                </span>
              </div>
            )
          }
          <Table
            size="small"
            rowKey="code"
            scroll={tableScroll}
            columns={columns}
            pagination={false}
            dataSource={fields}
          />
          {
            !readOnly && (
              <VariableModal
                // treeData={formatInputFields}
                { ...modalData }
                options={options}
                onCancel={handleClose}
                onSubmit={handleVarSubmit}
              />
            )
          }
        </div>
      </div>
    </div>
  );
})

export default AggregateVariables
