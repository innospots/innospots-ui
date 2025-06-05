import React, { useEffect } from 'react';
import { Space, message } from 'antd';
import { useModel } from 'umi';
import { useSetState } from 'ahooks';
import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import { KeyValues } from '@/common/types/Types';
import PageTitle from '@/components/PageTitle';
import ListTable from '@/components/ListTable';
import IconButton from '@/components/IconButton';
import PageLoading from '@/components/PageLoading';

import { DEFAULT_PAGINATION_SETTINGS } from '@/common/constants';

import DictionaryDrawer, { DRAWER_NAME } from './components/DictionaryDrawer';

const SysDictionary: React.FC = () => {
  const { t, loading } = useI18n(['sysDictionary', 'common']);
  const [drawer] = useModal(DRAWER_NAME);

  const {
    dictionaryData,
    dictionaryTypePageRequest,
    deleteDictionaryTypeRequest,
  } = useModel('SysDictionary', (model) => ({
    dictionaryData: model.dictionaryData,
    dictionaryTypePageRequest: model.dictionaryTypePageRequest,
    deleteDictionaryTypeRequest: model.deleteDictionaryTypeRequest,
  }));

  const [queryData, setQueryData] = useSetState({
    ...DEFAULT_PAGINATION_SETTINGS
  });

  useEffect(() => {
    loadData();
  }, [queryData]);

  const loadData = () => {
    dictionaryTypePageRequest.run(queryData);
  };

  const handleDelete = async (type: string) => {
    try {
      await deleteDictionaryTypeRequest.runAsync(type);
      message.success(t('common.message.delete_success'));
      loadData();
    } catch (error) {
      message.error(t('common.message.delete_failed'));
    }
  };

  const columns: KeyValues[] = [
    {
      title: t('sysDictionary.column.type'),
      dataIndex: 'type',
    },
    {
      title: t('sysDictionary.column.type_name'),
      dataIndex: 'typeName',
    },
    {
      title: t('common.table.column.action'),
      width: 110,
      key: 'action',
      fixed: 'right',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <Space>
            <IconButton
              icon="eye"
              tooltip={t('common.tooltip.view')}
              onClick={() => drawer.show({ initValues: record, modalType: 'view' })}
            />
            <IconButton
              icon="edit"
              tooltip={t('common.tooltip.edit')}
              onClick={() => drawer.show({ initValues: record, modalType: 'edit' })}
            />
            <IconButton
              icon="delete"
              tooltip={t('common.tooltip.delete')}
              popConfirm={{
                placement: 'topRight',
                title: t('common.text.delete_confirmation'),
                onConfirm: () => handleDelete(record.type)
              }}
            />
          </Space>
        );
      },
    },
  ];

  const renderPageHeader = () => {
    return (
      <PageTitle
        title={t('sysDictionary.main.heading_title')}
        rightContent={{
          // search: {
          //   placeholder: t('common.input.search.label'),
          //   onSearch: (value: string) => {
          //     setQueryData({
          //       ...queryData,
          //       page: 1,
          //       queryInput: value
          //     });
          //   },
          // },
          button: {
            label: t('common.button.create'),
            onClick: () => drawer.show(),
          },
        }}
      />
    );
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div>
      {renderPageHeader()}
      <ListTable
        rowKey="type"
        columns={columns}
        loading={dictionaryTypePageRequest.loading}
        dataSource={dictionaryData.list || []}
        scroll={{ x: 'max-content' }}
        pagination={{
          total: dictionaryData.pagination?.total,
          current: queryData.page,
          pageSize: queryData.size,
          onChange: (page: number, size: number) => {
            setQueryData({ 
              ...queryData,
              page, 
              size });
          },
        }}
      />
      <DictionaryDrawer onSuccess={loadData} />
    </div>
  );
};

export default SysDictionary;