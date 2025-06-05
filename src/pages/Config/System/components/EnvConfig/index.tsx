import _ from 'lodash';
import { useState, useEffect } from 'react';
import { Row, Col, Divider, Table, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import IconButton from '@/components/IconButton';
import { fetchEnvConfigs, deleteEnvConfig } from '@/services/Setting';

import EnvModal, { MODAL_NAME } from './EnvModal';

import styles from './style.less';

const EnvConfig: React.FC = () => {
  const { t } = useI18n(['configuration', 'system', 'common']);

  const [envConfigs, setEnvConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [modal] = useModal(MODAL_NAME);

  useEffect(() => {
    getEnvConfigs();
  }, []);

  const getEnvConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetchEnvConfigs();
      setEnvConfigs(res);
    } finally {
      setLoading(false);
    }
  };

  const deleteListItem = (code: string) => () => {
    return new Promise<void>(async (resolve) => {
      setDeleteLoading(true);
      await deleteEnvConfig(code);
      getEnvConfigs();
      resolve();
      setDeleteLoading(false);
    });
  };

  const renderEnvConfigs = () => {
    const columns = [
      {
        title: t('system.env.table.column_name'),
        dataIndex: 'name',
      },
      {
        title: t('system.env.table.column_code'),
        dataIndex: 'code',
      },
      {
        title: t('system.env.table.column_type'),
        dataIndex: 'type',
        render: (text: string) => {
          return _.upperFirst(text);
        },
      },
      {
        title: t('system.env.table.column_value'),
        dataIndex: 'value',
      },
      {
        title: t('common.table.column.action'),
        width: 100,
        align: 'center',
        dataIndex: 'operate',
        render: (text: string, record: any) => (
          <>
          <IconButton
            icon="edit"
            tooltip={t('common.tooltip.edit')}
            permissions=""
            onClick={() => modal.show(record)}
          />
          <IconButton
            icon="delete"
            tooltip={t('common.tooltip.delete')}
            popConfirm={{
              title: t('common.text.delete_confirmation'),
              placement: 'left',
              okButtonProps: {
                loading: deleteLoading,
              },
                onConfirm: deleteListItem(record.code),
              }}
            />
          </>
        ),
      },
    ];

    return (
      <Table
        rowKey="code"
        dataSource={envConfigs}
        columns={columns}
        loading={loading}
        pagination={false}
      />
    );
  };

  return (
    <div className={styles.envConfigDiv}>
      <Row justify="space-between" align="bottom">
        <Col>
          <h2>{t('configuration.form.tab.env.title')}</h2>
          <span>{t('configuration.form.tab.env.subtitle')}</span>
        </Col>
        <Col>
          <Button type="primary" onClick={() => modal.show()} icon={<PlusOutlined />}>
            {t('configuration.form.tab.env.button')}
          </Button>
        </Col>
      </Row>
      <Divider />
      {renderEnvConfigs()}
      <EnvModal onSuccess={getEnvConfigs} />
    </div>
  );
};

export default EnvConfig;
