import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import difference from 'lodash/difference';
import { Table, Transfer, message } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import type { TransferItem, TransferProps } from 'antd/es/transfer';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';
import NiceModal from '@/components/Nice/NiceModal';
import StatusTag, { Status } from '@/components/StatusTag';

import * as UserService from '@/services/User';

export const MODAL_NAME = 'MemberModal';

type DataType = any

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  tableColumns: ColumnsType<DataType>;
}

const TableTransfer = ({ tableColumns, ...restProps }: TableTransferProps) => (
  <Transfer {...restProps}>
    {({
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const rowSelection: TableRowSelection<DataType> = {
        getCheckboxProps: item => ({ disabled: listDisabled || item.disabled }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter(item => !item.disabled)
            .map(({ userId }) => userId);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys as string[], selected);
        },
        onSelect({ userId }, selected) {
          onItemSelect(userId, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          size="small"
          rowKey="userId"
          columns={tableColumns}
          pagination={false}
          rowSelection={rowSelection}
          dataSource={filteredItems}
          scroll={{ x: 300, y: 400 }}
          style={{ pointerEvents: listDisabled ? 'none' : undefined }}
          onRow={({ userId, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(userId, !listSelectedKeys.includes(userId));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const MemberModal: React.FC<{ groupId: string, onSuccess: () => void }> = ({ groupId, onSuccess }) => {
  const { t } = useI18n(['user-group', 'common', 'user']);

  const {
    userData,
    userRequest,
    updateGroupUsersRequest,
  } = useModel('User', (model) => ({
    userData: model.userData,
    userRequest: model.userRequest,
    updateGroupUsersRequest: model.updateGroupUsersRequest,
  }));

  const [currentUserIds, setCurrentUserIds] = useState<string[]>([]);

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible } = modalInfo;

  const fetchGroupUsers = async () => {
    try {
      const result = await UserService.fetchGroupUsers(groupId);
      if (result) {
        setCurrentUserIds(result.map((user: any) => user.userId));
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (visible && groupId) {
      fetchGroupUsers();
      userRequest.run({
        paging: false
      });
    }
  }, [visible, groupId]);

  const handleOk = async () => {
    try {
      const result = await updateGroupUsersRequest.runAsync(groupId, currentUserIds);
      if (result) {
        modal.hide();
        onSuccess();
        message.success(t('common.tips.success'));
      }
    } catch (error) {
    }
  };

  const tableColumns: ColumnsType<DataType> = [
    {
      title: t('user.main.column.name'),
      key: 'realName',
      width: 110,
      fixed: 'left',
      dataIndex: 'realName',
    },
    {
      width: 112,
      title: t('user.main.column.username'),
      key: 'userName',
      dataIndex: 'userName',
    },
    // {
    //   title: t('user.main.column.email'),
    //   key: 'email',
    //   dataIndex: 'email',
    // },
    {
      width: 112,
      title: t('user.main.column.role'),
      dataIndex: ['roleNames', '0'],
      render: (roleName: string) => roleName || '-',
    },
    {
      title: t('user.main.column.status'),
      key: 'status',
      width: 112,
      align: 'center',
      dataIndex: 'status',
      render: (status: Status) => {
        return <StatusTag status={status} />;
      },
    },
  ];

  const handleTransferChange = (targetKeys: string[]) => {
    setCurrentUserIds(targetKeys);
  };

  return (
    <NiceModal
      width={1200}
      title={t(`user-group.member.title`)}
      visible={visible}
      onOk={handleOk}
      onCancel={modal.hide}
      okButtonProps={{
        loading: updateGroupUsersRequest.loading,
      }}
      style={{ top: 40 }}
    >
      <TableTransfer
        dataSource={userData?.list || []}
        targetKeys={currentUserIds}
        disabled={false}
        showSearch={true}
        pagination={{
          ...(userData?.pagination || {}),
        }}
        rowKey={record => record.userId}
        filterOption={(inputValue, item) =>
          item.realName!.indexOf(inputValue) !== -1 || item.userName.indexOf(inputValue) !== -1
        }
        tableColumns={tableColumns}
        onChange={handleTransferChange}
      />
    </NiceModal>
  );
};

export default MemberModal;
