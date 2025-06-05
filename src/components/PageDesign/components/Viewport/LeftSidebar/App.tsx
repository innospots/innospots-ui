import _ from 'lodash';
import { useModel } from 'umi';
import cls from 'classnames';
import { useState, useMemo, useEffect } from 'react';
import { Row, Col, message, Popconfirm, Dropdown, List, Typography } from 'antd';
import {
  DownOutlined,
  PlusOutlined,
  HomeOutlined,
  DeleteOutlined,
  DownCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';

import useModal from '@/common/hooks/useModal';
import InnoIcon from '@/components/Icons/InnoIcon';
// import HttpDataModal, { MODAL_NAME } from '@/components/HttpDataModal';
// import QueryModal, { MODAL_NAME as QUERY_MODAL } from '@/components/QueryModal';
import AccessDataModal, { MODAL_NAME as ACCESS_MODAL, REGISTRY_TYPES } from '@/components/AccessDataModal';
// import WorkflowDataModal, { MODAL_NAME as WORKFLOW_MODAL } from '@/components/WorkflowDataModal';

import WidgetList from './WidgetList';
import ResourceList from './ResourceList';

import styles from './style.less';
import Tabs from '@/components/PageDesign/components/CustTabs';

const { Paragraph } = Typography;

const SEGMENTED_OPTIONS = [
  { label: '工作流', value: 'EVENT_FLOW' },
  { label: '审批流', value: 'APPROVAL_FLOW' },
  { label: 'API', value: 'API' },
  { label: '数据集', value: 'DATASET' },
];

const itemTabs = [
  {
    key: 'resource',
    label: '应用资源',
  },
  {
    key: 'widgets',
    label: 'UI控件',
  },
];

const AppLeftSidebar = () => {
  const { appState, addNewPage, deletePage, updateAppState } = useModel('AppEditor', (model) => ({
    appState: model.appState,
    addNewPage: model.addNewPage,
    deletePage: model.deletePage,
    updateAppState: model.updateAppState,
  }));

  // const [modal] = useModal(MODAL_NAME);
  // const [queryModal] = useModal(QUERY_MODAL);
  const [accessModal] = useModal(ACCESS_MODAL);
  // const [workflowModal] = useModal(WORKFLOW_MODAL);
  const { currentAppInfo, currentAppType, setCurrentAppInfo } = useModel('App', (model) => ({
    currentAppInfo: model.currentAppInfo,
    currentAppType: model.currentAppType,
    setCurrentAppInfo: model.setCurrentAppInfo,
  }));
  useEffect(() => {
    if (currentAppInfo?.appKey) {
      console.log('currentAppInfo', currentAppInfo);
      // appDatasetRequest.runAsync(currentAppInfo.appKey);
    }
  }, [currentAppInfo?.appKey]);

  const [curTab, setCurTab] = useState(itemTabs[0].key);
  const registries = useMemo<any[]>(
    () => currentAppInfo?.resources?.registries || [],
    [currentAppInfo?.resources?.registries],
  );

  const registryTypes = useMemo(
    () =>
      REGISTRY_TYPES.filter(
        (item) => currentAppInfo?.appType !== 'APPROVAL' || item.key !== 'APPROVAL_FLOW',
      ),
    [currentAppInfo?.appType],
  );

  const changeCurrentPage = (id: string) => () => {
    if (appState.currentPageKey !== id) {
      appState.currentPageKey = id;
      updateAppState();
    }
  };

  const handleAddNewPage = () => {
    addNewPage();
  };

  const handleQueryMenuClick = ({ key }) => {
    if (key === 'api') {
      // modal.show();
    } else if (key === 'query') {
      // queryModal.show({ appKey: currentAppInfo && currentAppInfo.appKey, scope: 'app' });
    } else if (key === 'workflow') {
      // workflowModal.show({
      //   modalType: 'add',
      //   initValues: {
      //     workflowType: currentAppInfo && currentAppInfo.appType,
      //   },
      // });
    } else {
      accessModal.show({
        modalType: 'add',
        initValues: {
          registryType: key,
        },
      });
    }
  };

  const updateAppRegistries = (type, data) => {
    if (currentAppInfo) {
      currentAppInfo.resources = currentAppInfo.resources || {};

      const _registries: any[] = [...registries];
      const index = _.findIndex(_registries, (item) => item.code === data.code);

      if (type === 'add') {
        if (index > -1) {
          message.warning('此项已存在，无需重复添加');
          return;
        }
        if (!data || !data.registryId || !data.name) {
          message.warning('registryId is null.');
          return;
        }
        _registries.push(data);
      } else {
        if (index > -1) {
          if (type === 'edit') {
            _registries[index] = data;
          } else if (type === 'delete') {
            _registries.splice(index, 1);
          }
        }
      }
      currentAppInfo.resources.registries = _registries;
      setCurrentAppInfo({
        ...currentAppInfo,
      });
    }
  };

  const handleWorkflowDataSubmit = (type, data) => {
    updateAppRegistries(type, data);
    accessModal.hide();
  };

  const renderQueryButton = () => {
    const items = [
      // { label: '新建查询', key: 'query' },
      // { label: '新建API', key: 'api' },
      // { label: '新建工作流API', key: 'workflow' },
      ...registryTypes,
    ];

    return (
      <Dropdown
        menu={{
          items,
          onClick: handleQueryMenuClick,
        }}
      >
        <span className="g-button">
          <PlusOutlined />
        </span>
      </Dropdown>
    );
  };

  const renderQueryDropdown = (item) => {
    const menu = {
      items: [
        {
          key: 'update',
          icon: <InnoIcon type="edit-alt" />,
          label: <span>编辑</span>,
        },
        {
          key: 'delete',
          icon: <InnoIcon type="delete" />,
          label: <span>删除</span>,
        },
      ],
      onSelect: handleQueryMenuClick,
    };

    return (
      <Dropdown menu={menu}>
        <span className="g-button" onClick={(e) => e.stopPropagation()}>
          <MoreOutlined />
        </span>
      </Dropdown>
    );
  };

  const renderPageList = () => {
    if (currentAppType !== 'FORM') return null;

    return (
      <>
        <div className="editor-top-bar">
          <Row gutter={12}>
            <Col>
              <p className="top-bar-title">页面管理</p>
            </Col>
            <Col>
              <span className="g-button">
                <DownCircleOutlined />
              </span>
            </Col>
          </Row>
          <span className="g-button" onClick={handleAddNewPage}>
            <PlusOutlined />
          </span>
        </div>
        <div className={cls(styles.pageList, 'custom-scrollbar')}>
          <div className={styles.list}>
            {appState.pages.map((page) => (
              <div
                key={page.pageKey}
                className={cls(styles.listItem, 'list-item', {
                  [styles.active]: appState.currentPageKey === page.pageKey,
                })}
              >
                {appState.pages.length > 1 && (
                  <div className={styles.delBtn}>
                    <Popconfirm
                      title="是否删除此页?"
                      okText="是"
                      cancelText="否"
                      onConfirm={() => deletePage(page.pageKey)}
                    >
                      <span className="g-button">
                        <DeleteOutlined />
                      </span>
                    </Popconfirm>
                  </div>
                )}
                <div className={styles.title} onClick={changeCurrentPage(page.pageKey)}>
                  <HomeOutlined className={styles.icon} />
                  <span className={styles.label}>{page.pageName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderItemTabs = () => {
    if (currentAppType === 'FORM') {
      return (
        <div className={styles.widgetTabs}>
          {itemTabs.map((item) => (
            <div
              key={item.key}
              onClick={() => setCurTab(item.key)}
              className={cls(styles.tabItem, { [styles.active]: curTab === item.key })}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="editor-top-bar">
          <Tabs activeKey={curTab} items={itemTabs} onChange={setCurTab} />
        </div>
      );
    }
  };

  return (
    <>
      <div className={cls(styles.wrapper, styles.appLeftbar, styles[currentAppType])}>
        {renderPageList()}
        {renderItemTabs()}
        <div
          className={cls(styles.bottomContainer, { [styles.showWidgets]: curTab === 'widgets' })}
        >
          <div className={styles.resource}>
            <div className={styles.widgetsTitle}>
              <div>
                <DownOutlined /> 控件
              </div>
              <span className="g-button" onClick={() => setCurTab('widgets')}>
                <PlusOutlined />
              </span>
            </div>
            <div className={cls(styles.listWrapper, 'custom-scrollbar')}>
              {/*应用资源*/}
              <ResourceList />
            </div>
            <div className={styles.widgetsTitle}>
              <div>
                <DownOutlined /> 数据接入
              </div>
              {renderQueryButton()}
            </div>
            <div className={cls(styles.listWrapper, 'custom-scrollbar')}>
            {registries.length == 0 ? (
                <p className={styles.empty}>
                  您还未添加任何查询， <br />
                  请点击“+”按钮
                </p>
              ) : (
                <List
                  size="small"
                  header=""
                  footer=""
                  bordered={false}
                  dataSource={registries}
                  renderItem={(item) => (
                    <List.Item className="list-item">
                      <Row
                        gutter={[6, 0]}
                        align="middle"
                        justify="space-between"
                        style={{ width: '100%' }}
                      >
                        <Col>
                          <Paragraph ellipsis title={item.name} style={{ marginBottom: 0 }}>
                            {item.name}
                          </Paragraph>
                        </Col>
                        {/* <Col>{renderQueryDropdown(item)}</Col> */}
                        <Col>
                          <div className={styles.delBtn}>
                            <Popconfirm
                              title="是否删除此项?"
                              okText="是"
                              cancelText="否"
                              onConfirm={() => updateAppRegistries('delete', item)}
                            >
                              <span className="g-button">
                                <DeleteOutlined />
                              </span>
                            </Popconfirm>
                          </div>
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
          {/*UI控件*/}
          <WidgetList />
        </div>
      </div>
      {/* <QueryModal />
      <HttpDataModal /> */}
      <AccessDataModal onSubmit={handleWorkflowDataSubmit} />
    </>
  );
};

export default AppLeftSidebar;
