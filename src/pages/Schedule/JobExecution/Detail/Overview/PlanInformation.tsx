import React from 'react';
import { Badge, Space, Descriptions } from 'antd';

import { STATUS_TAG_COLORS } from '@/components/StatusTag';

import styles from '../styles.less';

const PlanInformation: React.FC<{
  data: any
}> = ({ data }) => {
  
  return (
    <div className={styles.planInformation}>
      
      <Descriptions title="Schedule Plan Information">
        <Descriptions.Item label="Start Time">{data.startTime}</Descriptions.Item>
        <Descriptions.Item label="End Time">{data.endTime}</Descriptions.Item>
        <Descriptions.Item label="Failed Count">{data.failCount}</Descriptions.Item>
        <Descriptions.Item label="Execution Status">
          <Space>
            <Badge color={STATUS_TAG_COLORS[data.executionStatus]?.color} />
            <span>{data.executionStatus}</span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Success Count">{data.successCount}</Descriptions.Item>
        <Descriptions.Item label="Sub Job Count">{data.subJobCount}</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default PlanInformation;
