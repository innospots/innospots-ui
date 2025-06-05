import {Typography, Image, Row, Col} from 'antd';

import useI18n from '@/common/hooks/useI18n';

import styles from './style.less';

const {Text} = Typography;

const getSuffix = (name: string = '') => {
  const fs = name.split('.');
  return (fs[fs.length - 1] || '').toLowerCase();
}

const isImage = (name: string) => {
  const suffix = getSuffix(name);
  return ['png', 'jpg', 'jpeg', 'gif'].includes(suffix)
}

const File = ({ dataSource }) => {

  const { t } = useI18n(['workflow', 'common']);
  const { mimeType, resourceUri, resourceName } = dataSource || {}

  return (
    <div style={{ flex: '1' }} className={styles.file}>
      <div className={styles.fileBlock}>
        <p className={styles.title}>{t('workflow.builder.text.filename')}</p>
        <Text ellipsis className={styles.text} title={resourceName}>
          {resourceName || '-'}
        </Text>
      </div>
      <div className={styles.fileBlock}>
        <Row>
          <Col span={12}>
            <p className={styles.title}>{t('workflow.builder.text.suffix')}</p>
            <Text ellipsis className={styles.text}>
              {getSuffix(resourceName) || '-'}
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
      {isImage(resourceName) && (
        <div className={styles.fileBox}>
          <Image height="100%" src={resourceUri} alt={resourceName} />
        </div>
      )}
    </div>
  );
};

export default File;
