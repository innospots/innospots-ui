import React from 'react'
import { Typography } from 'antd'

import {KeyValues} from '@/common/types/Types'

import DataContent from '../components/DataContent'

const { Title, Paragraph } = Typography;

const DetailContent:React.FC<{
  dataSource: KeyValues
}> = ({ dataSource }) => {

  const { data, title, viewType, description } = dataSource

  const renderContent = () => {
    if (!['text', 'normal'].includes(viewType)) {
      return (
        <DataContent dataSource={dataSource} />
      )
    }

    return (
      <Paragraph>
        { data }
      </Paragraph>
    )
  }

  const renderMainContent = () => {
    return (
      <div>
        {
          title && (
            <Title level={4}>{ title }</Title>
          )
        }
        {
          description && (
            <Paragraph type="secondary">
              { description }
            </Paragraph>
          )
        }
        <div className={`data-content-${viewType}`}>
          { renderContent() }
        </div>
      </div>
    )
  }

  return renderMainContent()
}

export default DetailContent