import React, { useEffect, useState } from 'react'
import { Select, SelectProps } from 'antd'

import { useDeepCompareEffect } from 'ahooks'

import { SettingFormItemProps } from '../../types'

const DataFieldSelect:React.FC<SettingFormItemProps & SelectProps> = ({ value, onChange, ...rest }) => {

  const triggerChange = (newValue) => {
    onChange?.({
      ...value,
      ...newValue
    })
  }

  const renderDataSelect = () => {
    return (
      <Select
        style={{width: '100%'}}
        placeholder="请选择数据库表字段"
        dropdownMatchSelectWidth={false}
        { ...rest }
      />
    )
  }

  return (
    <div>
      { renderDataSelect() }
    </div>
  )
}

export default DataFieldSelect