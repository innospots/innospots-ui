import React from 'react';
import {Typography, Image, Row, Col} from 'antd';

import useI18n from '@/common/hooks/useI18n';

import { ViewProps } from './type';

import styles from '../style.less';

const {Text} = Typography;

const getSuffix = (name: string = '') => {
  const fs = name.split('.');
  return (fs[fs.length - 1] || '').toLowerCase();
}

const isImage = (name: string) => {
  const suffix = getSuffix(name);
  return ['png', 'jpg', 'jpeg', 'gif'].includes(suffix)
}

const FileView:React.FC<ViewProps> = ({ dataSource }) => {

  const { t } = useI18n(['workflow', 'common']);
  const { mimeType, title, downloadUrl } = dataSource || {}

  return (
    <div className={styles.file}>
      <div className={styles.fileBlock}>
        <p className={styles.title}>{t('workflow.builder.text.filename')}</p>
        <Text ellipsis className={styles.text} title={title}>
          {title || '-'}
        </Text>
      </div>
      <div className={styles.fileBlock}>
        <Row>
          <Col span={12}>
            <p className={styles.title}>{t('workflow.builder.text.suffix')}</p>
            <Text ellipsis className={styles.text}>
              {getSuffix(downloadUrl) || '-'}
            </Text>
          </Col>
          <Col span={12}>
            <p className={styles.title}>{t('workflow.builder.text.mime')}</p>
            <Text ellipsis className={styles.text} title={mimeType}>
              {mimeType || '-'}
            </Text>
          </Col>
        </Row>
      </div>
      {isImage(downloadUrl) && (
        <div className={styles.fileBox}>
          <Image height="100%" src={downloadUrl} alt={title} />
        </div>
      )}
    </div>
  );
};

export default FileView;
