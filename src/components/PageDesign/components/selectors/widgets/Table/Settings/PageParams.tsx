import React from 'react'
import { Row, Col, Table, Select } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

import styles from './style.less'

const PageParams:React.FC = () => {

  const cols = [{
    title: '变量',
    dataIndex: 'variable'
  }, {
    title: '参数',
    dataIndex: 'parameter',
    render: () => (
      <Select size="small" placeholder="请选择" style={{width: '100%'}} />
    )
  }]

  const dataSource = [{
    variable: 'Page',
    parameter: ''
  }, {
    variable: 'PageSize',
    parameter: ''
  }]

  return (
    <div className={styles.pageParams}>
      <Row justify="end">
        <Col>
          <span className="b-button">
            <SettingOutlined /> 参数设置
          </span>
        </Col>
      </Row>
      <div className={styles.table}>
        <Table
          columns={cols}
          size="small"
          rowKey="variable"
          dataSource={dataSource}
          pagination={false}
        />
      </div>
    </div>
  )
}

export default PageParams