import React, { useMemo, useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Dropdown, Menu, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';

interface VersionListProps {
  templateCode: string;
  workflowInstanceId: string;
}

const VersionList: React.FC<VersionListProps> = ({
  templateCode,
  workflowInstanceId,
}) => {
  const { workflowRevisions, fetchWorkflowRevisionsRequest, workflowVersion, setWorkflowVersion } = useModel('Workflow', (model) => ({
    workflowRevisions: model.workflowRevisions,
    fetchWorkflowRevisionsRequest: model.fetchWorkflowRevisionsRequest,
    workflowVersion: model.workflowVersion,
    setWorkflowVersion: model.setWorkflowVersion,
  }));

  const { t } = useI18n(['workflow']);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    setSelectedKeys([workflowVersion + '']);
  }, [workflowVersion]);

  useEffect(() => {
    if (templateCode && workflowInstanceId) {
      fetchWorkflowRevisionsRequest.run(templateCode, workflowInstanceId);
    }
  }, [templateCode, workflowInstanceId]);

  const handleSelect = ({ key }) => {
    setWorkflowVersion(key);
  };

  const menuItems = useMemo(() => {
    if (!workflowRevisions) {
      return [];
    }

    const historyVersions = workflowRevisions
      .filter((item) => !item.online)
      .map((item) => ({
        key: item.revision + '',
        label: t('workflow.history.version', {
          version: item.revision,
        }),
      }));
    const items: any[] = [
      {
        key: '0',
        label: t('workflow.version.draft'),
      },
    ];

    const cv = workflowRevisions.find((item) => item.online);
    if (cv) {
      items.unshift({
        key: cv.revision + '',
        label: t('workflow.online.version', {
          version: cv.revision,
        }),
      });
    }

    if (historyVersions.length > 0) {
      items.push({
        type: 'divider',
      });
    }

    return items.concat(historyVersions);
  }, [workflowRevisions]);

  const menu = useMemo(() => {
    return {
      items: menuItems,
      selectedKeys,
      onClick: handleSelect,
    };
  }, [menuItems, selectedKeys]);

  const renderButtonText = useMemo(() => {
    if (workflowVersion == 0) {
      return t('workflow.version.draft');
    }

    const cv = workflowRevisions.find((item) => item.online && item.revision == workflowVersion);
    if (cv) {
      return t('workflow.online.version', { version: cv.revision });
    }

    return t('workflow.history.version', { version: workflowVersion });
  }, [workflowVersion, workflowRevisions]);

  const loading = fetchWorkflowRevisionsRequest.loading;

  if (loading) {
    return <Button loading />;
  }

  return (
    <Dropdown menu={menu}>
      <Button loading={loading} style={{ minWidth: 120 }}>
        <Space>
          {renderButtonText}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default VersionList;
