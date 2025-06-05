import _ from 'lodash'
import { useModel } from 'umi';
import React from 'react'
import { Menu, Select, Button, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import useI18n from '@/common/hooks/useI18n';

import { SettingFormItemProps } from '../../types'

import styles from '../../style.less'

const DataSourceSelect:React.FC<SettingFormItemProps> = ({ value, onChange }) => {
  const { t } = useI18n(['app', 'common'])
  const { currentAppInfo } = useModel('App', (model) => ({
    currentAppInfo: model.currentAppInfo
  }));
  const registries = currentAppInfo?.resources?.registries || []

  const triggerChange = (newValue) => {
    onChange?.(newValue)
  }

  const handleSelectChange = (value, option) => {
    triggerChange(option)
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
    return (
      <div className={styles.container}>
        <div className={styles.menuList}>
          <Menu
            mode="vertical"
            items={items}
            style={{border: 0}}
          />
        </div>
        <Divider style={{marginBottom: 8}} />
        <div>
          <Button
            block
            type="text"
            icon={<PlusOutlined />}
          >新建数据源</Button>
        </div>
      </div>
    )
  }

  const renderDataSelect = () => {
    return (
      <Select
        style={{width: '100%'}}
        value={value?.value || value?.registryId}
        options={registries}
        fieldNames={{
          label: 'name',
          value: 'registryId',
        }}
        placeholder={t('app.setting.select_table')}
        dropdownMatchSelectWidth={false}
        onChange={handleSelectChange}
        // dropdownRender={renderSelectTable}
      />
    )
  }

  return (
    <div>
      { renderDataSelect() }
    </div>
  )
}

export default DataSourceSelect