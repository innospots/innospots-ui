import _ from 'lodash'
import React from 'react'

import {KeyValues} from '@/common/types/Types'

import { RenderViewMap } from './views'

import './style.less'

const DataContent:React.FC<{
  dataSource: KeyValues
  extData?: KeyValues
}> = ({ extData, dataSource }) => {
  const { viewType, data } = dataSource
  const renderContent = () => {
    let content
    const extProps = extData?.[viewType] || {}
    const RenderView = RenderViewMap[viewType]

    if (RenderView) {
      content = <RenderView dataSource={dataSource} extProps={extProps} />
    } else {
      content = _.isObject(data) ? JSON.stringify(data) : data
    }

    return (
      <div className={`data-content dc-${viewType}`}>
        { content }
      </div>
    )
  }

  return renderContent()
}

export default DataContent