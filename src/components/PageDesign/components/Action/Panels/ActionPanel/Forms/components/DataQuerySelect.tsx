import React, { useEffect, useState } from 'react'
import {Menu, Select, Button, Divider, Input, Pagination, Dropdown} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { SettingFormItemProps } from '../../types'

import styles from '../../style.less'

const DataQuerySelect:React.FC<SettingFormItemProps> = ({ value, onChange }) => {

  const triggerChange = (newValue) => {
    onChange?.({
      ...value,
      ...newValue
    })
  }

  const renderSelectTable = () => {
    const items = [{
      key: '1',
      label: '电子商务系统',
      icon: '',
      children: [{
        key: '12',
        label: 'customers'
      }]
    }, {
      key: '2',
      label: '仓库管理系统',
      icon: '',
      children: [{
        key: '22',
        label: 'customers'
      }]
    }]
    const dropdownItems = [
      {
        key: '1',
        label: '新建SQL查询',
      },
      {
        key: '2',
        label: '新建HTTP查询',
      },
      {
        key: '3',
        label: '新建工作流查询',
      },
    ];
    return (
      <div className={styles.container}>
        <div><Input placeholder="请输入表名" /></div>
        <div className={styles.menuList}>
          <Menu
            mode="vertical"
            items={items}
            style={{border: 0}}
          />
        </div>
        <div>
          <Pagination simple size="small" total={50} />
        </div>
        <Divider style={{margin: '8px 0'}} />
        <div>
          <Dropdown menu={{
            items: dropdownItems
          }}>
            <Button
              block
              type="text"
              icon={<PlusOutlined />}
            >新建查询</Button>
          </Dropdown>
        </div>
      </div>
    )
  }

  const renderDataSelect = () => {
    return (
      <Select
        style={{width: '100%'}}
        placeholder="请选择关联查询"
        dropdownMatchSelectWidth={false}
        dropdownRender={renderSelectTable}
      />
    )
  }

  return (
    <div>
      { renderDataSelect() }
    </div>
  )
}

export default DataQuerySelect