import React from 'react'

import { SettingItem } from './index';
import { RuleFormItem } from '@/components/PageDesign/components/ConditionRule'

export const WidgetConditionRule: React.FC = () => {

  return (
    <SettingItem name={['settings', 'conditions']} label="联动规则">
      <RuleFormItem />
    </SettingItem>
  )
}
