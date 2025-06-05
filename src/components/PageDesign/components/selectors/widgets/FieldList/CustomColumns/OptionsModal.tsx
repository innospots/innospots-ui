import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Table, Input } from 'antd';
import {DeleteOutlined} from '@ant-design/icons';

import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';
import {randomString} from '@/common/utils';

export const MODAL_NAME = 'OptionsModal';

const OptionsModal = ({ onComplete }) => {
  const curIndex = useRef()
  const [options, setOptions] = useState<any[]>([])
  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, initValues } = modalInfo;

  const tableScroll = {
    x: 520,
    y: 200
  }

  useEffect(() => {
    if (initValues) {
      curIndex.current = initValues.index
      setOptions([].concat(initValues.options || []))
    }
  }, [ initValues ])

  const handleComplete = () => {
    onComplete?.({
      options,
      index: curIndex.current
    })
  }

  const addNewOption = () => {
    const ops = options || [];
    ops.push({
      key: randomString(4),
    });
    setOptions([].concat(ops));
  };

  const deleteOption = (index) => () => {
    const ops = options || [];
    ops.splice(index, 1);
    setOptions([].concat(ops));
  };

  const changeOption = (index, type) => (event) => {
    const ops = options || [];
    ops[index][type] = event.target.value;
    setOptions(_.cloneDeep(ops));
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'label',
        title: '名称',
        dataIndex: 'label',
        render: (text, record, index) => {
          return (
            <Input
              value={text}
              size="small"
              style={{ width: '100%' }}
              placeholder="请输入"
              onChange={changeOption(index, 'label')}
            />
          )
        },
      },
      {
        key: 'value',
        title: '值',
        dataIndex: 'value',
        render: (text, record, index) => {
          return (
            <Input
              size="small"
              value={text}
              style={{ width: '100%' }}
              placeholder="请输入"
              onChange={changeOption(index, 'value')}
            />
          )
        },
      },
      {
        key: 'action',
        title: () => (
          <span className="b-button" onClick={addNewOption}>
            +新增
          </span>
        ),
        dataIndex: 'action',
        width: 60,
        align: 'center',
        render: (text, record, index) => (
          <span className="g-button" onClick={deleteOption(index)}>
            <DeleteOutlined />
          </span>
        ),
      }
    ];

    return cols
  }, [options]);

  return (
    <NiceModal
      simple
      width={600}
      destroyOnClose
      visible={visible}
      title="编辑选项"
      onCancel={modal.hide}
      onOk={handleComplete}
    >
      <Table
        size="small"
        scroll={tableScroll}
        pagination={false}
        columns={columns}
        dataSource={options}
      />
    </NiceModal>
  )
}

export default OptionsModal