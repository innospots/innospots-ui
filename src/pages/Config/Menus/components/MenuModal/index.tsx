/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';

import { useModel, getLocale } from 'umi';
import _ from 'lodash';
import cls from 'classnames';

import {
  Row,
  Col,
  Card,
  Form,
  Modal,
  Input,
  Radio,
  Checkbox,
  Space,
  Button,
  Switch,
  Cascader,
  Typography
} from 'antd';
import {
  UpOutlined,
  LinkOutlined,
  DownOutlined,
  SearchOutlined,
  FolderOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useToggle, useUpdateEffect, useMemoizedFn, useControllableValue } from 'ahooks';

import { HandleType } from '@/common/types/Types';
import { transform } from '@/common/utils/I18nMap';
import { MENU_TYPES, HREF_TARGET } from '@/common/constants';

import Steps from '@/components/Steps';
import FlagIcon from '@/components/Icons/FlagIcon';
import MenuSelector from '@/components/Icons/MenuIcon/Selector';

import useI18n from '@/common/hooks/useI18n';
import useModal from '@/common/hooks/useModal';

import { getFormattedLocale } from '@/common/utils';
import { fetchRoles } from '@/services/Role';
import { fetchMenuAuths } from '@/services/RBAC';
import { KeyValues, ArrayType, ITableData } from '@/common/types/Types';

import styles from './style.less';

export const MODAL_NAME = 'MenuModal';

const formItemLayout = {
  labelCol: { flex: '112px' },
  wrapperCol: { flex: 'auto' },
};

const itemTypeIcons = {
  CATEGORY: <AppstoreOutlined className={styles.icon} />,
  MENU: <FolderOutlined className={styles.icon} />,
  LINK: <LinkOutlined className={styles.icon} />,
};

const defaultValues = {
  status: true,
  parentId: 0,
  i18nNames: {},
  openMode: HREF_TARGET[0].value,
};

type MenuLinkProps = {
  type: HandleType;
  value?: {
    appKey?: string;
    appName?: string;
    itemKey?: string;
    parentItemKeys?: string;
  };
  error?: string;
  onChange?: (value: string) => void;
};

const { Paragraph } = Typography;

let editInit;

const STEPS = [{
  title: '菜单配置',
  description: '菜单类型、图标、链接等设置',
}, {
  title: '权限设置',
  description: '设置用户角色的菜单访问权限',
}];

