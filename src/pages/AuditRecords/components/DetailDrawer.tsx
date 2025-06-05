import React from 'react';
import { Drawer, Descriptions, Tag } from 'antd';
import { APPROVE_STATUS_TYPES } from '../index';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

export const DRAWER_NAME = 'ApproveDetailDrawer';

const DetailDrawer: React.FC = () => {
  const { t } = useI18n(['common']);

  const [drawer, drawerInfo] = useModal(DRAWER_NAME);

  const {visible, drawerType, initValues = {}} = drawerInfo;

  return (
    <Drawer
      width={600}
      closable
      open={visible}
      onClose={drawer.hide}
      title="审批详情"
    >
      <Descriptions column={1}>
        <Descriptions.Item label="审批编号">{initValues?.approveId}</Descriptions.Item>
        <Descriptions.Item label="审批类型">{initValues?.approveType}</Descriptions.Item>
        <Descriptions.Item label="审批状态">
          {initValues?.approveStatus && (
            <Tag
              color={APPROVE_STATUS_TYPES[initValues.approveStatus].bgColor}
              style={{color: APPROVE_STATUS_TYPES[initValues.approveStatus].color}}
            >
              {t(APPROVE_STATUS_TYPES[initValues.approveStatus].text)}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="发起时间">{initValues?.createdTime}</Descriptions.Item>
        <Descriptions.Item label="发起人">{initValues?.createdUser}</Descriptions.Item>
        <Descriptions.Item label="审批人">{initValues?.approveUser}</Descriptions.Item>
        <Descriptions.Item label="审批时间">{initValues?.approveTime}</Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default DetailDrawer;
