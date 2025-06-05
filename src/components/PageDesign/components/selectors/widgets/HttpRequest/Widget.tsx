import _ from 'lodash';
import cls from 'classnames';
import React, { useMemo, useState, useContext, useEffect, forwardRef } from 'react';
import { useControllableValue, useDebounceEffect } from 'ahooks';
import { Tabs, Table, Input, Select, Row, Col, Cascader } from 'antd';
import { MinusCircleOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';

import { randomString } from '@/common/utils';

import { WidgetContext } from '../../WidgetProvider';

import styles from './index.less';

const { Option, OptGroup } = Select;

const getDefaultField = (o?: any): any => ({
  key: randomString(4),
  name: '',
  value: '',
  ...o,
});

const defaultValue = [
  {
    type: 'query',
    values: [],
  },
  {
    type: 'header',
    values: [],
  },
  {
    type: 'body',
    values: [],
  },
  {
    type: 'template',
    values: '',
  },
];

const HttpRequest:React.FC<any> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const [curValue, setCurValue] = useControllableValue<any[]>(props, {
    defaultValue: [],
  });

  const inputFiles = [];
  const inputFields: any[] = [];

  const readOnly = widgetType === 'view';

  const [bodyType, setBodyType] = useState<'json' | 'file'>('json'); //or file
  const [tableScroll, setTableScroll] = useState<{
    x: true | string | number;
    y: number;
  }>({
    x: true,
    y: 100,
  });
  const { size } = useContext(WidgetContext);

  const currentTemplate = useMemo(() => {
    if (curValue) {
      const tplItem = _.find(curValue, (item) => item.type === 'template');
      return tplItem?.values || '';
    }
    return '';
  }, [curValue]);

  useEffect(() => {
    if (!curValue) {
      setCurValue([...defaultValue]);
    }
  }, [curValue]);

  useDebounceEffect(
    () => {
      if (size?.height) {
        setTableScroll({
          x: size.width - 80,
          y: size.height - 160,
        });
      }
    },
    [size],
    {
      wait: 100,
    },
  );

  const getOptionList = useMemo(
    () => (
      <>
        {_.map(inputFields, (group) => (
          <OptGroup key={group.nodeKey} label={group.nodeName}>
            {_.map(group.fields, (field) => {
              const v = [group.nodeKey, field.type, '${' + field.value + '}'].join('$$');
              return (
                <Option key={v} value={v}>
                  {field.label}
                </Option>
              );
            })}
          </OptGroup>
        ))}
      </>
    ),
    [inputFields],
  );

  const changeListItem =
    (field: string, type: string, index: number) => (event, selectedOptions?) => {
      const curItem = _.find(curValue, (item) => item.type === type);
      if (curItem) {
        const values = curItem.values || [];

        if (field === 'inputType') {
          const curType = values[index][field];
          values[index][field] = curType === 'select' ? 'input' : 'select';
        } else {
          if (_.isString(event)) {
            const _values = event.split('$$');
            values[index]['nodeKey'] = _values[0];
            values[index]['valueType'] = _values[1];
            values[index]['value'] = _values[2];
          } else if (event.target) {
            values[index][field] = event.target.value;
          } else if (_.isArray(event) && selectedOptions) {
            values[index][field] = '${' + event[0] + '.' + event[1] + '}';
          }
        }

        curItem.values = [].concat(values);

        setCurValue([...curValue]);
      }
    };

  const addListItem = (type: string) => () => {
    const curItem = _.find(curValue, (item) => item.type === type);
    if (curItem) {
      const values = curItem.values || [];
      const defaultData = getDefaultField();

      if (type === 'body') {
        defaultData.code = bodyType;
        if (bodyType === 'file') {
          defaultData.valueType = 'STRING';
        }
      }

      values.push(defaultData);

      curItem.values = [].concat(values);

      setCurValue([...curValue]);
    }
  };

  const deleteListItem = (type: string, index: number) => () => {
    const curItem = _.find(curValue, (item) => item.type === type);
    if (curItem) {
      const values = curItem.values || [];
      values.splice(index, 1);

      curItem.values = [].concat(values);

      setCurValue([...curValue]);
    }
  };

  const renderTplContent = () => {
    const dataSource = _.find(curValue, (item) => item.type === 'template');

    return (
      <Input.TextArea
        value={dataSource?.values}
        onChange={(event) => {
          dataSource.values = event.target.value;
          setCurValue([...curValue]);
        }}
      />
    );
  };

  const renderContent = (type: string) => {
    const columns = [
      {
        key: 'name',
        title: '字段',
        // width: 100,
        dataIndex: 'name',
        render: (value, record: any, index: number) => {
          return (
            <Input
              size="small"
              value={value}
              style={{ width: '100%' }}
              placeholder="请输入"
              disabled={readOnly}
              onChange={changeListItem('name', type, index)}
            />
          );
        },
      },
      {
        key: 'value',
        title: '值',
        // width: 100,
        dataIndex: 'value',
        render: (value, record: any, index: number) => {
          if (record.inputType === 'select' || (type === 'body' && bodyType === 'file')) {
            let itemValue;

            if (bodyType === 'file') {
              if (record.value) {
                itemValue = (record.value || '').replace(/\$|\{|\}/g, '');
                itemValue = itemValue.split('.');
              }
              return (
                <Cascader
                  allowClear
                  size="small"
                  value={itemValue}
                  options={inputFiles}
                  placeholder="请选择"
                  disabled={readOnly}
                  style={{ width: '100%' }}
                  onChange={changeListItem('value', type, index)}
                />
              );
            }

            if (record.value && record.nodeKey && record.valueType) {
              itemValue = [record.nodeKey, record.valueType, record.value].join('$$');
            }

            return (
              <Select
                allowClear
                size="small"
                value={itemValue}
                placeholder="请选择"
                disabled={readOnly}
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={false}
                onChange={changeListItem('value', type, index)}
              >
                {getOptionList}
              </Select>
            );
          }
          return (
            <Input
              size="small"
              value={value}
              style={{ width: '100%' }}
              placeholder="请输入"
              disabled={readOnly}
              onChange={changeListItem('value', type, index)}
            />
          );
        },
      },
    ];

    if (!readOnly) {
      columns.push({
        key: 'action',
        title: () => (
          <span
            className={cls('b-button', {
              disabled: !!currentTemplate && type === 'body',
              // disabled: ((!!currentTemplate && bodyType === 'json') && type === 'body')
            })}
            onClick={addListItem(type)}
          >
            <PlusOutlined /> 新增
          </span>
        ),
        width: 70,
        align: 'center',
        dataIndex: 'key',
        render: (value, record: any, index: number) => {
          return (
            <Row align="middle" justify="center" gutter={8}>
              {(type !== 'body' || bodyType !== 'file') && (
                <Col>
                  <span
                    className={cls('g-button')}
                    onClick={changeListItem('inputType', type, index)}
                  >
                    <SyncOutlined />
                  </span>
                </Col>
              )}
              <Col>
                <span
                  className={cls('g-button', {
                    disabled: !!record.from,
                  })}
                  onClick={deleteListItem(type, index)}
                >
                  <MinusCircleOutlined />
                </span>
              </Col>
            </Row>
          );
        },
      });
    }

    const dataSource = _.find(curValue, (item) => item.type === type);
    let dataSourceValues = dataSource?.values || [];

    if (type === 'body') {
      dataSourceValues = _.filter(dataSourceValues, (item) => {
        if (item.code) {
          return item.code === bodyType;
        } else {
          return bodyType === 'json';
        }
      });
    }

    const scroll = {
      ...tableScroll,
    };

    if (type === 'body') {
      scroll.y -= 40;
    }

    return (
      <div>
        {type === 'body' && (
          <div className={styles.typesWrapper}>
            {['json', 'file'].map((t) => (
              <div
                key={t}
                className={cls(styles.typeItem, { [styles.active]: t === bodyType })}
                onClick={() => setBodyType(bodyType === 'json' ? 'file' : 'json')}
              >
                {t === 'json' ? 'JSON' : '文件'}
              </div>
            ))}
          </div>
        )}
        <Table
          key={type}
          size="small"
          rowKey="key"
          scroll={scroll}
          // @ts-ignore
          columns={columns}
          pagination={false}
          dataSource={dataSourceValues}
        />
      </div>
    );
  };

  const tabItems = [
    {
      key: 'query',
      label: '请求参数',
      children: renderContent('query'),
    },
    {
      key: 'header',
      label: '请求头',
      children: renderContent('header'),
    },
    {
      key: 'body',
      label: '请求体',
      children: renderContent('body'),
    },
    {
      key: 'template',
      label: '请求体模板',
      children: renderTplContent(),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <Tabs size="small" items={tabItems} />
    </div>
  );
})

export default HttpRequest
