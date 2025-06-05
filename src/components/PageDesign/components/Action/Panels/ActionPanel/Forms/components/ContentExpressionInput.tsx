import React from 'react'

import { InputProps } from 'antd'

import { ExpressionInput } from '@/components/Expression'
import { SettingFormItemProps } from '../../types'

const ContentExpressionInput:React.FC<SettingFormItemProps & InputProps> = (props) => {

  return (
    <ExpressionInput { ...props } />
  )
}

export default ContentExpressionInput