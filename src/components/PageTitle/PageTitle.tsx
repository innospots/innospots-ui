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

import React from 'react';

import cls from 'classnames';

import {Button, Col, Input, Row} from 'antd';
import {PlusOutlined, SearchOutlined} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';
import PermissionSection from '@/components/PermissionSection';

import styles from './style.less';

type ElementType = React.ReactNode;

interface PropTypes {
    title?: string | ElementType;
    className?: string;
    style?: React.StyleHTMLAttributes<any>;
    leftContent?: string | ElementType;
    rightContent?: {
        search?: {
            value?: string,
            placeholder?: string;
            onChange?: (value: string) => void;
            onSearch?: (value: string) => void;
        };
        button?: {
            icon?: ElementType;
            label?: string;
            onClick?: () => void;
        } | ElementType;
    } | ElementType;
}

const PageTitle: React.FC<PropTypes> = ({title, style, className, leftContent, rightContent}) => {

    const {t} = useI18n(['common']);

    const renderRightContent = () => {
        let content = rightContent as any;
        if (content && (content?.search || content?.button)) {
            const {search, button} = content;
            content = (
                <Row gutter={[16, 0]}>
                    <Col>
                        {
                            search && (
                                <Input
                                    prefix={<SearchOutlined/>}
                                    value={search?.value}
                                    placeholder={search?.placeholder || t('common.input.placeholder')}
                                    style={{width: 280, backgroundColor: '#fff', borderColor: '#fff'}}
                                    onChange={(event) => search?.onChange?.(event.target.value)}
                                    // @ts-ignore
                                    onPressEnter={(event) => search?.onSearch?.(event.target?.value)}
                                />
                            )
                        }
                    </Col>
                    <Col>
                      <PermissionSection itemKey={button?.itemKey}>
                        {
                          button?.label || button?.icon ? (
                            <Button
                              type="primary"
                              icon={button.icon === undefined ? <PlusOutlined/> : button.icon}
                              onClick={button.onClick}
                            >
                              {button.label}
                            </Button>
                          ) : (
                            button
                          )
                        }
                      </PermissionSection>
                    </Col>
                </Row>
            );
        }

        return <div className={styles.rightContent}>{content}</div>;
    };

    return (
        <div className={cls(styles.pageTitle, className)} style={style}>
            {title ? <div className={styles.title}>{title}</div> : <div> {leftContent} </div>}
            {renderRightContent()}
        </div>
    );
};

export default PageTitle;
