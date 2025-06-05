import _ from 'lodash';
import cls from 'classnames';
import { Tabs, Empty, Row, Col } from 'antd';
import React, { useMemo, useState, useEffect } from 'react';

import useModal from '@/common/hooks/useModal';

import DetailModal, { MODAL_NAME as DETAIL_MODAL_NAME } from './DetailModal';

import DataCard from './DataCard';
import DataTable from './DataTable';
import DataContent from './DetailContent';
import ChatListItem from '../components/ChatListItem';

import styles from './style.less';

const DataResult: React.FC<{
  dataSource: any[];
}> = ({ dataSource }) => {
  const [detailModal] = useModal(DETAIL_MODAL_NAME);

  const [currentTab, setCurrentTab] = useState<string>();

  const tabItems = useMemo(
    () =>
      _.map(dataSource, (item) => ({
        key: item.label,
        label: item.label,
      })),
    [dataSource],
  );

  useEffect(() => {
    if (tabItems.length) {
      setCurrentTab(tabItems[0].key);
    }
  }, [tabItems]);

  const showDetail = (dataSource) => () => {
    detailModal.show(dataSource);
  };

  const renderCard = (cardData) => {
    return <DataCard dataSource={cardData} onDetail={showDetail(cardData)} />;
  };

  const renderTable = (tableData) => {
    return <DataTable dataSource={tableData.data} />;
  };

  const renderPage = (pageData) => {
    return <DataContent dataSource={pageData} />;
  };

  const renderChat = (chatData) => {
    return <ChatListItem data={chatData} />;
  };

  const renderTabChildren = () => {
    const item = _.find(dataSource, (d) => d.label === currentTab);

    if (!item) {
      return <Empty />;
    }

    const rows = item.rows || [];
    const layout = (item.layout || 'GRID').toLowerCase();
    const span = 24 / (item.column || 1);
    return (
      <div className={cls(styles.mainContent, `main-content-${layout}`)}>
        {rows.length ? (
          <Row gutter={[12, 12]}>
            {_.map(rows, (row) => {
              let content;

              if (layout === 'page') {
                content = renderPage(row);
              } else if (layout === 'table') {
                content = renderTable(row);
              } else if (layout === 'chat') {
                content = renderChat(row);
              } else {
                content = renderCard(row);
              }

              return (
                <Col key={row.viewId} span={span} className={`tab-col-${layout}`}>
                  {content}
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty />
        )}
      </div>
    );
  };

  const renderTabs = () => {
    return (
      <div className={styles.tabs}>
        <Tabs items={tabItems} activeKey={currentTab} onChange={setCurrentTab} />
      </div>
    )
  };

  return (
    <div className={cls(styles.result, `result-tabs-${tabItems.length}`)}>
      {renderTabs()}
      {renderTabChildren()}
      <DetailModal />
    </div>
  );
};

export default DataResult;
