import React from 'react';
import {Row, Col, Statistic} from 'antd';
import {FileSearchOutlined, FileSyncOutlined, FileProtectOutlined, SolutionOutlined} from '@ant-design/icons';

import styles from '../styles.less';

const Features: React.FC<{
  data: any
}> = () => {

  return (
    <div className={styles.features}>
      <Row gutter={12} justify="space-between">
        <Col span={6}>
          <div className={styles.cardItem}>
            <div className={styles.cardInner}>
              <Row gutter={12}>
                <Col>
                  <div className={styles.cardIcon}>
                    <FileSearchOutlined />
                  </div>
                </Col>
                <Col>
                  <Statistic title="Schedule Plan" value={100} />
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className={styles.cardItem}>
            <div className={styles.cardInner}>
              <Row gutter={12}>
                <Col>
                  <div className={styles.cardIcon}>
                    <FileSyncOutlined />
                  </div>
                </Col>
                <Col>
                  <Statistic title="Running Number" value={100} />
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className={styles.cardItem}>
            <div className={styles.cardInner}>
              <Row gutter={12}>
                <Col>
                  <div className={styles.cardIcon}>
                    <FileProtectOutlined />
                  </div>
                </Col>
                <Col>
                  <Statistic title="Task Number" value={100} />
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className={styles.cardItem}>
            <div className={styles.cardInner}>
              <Row gutter={12}>
                <Col>
                  <div className={styles.cardIcon}>
                    <SolutionOutlined />
                  </div>
                </Col>
                <Col>
                  <Statistic title="Failure task" value={100} />
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Features;
