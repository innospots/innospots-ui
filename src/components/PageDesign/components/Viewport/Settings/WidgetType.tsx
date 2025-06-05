import _ from 'lodash'
import React, { useMemo } from 'react'
import { Row, Col } from 'antd'

import { ALL_WIDGETS } from '@/components/PageDesign/components/selectors'

import { SettingItem } from './index';

const WidgetTypeItem:React.FC<any> = ({ value }) => {
  const WidgetData = useMemo(() => _.find(ALL_WIDGETS, w => (w.name === value)), [ value ])

  return WidgetData ? (
    <Row gutter={8}>
      <Col><WidgetData.Icon /></Col>
      <Col>{ WidgetData.title }</Col>
      <Col>-</Col>
      <Col>{ WidgetData.name }</Col>
    </Row>
  ) : (
    <span>-</span>
  )
}

export const WidgetTypeSetting: React.FC = () => {

  return (
    <SettingItem
      name="type"
      label="组件类型"
    >
      <WidgetTypeItem />
    </SettingItem>
  )
}
