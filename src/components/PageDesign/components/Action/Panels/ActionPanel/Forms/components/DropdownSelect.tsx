import React, { useMemo } from 'react'
import { Row, Col, Button, Dropdown, Space, MenuProps } from 'antd'
import { DownOutlined } from '@ant-design/icons'

import { SettingFormItemProps } from '../../types'

const DropdownSelect:React.FC<SettingFormItemProps & {
  items: MenuProps['items']
}> = ({ value, items, onChange }) => {

  const currentItem = useMemo(() => items?.find(item => item?.key === value), [ value, items ]) as any

  const handleMenuClick = ({ item, key }) => {
    onChange?.(key)
  }

  return (
    <Dropdown menu={{
      items,
      onClick: handleMenuClick
    }}>
      <Button style={{width: '100%'}}>
        <Row justify="space-between">
          <Col>
            { currentItem?.label || <span style={{color: '#bfbfbf'}}>请选择</span> }
          </Col>
          <Col>
            <DownOutlined />
          </Col>
        </Row>
      </Button>
    </Dropdown>
  )
}

export default DropdownSelect