import React from 'react'

import { SettingItem } from './index';
import { RuleFormItem } from '@/components/PageDesign/components/ValidatorRule'

export const WidgetValidationRule: React.FC = () => {

  return (
    <SettingItem name={['settings', 'validation']} label="验证规则">
      <RuleFormItem />
    </SettingItem>
  )
}
