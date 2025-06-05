import _ from 'lodash';
import {useModel} from 'umi';
import cls from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';
import {Divider, Col, Form, Input, Radio, Row, Select, Switch, Tabs} from 'antd';
import {AccountBookOutlined, ArrowLeftOutlined, BarsOutlined} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import {randomString} from '@/common/utils'

import AppPage from '../../AppPage';

import styles from '../../style.less';
import settingStyles from './style.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const pageUrl = 'http://innospots.io/#/app/page/';
const embedUrl = 'http://innospots.io/#/app/embed/';

const Setting: React.FC = () => {
  const {t} = useI18n(['common']);
  const {commonState} = useModel('AppEditor', (model) => ({
    commonState: model.commonState
  }));
  const {categories, currentAppInfo, currentAppType, categoryRequest, setCurrentAppInfo} = useModel(
    'App',
    (model) => ({
      categories: model.categories,
      currentAppType: model.currentAppType,
      currentAppInfo: model.currentAppInfo,
      categoryRequest: model.categoryRequest,
      setCurrentAppInfo: model.setCurrentAppInfo
    })
  );
  const isFormApp = currentAppType === 'FORM'
  const appSettings = useMemo<any>(() => (currentAppInfo?.settings || {}), [ currentAppInfo?.settings ])

  const [formIns] = Form.useForm();
  const [activeTab, setActiveTab] = useState('baseInfo')

  useEffect(() => {
    categoryRequest.run();
  }, []);

  const getPathValue = (appPath = currentAppInfo?.appPath) => {
    appPath = appPath || '-'
    return {
      visitPath: `${pageUrl}${appPath}`,
      visitEmbedPath: `${embedUrl}${appPath}`
    };
  };

  const getFormatValue = () => {
    const appPath = randomString(12)
    const value = {
      appPath,
      settings: {
        publicVisit: true,
        naviLocation: 'TOP',
        showNavigation: isFormApp,
        embedShowNavigation: isFormApp
      }
    }
    const appInfo = {
      ...currentAppInfo
    }

    _.each([
      'appPath',
      'settings'
    ], k => {
      if (!appInfo[k]) {
        delete appInfo[k]
      }
    })

    return _.merge(value, appInfo, getPathValue(appPath))
  };

  useEffect(() => {
    if (!currentAppInfo?.appPath && !currentAppInfo?.settings) {
      const formValue = getFormatValue()
      formIns.setFieldsValue(formValue)
      setCurrentAppInfo(_.merge(currentAppInfo, formValue))
    } else {
      formIns.setFieldsValue(_.merge(currentAppInfo, getPathValue()))
    }
  }, [activeTab, formIns, currentAppInfo])

  const appCategories = useMemo(() => {
    return _.map(categories, (item) => ({
      value: item.categoryId,
      label: item.categoryName
    }));
  }, [categories]);

  const toggleSettingPanel = () => {
    commonState.settingCollapsed = true;
  };
  const settingNavs = [
    {
      name: '基础信息',
      code: 'baseInfo',
      formContent: function () {
        return (
          <>
            <FormItem name="name" label="页面名称" required>
              <Input placeholder="请输入"/>
            </FormItem>
            <FormItem name="categoryId" label="应用分类" required>
              <Select options={appCategories}/>
            </FormItem>
            <FormItem name="icon" label="应用图标">
              <AccountBookOutlined className={settingStyles.icon}/>
              <BarsOutlined className={settingStyles.icon}/>
            </FormItem>
          </>
        );
      }
    },
    {
      name: '导航菜单',
      code: 'nav',
      formContent: function () {
        return (
          <>
            <FormItem
              name={['settings', 'showNavigation']}
              label="是否展示导航菜单"
              valuePropName="checked"
            >
              <Switch/>
            </FormItem>
            {
              appSettings.showNavigation && (
                <FormItem name={['settings', 'naviLocation']} label="导航菜单位置">
                  <Radio.Group>
                    <Radio value="TOP"> 顶部 </Radio>
                    <Radio value="LEFT"> 左侧 </Radio>
                  </Radio.Group>
                </FormItem>
              )
            }
          </>
        );
      }
    },
    {
      name: '应用分享',
      code: 'appShare',
      formContent: function () {
        return (
          <>
            <FormItem name={['settings', 'publicVisit']} label="允许公开访问" valuePropName="checked">
              <Switch/>
            </FormItem>
            {
              appSettings.publicVisit && (
                <>
                  <Divider/>
                  <FormItem name="appPath" label="应用路径" required>
                    <Input placeholder="请输入应用路径" maxLength={30}/>
                  </FormItem>
                  <FormItem name="visitPath" label="访问地址">
                    <TextArea disabled rows={4}/>
                  </FormItem>
                  <FormItem name={['settings', 'embedShowNavigation']} label="嵌入时是否展示导航栏" valuePropName="checked">
                    <Switch/>
                  </FormItem>
                  <FormItem name="visitEmbedPath" label="嵌入地址">
                    <TextArea disabled rows={4}/>
                  </FormItem>
                </>
              )
            }
          </>
        );
      }
    }
  ];

  const handleValuesChange = (changedValues) => {
    if ('appPath' in changedValues) {
      formIns.setFieldsValue(getPathValue(changedValues.appPath));
    }

    const appInfo = _.merge({}, currentAppInfo, changedValues)
    setCurrentAppInfo(_.cloneDeep(appInfo));
  };

  const renderFormContent = (item: any) => {
    return (
      <div className={cls(settingStyles.settingInner, 'custom-scrollbar')}>{item.formContent()}</div>
    );
  };

  const renderSettingForm = () => {
    return (
      <Form
        form={formIns}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        <Tabs
          activeKey={activeTab}
          tabPosition="left"
          style={{height: '100%'}}
          items={_.filter(settingNavs, item => {
            if (item.code === 'nav') {
              return isFormApp
            }
            return true
          }).map((item) => ({
            label: <div className={styles.tabLabel}>{item.name}</div>,
            key: item.code,
            children: renderFormContent(item)
          }))}
          onChange={setActiveTab}
        />
      </Form>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.leftSidebar} style={{width: 540}}>
          <div className="editor-top-bar">
            <Row gutter={12}>
              <Col>
                <p className="top-bar-title">应用设置</p>
              </Col>
              <Col>
                <div className={settingStyles.configButton} onClick={toggleSettingPanel}>
                  <ArrowLeftOutlined/>
                  <span>返回</span>
                </div>
              </Col>
            </Row>
          </div>
          <div className={settingStyles.setting}>{renderSettingForm()}</div>
        </div>
        <div className={cls(styles.mainContent, settingStyles.previewWrap)}>
          {currentAppInfo && <AppPage appInfo={currentAppInfo}/>}
        </div>
      </div>
    </div>
  );
};
export default Setting;
