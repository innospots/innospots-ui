import React from 'react'
import { Modal } from 'antd'

import useModal from '@/common/hooks/useModal';

import DataContent from './DetailContent'

import styles from './style.less'

export const MODAL_NAME = 'DetailModal';

const DetailModal:React.FC = () => {

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, initValues } = modalInfo;

  const renderMainContent = () => {
    return (
      <div className={styles.detailModalContent}>
        <DataContent dataSource={initValues} />
      </div>
    )
  }

  return (
    <Modal
      width="80%"
      destroyOnClose
      open={visible}
      footer={null}
      onCancel={modal.hide}
    >
      { initValues && renderMainContent() }
    </Modal>
  )
}

export default DetailModal