import React, {useMemo} from 'react'
import {useControllableValue} from 'ahooks'
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {Table, Input, Select, Row, Col, Checkbox} from 'antd'

import {randomString} from '@/common/utils';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import OptionsModal, { MODAL_NAME } from './OptionsModal'

import styles from '@/components/PageDesign/components/selectors/style.less';

const INPUT_TYPES = [{
  value: 'INPUT',
  label: 'Input'
}, {
  value: 'SELECT',
  label: 'Select'
}, {
  value: 'FIELD',
  label: 'Field'
}, {
  value: 'NUMBER',
  label: 'Number'
}]

const getDefaultField = (o?: any): any => {
  const key = randomString(4);
  return {
    code: 'code',
    type: 'INPUT',
    title: 'title',
    width: 'auto',
    rowKey: key,
    ...o
  };
};

const CustomColumns: React.FC = (props) => {
  const {t} = useI18n(['common']);
  const [optionsModal] = useModal(MODAL_NAME);
  const [value, setValue] = useControllableValue<any[]>(props, {
    defaultValue: []
  })

  const fieldChange = (type: string, index: number) => (event: any) => {
    let val = event.target ? event.target.value : event
    if (type === 'required') {
      val = event.target.checked
    }
    value[index][type] = val
    setValue([
      ...value
    ])
  }

  const columnRender = (col: string) => (text: any, record: any, index: number) => {
    let el: any
    switch (col) {
      case 'type':
        el = (
          <Select size="small" value={text} options={INPUT_TYPES} placeholder={t('common.select.placeholder')} onChange={fieldChange(col, index)}/>
        )
        break

      case 'required':
        el = (
          <Checkbox checked={text} onChange={fieldChange(col, index)}/>
        )
        break
      case 'options':
        el = record.type === 'SELECT' ? (
          <Row gutter={8} align="middle">
            <Col flex="112px">
              <Select size="small" options={text} placeholder={t('common.select.placeholder')} style={{width: '112px'}}/>
            </Col>
            <Col flex="auto">
              <span className="b-button" onClick={() => optionsModal.show({
                index,
                options: text
              })}>
                <EditOutlined />
              </span>
            </Col>
          </Row>
        ) : '-'
        break
      case 'action':
        el = (
          <span
            className="g-button"
            onClick={() => {
              value.splice(index, 1);
              setValue([...value]);
            }}
          >
            <DeleteOutlined/>
          </span>
        )
        break

      default:
        if (col === 'default' && record.type === 'SELECT') {
          el = (
            <Select size="small" value={text} options={record.options} placeholder={t('common.select.placeholder')} onChange={fieldChange(col, index)}/>
          )
        } else {
          el = (
            <Input size="small" value={text} placeholder={t('common.input.placeholder')}
                   onChange={fieldChange(col, index)}/>
          )
        }
        break
    }

    return el
  }

  const columns = useMemo(() => {
    return [{
      key: 'code',
      width: 100,
      title: '标识',
      dataIndex: 'code',
      render: columnRender('code')
    }, {
      key: 'title',
      width: 100,
      title: '文字',
      dataIndex: 'title',
      render: columnRender('title')
    }, {
      key: 'type',
      width: 100,
      title: '类型',
      dataIndex: 'type',
      render: columnRender('type')
    }, {
      key: 'width',
      width: 100,
      title: '宽度',
      dataIndex: 'width',
      render: columnRender('width')
    }, {
      key: 'default',
      width: 100,
      title: '默认值',
      dataIndex: 'default',
      render: columnRender('default')
    }, {
      key: 'options',
      width: 160,
      title: '选项',
      dataIndex: 'options',
      render: columnRender('options')
    }, 
    // {
    //   key: 'required',
    //   width: 80,
    //   title: '必填',
    //   dataIndex: 'required',
    //   render: columnRender('required')
    // }, 
    {
      key: 'action',
      width: 50,
      title: '操作',
      fixed: 'right',
      align: 'center',
      dataIndex: 'action',
      render: columnRender('action')
    }]
  }, [value, t])
  const tableScroll = {
    x: 200,
    y: 140
  }

  const addField = () => {
    const fields = value || []
    fields.push(getDefaultField())
    setValue([
      ...fields
    ])
  }

  const handleOptionsComplete = (optionsValue: any) => {
    const fields = value || []
    if (fields[optionsValue.index]) {
      fields[optionsValue.index].options = optionsValue.options
      setValue([
        ...fields
      ])
    }
    optionsModal.hide()
  }

  return (
    <div>
      <div className={styles.expandBtn}>
        <span className="b-button" onClick={addField}>
          + {t('common.button.add')}
        </span>
      </div>
      <Table size="small" rowKey="rowKey" pagination={false} scroll={tableScroll} columns={columns} dataSource={value}/>
      <OptionsModal onComplete={handleOptionsComplete} />
    </div>
  )
}

export default CustomColumns