const MenuLink: React.FC<MenuLinkProps> = (props) => {
  const { type: linkType, value, error } = props;
  const { baseInfoData, getBaseInfoList, applicationModulesRequest, applicationMenuItemsRequest } =
    useModel('Application');

  const { t } = useI18n(['menu', 'common']);

  const [menuList, setMenuList] = useState<any[]>([]);
  const [curValue, setCurValue] = useControllableValue(props);

  const infoList: any[] = baseInfoData.list as [];

  const dataCache = useRef({});
  const currentLocale = getLocale();

  useEffect(() => {
    getBaseInfoList.run();
  }, []);

  useEffect(() => {
    if (!value?.appKey) {
      if (infoList?.length) {
        const defaultInfo = infoList[0];
        setCurValue({
          appKey: defaultInfo.extKey,
          appName: defaultInfo.name,
        });
      }
    }
  }, [value, infoList]);

  useEffect(() => {
    if (curValue?.appKey) {
      getMenuList();
    }
  }, [curValue?.appKey]);

  useUpdateEffect(() => {
    const menusIndex = menuList.length - 1;
    const lastMenuItems = menuList[menusIndex];
    const parentItemKeys = curValue?.parentItemKeys || [];
    if (lastMenuItems?.length) {
      const menuItem =
        _.find(lastMenuItems, (item) => item.itemKey === curValue?.itemKey) ||
        _.find(lastMenuItems, (item) => item.itemKey === parentItemKeys[menusIndex]);
      getSubMenuItems(menuItem || lastMenuItems[0], menusIndex);
    }
  }, [menuList, curValue?.itemKey, curValue?.parentItemKeys]);

  const getSubMenuItems = async (menuItem, menusIndex) => {
    const { items, itemKey, loadMode } = menuItem;
    let menuItems;
    const nextIndex = menusIndex + 1;
    const isLoad = menuList.length < 3;

    if (loadMode === 'DYNAMIC') {
      if (isLoad) {
        menuItems = await applicationMenuItemsRequest.runAsync(itemKey);
      }
    } else if (items?.length) {
      menuItems = [...items];
    }

    if (menuItems?.length && isLoad) {
      menuList[nextIndex] = menuItems;
      setMenuList([...menuList]);
    }

    curValue.parentItemKeys ??= [];
    curValue.parentItemKeys[menusIndex] = itemKey;

    const defaultItem = menuItems?.[0] || {};

    if (defaultItem.loadMode) {
      curValue.loadMode = defaultItem.loadMode;
    } else {
      delete curValue.loadMode;
    }

    if (editInit) {
      setCurValue({
        ...curValue,
        ..._.pick(defaultItem, ['uri', 'opts', 'appKey', 'itemKey']),
      });
    }
  };

  const updateItemKey = (appKey, menuItem, menuIndex) => {
    const itemKey = menuItem.itemKey;
    const newIndex = menuIndex + 1;
    const lastCount = 3 - newIndex;

    curValue.parentItemKeys ??= [];
    curValue.parentItemKeys.splice(newIndex, lastCount);

    setCurValue({
      ...curValue,
      itemKey,
      uri: menuItem.uri,
      opts: menuItem.opts,
      loadMode: menuItem.loadMode,
    });
    dataCache.current[appKey] = {
      ...dataCache.current[appKey],
      itemKey,
    };

    menuList.splice(newIndex, lastCount);
    setMenuList([...menuList]);
  };

  const getMenuList = async () => {
    const appKey = value?.appKey as string;
    if (!appKey) return;

    const result = await applicationModulesRequest.runAsync(appKey);

    if (result && result.length) {
      // @ts-ignore
      menuList[0] = result as any;
      setMenuList([...menuList]);

      if (linkType === 'add') {
        curValue.itemKey = result[0].itemKey;
        setCurValue({
          ...curValue,
        });
      }
    }
  };

  const renderMenuList = (list: any[], menuIndex: number) => {
    const appKey = curValue?.appKey;
    const curItemKey = curValue?.parentItemKeys?.[menuIndex];

    return (
      <div className={styles.menuItem} key={[appKey, menuIndex].join('-')}>
        <div className={styles.search}>
          <Input
            placeholder={t('menu.form.input.search_module.placeholder')}
            prefix={<SearchOutlined />}
          />
        </div>
        <ul className={styles.innerList}>
          {list?.map((item: any) => {
            const itemName = item.i18nNames?.[currentLocale] || item.name;

            return (
              <li
                key={item.itemKey}
                className={cls({
                  [styles.active]: curItemKey === item.itemKey,
                })}
                onClick={() => {
                  editInit = true;
                  updateItemKey(appKey, item, menuIndex);
                }}
              >
                {itemName}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <div className="polaris-row polaris-form-item">
        <div className="polaris-col polaris-form-item-label" style={{ flex: '0 0 112px' }}>
          <label className="polaris-form-item-required" title={t('menu.form.app_link.label')}>
            {t('menu.form.app_link.label')}
          </label>
        </div>
        <span className={styles.error}>{error}</span>
      </div>
      <div className={styles.menuLink}>
        <ul className={styles.moduleList}>
          {infoList?.map(
            (item: any) =>
              item && (
                <li
                  key={item.extKey}
                  title={item.name}
                  className={cls(styles.listItem, {
                    [styles.active]: curValue?.appKey === item.extKey,
                  })}
                  onClick={() => {
                    editInit = true;
                    setCurValue({
                      ...curValue,
                      appKey: item.extKey,
                      appName: item.name,
                      parentItemKeys: [],
                    });
                    setMenuList([]);
                  }}
                >
                  <img
                    src={require('@/assets/images/common/s_logo.png')}
                    alt=""
                    className={styles.icon}
                  />
                  <Paragraph ellipsis={true} className={styles.label}>
                    {item.name}
                  </Paragraph>
                </li>
              ),
          )}
        </ul>
        {_.map(menuList, (menuItemList: any[], index) => renderMenuList(menuItemList, index))}
      </div>
    </div>
  );
};

export type MenuItemType = {
  name: string;
  resourceId: number;
  itemKey?: string;
  subItems?: any[];
};

const DEFAULT_MENU_TYPE = MENU_TYPES[0].value;

const MenuModal: React.FC<{
  onSuccess: () => void;
}> = ({ onSuccess }) => {
  const [formRes] = Form.useForm();

  const [curStep, setCurStep] = useState<number>(0);
  const [menuList, setMenuList] = useState<MenuItemType[]>([]);
  const [menuType, setMenuType] = useState(DEFAULT_MENU_TYPE);
  const [roles, setRoles] = useState<ArrayType>([]);
  const [linkError, setLinkError] = useState('');
  const [menuItemKey, setMenuItemKey] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const [localeVisible, { toggle: localeToggle, setLeft, setRight }] = useToggle();

  const { saveMenuAuthRequest } = useModel('RBAC');
  const { languageList, getLanguageList } = useModel('I18n');
  const { sessionData, setSessionData } = useModel('Account');
  const { fetchMenuTypesRequest, createMenuItemRequest, updateMenuItemRequest } = useModel('Menu');

  const { t } = useI18n(['menu', 'common']);

  const [modal, modalInfo] = useModal(MODAL_NAME);

  const { visible, modalType, initValues } = modalInfo;

  const modalTitle = useMemo(() => (
    <div className={styles.modalTitle}>
      <Row align="middle">
        <Col flex="290px">
          <h1>{t(`menu.form.${modalType}.title`)}</h1>
        </Col>
        <Col flex="auto">
          <Steps items={STEPS} current={curStep} />
        </Col>
      </Row>
    </div>
  ), [ curStep, modalType ]);

  const languageData = useMemo(() => {
    const def = _.find(languageList, (item) => item.defaultLan);
    return {
      default: def,
      otherList: _.filter(languageList, (item) => item.locale !== def?.locale),
    };
  }, [languageList]);

  const parentOptions = useMemo(() => {
    const formValue = formRes.getFieldsValue();

    type MenuItem = {
      name: string;
      i18nNames?: {
        [key: string]: string;
      };
      resourceId: number;
      subItems?: any[];
      disabled?: boolean;
    };
    const [locale] = getFormattedLocale();
    const mergeOptions = (list: MenuItem[]) => {
      _.each(list, (item: MenuItem) => {
        const localeName = item.i18nNames && item.i18nNames[locale];
        item.name = localeName || item.name;
        item.disabled = item.name === (formValue.i18nNames && formValue.i18nNames[locale]);
        if (item.subItems) {
          mergeOptions(item.subItems);
        }
      });
    };

    const cloneList = _.cloneDeep(menuList);

    mergeOptions(cloneList as MenuItem[]);

    return cloneList;
  }, [menuList, formRes.getFieldsValue()]);

  useEffect(() => {
    if (visible) {
      getMenuList();
      getLanguageList.run();
    } else {
      setCurStep(0);
      editInit = false;
    }
  }, [visible, initValues]);

  useEffect(() => {
    if (visible) {
      getRoles();
    }
  }, [visible, sessionData.roleIds]);

  useEffect(() => {
    if (visible && menuList.length) {
      setInitValues();
    }
  }, [visible, menuList, initValues]);

  const getRoles = async () => {
    const result = await fetchRoles<ITableData>({
      paging: false
    });

    if (result) {
      const rs = result.list || [];
      let roleIds = [
        ...sessionData.roleIds
      ];
      const admin = _.find(rs, item => item.admin);
      if (admin) {
        roleIds.push(admin.roleId);
      }

      setSelectedRoles(roleIds);
      setRoles(result.list || []);
    }
  }

  const getMenuList = async () => {
    const list = await fetchMenuTypesRequest.runAsync();

    // @ts-ignore
    setMenuList([
      {
        name: t('common.text.root.dir'),
        resourceId: 0,
        // @ts-ignore
        subItems: list || [],
      },
    ]);
  };

  const getParentIds = (ids: number[], targetId: number, list: MenuItemType[] = menuList) => {
    const includes = (items: MenuItemType[], resourceId: number) => {
      return _.find(items, item => {
        if (item.resourceId === resourceId) {
          return true;
        } else {
          if (item.subItems) {
            return includes(item.subItems, resourceId)
          }
          return false;
        }
      })
    }

    for (let i = 0; i < list.length; ++i) {
      const item: MenuItemType = list[i];
      ids.push(item.resourceId);
      if (item.resourceId !== targetId) {
        if (includes(item.subItems as MenuItemType[], targetId)) {
          getParentIds(ids, targetId, item.subItems);
        } else {
          ids.pop();
        }
      } else {
        break;
      }
    }
  };

  const setInitValues = () => {
    const values = _.extend({}, _.cloneDeep(defaultValues), _.cloneDeep(initValues));

    if (!_.isArray(values.parentId)) {
      if (values.parentId === 0) {
        values.parentId = [0];
      } else {
        const ids = [];
        getParentIds(ids, values.parentId);
        values.parentId = ids;
      }
    }

    setLeft();

    if (modalType === 'edit') {
      editInit = false;
      setMenuType(values.itemType);
      values.link = getLinkData(values);

      // 多语言菜单名称不需要展开
      /*if (_.keys(values.i18nNames).length > 1) {
        setRight();
      }*/
    } else {
      editInit = true;
      setMenuType(DEFAULT_MENU_TYPE);
      setMenuItemKey('');
    }

    formRes.setFieldsValue(values);
  };

  const handleFormSubmit = () => {
    formRes.validateFields().then((values) => {
      const linkData = values.link;
      if (menuType === 'MENU' && !linkData?.parentItemKeys?.length) {
        setLinkError(t('common.error_message.select.menu'));
      } else {
        saveMenuItemData(values);
      }
    });
  };

  const handleSaveMenuAuthData = async () => {
    try {
      const result = await saveMenuAuthRequest.runAsync({
        [menuItemKey]: selectedRoles
      });

      if (result) {
        modal.hide();
        onSuccess?.();
      }
    } catch (e) {}
  };

  const getLinkData = (values) => {
    const parentItemKeys = values.parentItemKeys || '';

    return {
      appKey: values.appKey,
      itemKey: values.itemKey,
      parentItemKeys: parentItemKeys.split(','),
    };
  };

  const getFormatValue = (values) => {
    const postData = {
      ...values,
    };
    const link = postData.link;
    const parentId = postData.parentId;
    const i18nNames = postData.i18nNames;
    const defLan = languageData.default;
    // @ts-ignore
    const name = i18nNames[defLan.locale];
    const parentItemKeys = link?.parentItemKeys;
    const itemKey = parentItemKeys ? parentItemKeys[parentItemKeys.length - 1] : '';

    delete postData.link;

    const data = {
      ...postData,
      name,
      itemType: menuType,
      parentId: parentId[parentId.length - 1],
    };

    if (link?.loadMode) {
      data.loadMode = link.loadMode;
    }

    if (menuType === 'MENU') {
      _.extend(data, _.pick(link, ['uri', 'opts', 'appKey']), {
        itemKey,
        parentItemKeys: parentItemKeys ? parentItemKeys.join(',') : '',
      });
    }

    return data;
  };

  const saveMenuItemData = async (values: any) => {
    try {
      const postData = getFormatValue(values);
      const doMenu = modalType === 'add' ? createMenuItemRequest : updateMenuItemRequest;

      if (modalType === 'edit') {
        postData.itemKey = initValues.itemKey;
        postData.resourceId = initValues.resourceId;
      }

      const result = await doMenu.runAsync(postData);

      if (result) {
        setCurStep(1);

        const itemKey = result.itemKey || postData.itemKey;

        if (modalType === 'edit') {
          const menuPermission = await fetchMenuAuths<KeyValues>();
          const roleIds = selectedRoles.concat(_.map(menuPermission[itemKey], item => item.roleId));
          setSelectedRoles(_.uniq(roleIds));
        }

        setMenuItemKey(itemKey);
      }
    } catch (e) {}
  };

  const handleFormChange = useMemoizedFn((changedValues) => {
    if (changedValues.link) {
      setLinkError('');
    }
  });

  const renderFlagIcon = (locale: string) => {
    const [, , , code] = getFormattedLocale(locale);
    return <FlagIcon code={code} fis />;
  };

  const renderFormContent = () => {
    const defLan = languageData.default;
    const otherList = languageData.otherList;
    return (
      <div className={styles.formContent}>
        <Form form={formRes} preserve={false} onValuesChange={handleFormChange} {...formItemLayout}>
          {defLan && (
            <Row gutter={[16, 0]}>
              <Col span={16}>
                <Form.Item
                  name={['i18nNames', defLan.locale]}
                  label={t('menu.form.input.name.label')}
                  rules={[
                    { required: true, max: 50, message: t('menu.form.input.name.error_message') },
                    ]}
                >
                  <Input placeholder={t('menu.form.input.name.placeholder')} />
                </Form.Item>
              </Col>
              <Col span={8} className={styles.language}>
                <Row>
                  <Col flex="86px">
                    <Space>
                      <span className={styles.national}>{renderFlagIcon(defLan.locale)}</span>
                      <span>{defLan.name}</span>
                    </Space>
                  </Col>
                  <Col>
                    {!localeVisible && (
                      <Button type="link" onClick={localeToggle}>
                        <DownOutlined />
                        {t('menu.form.link.more')}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
          {localeVisible && _.map(otherList, (item, index) => (
            <Row
              gutter={[16, 0]}
              key={item.languageId}
              style={{ display: localeVisible ? '' : 'none' }}
            >
              <Col span={16} className={styles.otherLocale}>
                <Form.Item name={['i18nNames', item.locale]} label={<span />}>
                  <Input placeholder={t('menu.form.input.name.placeholder')} />
                </Form.Item>
              </Col>
              <Col span={8} className={styles.language}>
                <Row>
                  <Col flex="86px">
                    <Space>
                      <span className={styles.national}>{renderFlagIcon(item.locale)}</span>
                      <span className={styles.countryName}>{item.name}</span>
                    </Space>
                  </Col>
                  <Col>
                    {otherList.length - 1 === index ? (
                      <Button type="link" onClick={localeToggle}>
                        <UpOutlined />
                        {t('menu.form.link.collapse')}
                      </Button>
                    ) : null}
                  </Col>
                </Row>
              </Col>
            </Row>
          ))}
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name="parentId"
                label={t('menu.form.select.parent.label')}
                rules={[{ required: true, message: t('menu.form.select.parent.placeholder') }]}
              >
                <Cascader
                  changeOnSelect
                  options={parentOptions}
                  placeholder={t('menu.form.select.parent.error_message')}
                  fieldNames={{
                    value: 'resourceId',
                    label: 'name',
                    children: 'subItems',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={11}>
              <Form.Item
                name="icon"
                label={t('menu.form.select.icon.label')}
                labelCol={{ flex: '70px' }}
                rules={[{ required: true, message: t('menu.form.select.icon.placeholder') }]}
              >
                <MenuSelector placement="bottom" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            {['MENU', 'LINK'].includes(menuType) && (
              <Col span={12}>
                <Form.Item
                  name="openMode"
                  label={t('menu.form.select.open_method.label')}
                  rules={[
                    { required: true, message: t('menu.form.select.open_method.error_message') },
                  ]}
                >
                  <Radio.Group>
                    {HREF_TARGET.map((item: any) => (
                      <Radio key={item.value} value={item.value}>
                        {t(`menu.main.link_target.${transform(item.value)}`)}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                required
                name="status"
                valuePropName="checked"
                label={t('menu.form.radio.status.label')}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          {menuType === 'MENU' && visible && (
            <Form.Item
              noStyle
              name="link"
              rules={[{ required: true, message: t('menu.form.radio.status.error_message') }]}
            >
              <MenuLink error={linkError} type={modalType} />
            </Form.Item>
          )}
          {menuType === 'LINK' && (
            <Row>
              <Col span={15}>
                <Form.Item
                  name="uri"
                  label={t('menu.form.input.link.label')}
                  rules={[
                    {
                      required: true,
                      message: t('menu.form.input.link.error_message'),
                    },
                    {
                      type: 'url',
                      message: t('menu.form.input.link.error_message'),
                    },
                  ]}
                >
                  <Input placeholder={t('menu.form.input.link.placeholder')} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </div>
    );
  };

  const renderCategories = () => {
    return (
      <ul className={styles.categoryList}>
        {MENU_TYPES.map((menu: any) => (
          <li
            key={menu.value}
            className={cls(styles.listItem, {
              [styles.active]: menuType === menu.value,
            })}
            onClick={() => setMenuType(menu.value)}
          >
            {itemTypeIcons[menu.value]}
            <span className={styles.label}>{t(`menu.menu_type.${transform(menu.value)}`)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderFooter = () => {
    return (
      <Row justify="end">
        <Col>
          {
            curStep === 0 ? (
              <Row gutter={12}>
                <Col>
                  <Button
                    type="primary"
                    loading={createMenuItemRequest.loading || updateMenuItemRequest.loading}
                    onClick={handleFormSubmit}
                  >
                    {t('common.button.next')}
                  </Button>
                </Col>
              </Row>
            ) : (
              <Row gutter={12}>
                {/*<Col><Button>{t('common.button.prev')}</Button></Col>*/}
                <Col>
                  <Button
                    type="primary"
                    loading={saveMenuAuthRequest.loading}
                    onClick={handleSaveMenuAuthData}
                  >
                    {t('common.button.confirm')}
                  </Button>
                </Col>
              </Row>
            )
          }
        </Col>
      </Row>
    )
  }

  const renderRoleConfig = () => {
    const isSelectedAll = !!roles.length && selectedRoles.length === roles.length
    const checkAll = (
      <Checkbox
        checked={isSelectedAll}
        indeterminate={!!(selectedRoles.length && selectedRoles.length !== roles.length && !isSelectedAll)}
        onChange={event => {
          if (event.target.checked) {
            setSelectedRoles(_.map(roles, role => role.roleId))
          } else {
            setSelectedRoles([])
          }
        }}
      />
    )

    return (
      <div style={{width: '100%'}}>
        <Row justify="center">
          <Col>
            <span style={{fontSize: 16}}>请从以下“角色”列表中选择可访问此菜单的“角色”，对应角色的用户将拥有访问此菜单的权限。</span>
          </Col>
        </Row>
        <Row justify="center" align="middle" gutter={80} className={styles.roleConfig}>
          <Col>
            <img src={require('@/assets/images/access_auth_pic.png')} className={styles.pic} />
          </Col>
          <Col>
            <Card
              size="small"
              title="所有角色"
              extra={checkAll}
              style={{ width: 254 }}
              bodyStyle={{minHeight: 300}}
            >
              <Row>
                {
                  _.map(roles, roleItem => {
                    const roleId = roleItem.roleId;
                    const isChecked = selectedRoles.includes(roleId);

                    return (
                      <Col span={24} key={roleId}>
                        <div
                          className={styles.roleItem}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedRoles(_.filter(selectedRoles, id => id !== roleId))
                            } else {
                              selectedRoles.push(roleId);
                              setSelectedRoles([
                                ...selectedRoles
                              ])
                            }
                          }}
                        >
                          <Row justify="space-between">
                            <Col>{ roleItem.roleName }</Col>
                            <Col><Checkbox checked={isChecked} /></Col>
                          </Row>
                        </div>
                      </Col>
                    )
                  })
                }
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <Modal
      width={1024}
      destroyOnClose
      open={visible}
      style={{ top: 20 }}
      title={modalTitle}
      footer={renderFooter()}
      onCancel={modal.hide}
    >
      <div className={styles.modalBody}>
        {
          curStep === 0 ? (
            <>
              {renderCategories()}
              {renderFormContent()}
            </>
          ) : (
            <>
              {renderRoleConfig()}
            </>
          )
        }
      </div>
    </Modal>
  );
};

export default MenuModal;
