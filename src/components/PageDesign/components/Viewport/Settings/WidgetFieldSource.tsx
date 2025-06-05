import _ from 'lodash'
import { useModel } from 'umi'
import { Select } from 'antd'
import React, { useMemo } from 'react'

import { SettingItem } from './index';

export const WidgetFieldSource: React.FC = () => {
  const {
    nodeInfo
  } = useModel('FlowNode')
  const inPorts = _.get(nodeInfo, 'resources.inPorts');
  const options = useMemo(() => _.map(inPorts, (p, i) => ({
    value: p.id,
    label: `Input${i + 1}`
  })), [ inPorts ])

  return (
    <SettingItem
      name={['settings', 'fieldSource']}
      label="字段来源"
    >
      <Select allowClear options={options} placeholder="请选择字段来源" />
    </SettingItem>
  )
}
