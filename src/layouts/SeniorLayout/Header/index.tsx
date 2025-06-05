import { Breadcrumb, BreadcrumbProps, Flex } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';

import RightContent from '@/components/RightContent';

import styles from './style.less';

const Header: React.FC<{
  breadcrumbItems: BreadcrumbProps['items'];
}> = ({ breadcrumbItems }) => {

  const newBreadcrumbItems = useMemo(() => {
    const items: any[] = [
      {
        title: <HomeOutlined />,
      },
    ];
    return items.concat(breadcrumbItems);
  }, [breadcrumbItems]);

  return (
    <>
      <header className={styles.header}>
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <Breadcrumb separator=">" items={newBreadcrumbItems} />
          <RightContent />
        </Flex>
      </header>
      <div className={styles.headerBlock} />
    </>
  );
};

export default Header;
