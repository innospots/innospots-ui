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

import React, {useContext, useMemo} from 'react';
import cls from 'classnames';

import {Row, Col} from 'antd';
import type {RowJustify} from 'antd/es/grid/row';

import {getErrorField} from '../../../common/utils';
import {useRequired} from '../hooks';
import FormContext from './FormContext';

export type FormItemWrapperProps = {
  schema: any;
  justify?: RowJustify;
  labelExtra?: React.ReactNode | string;
};

const FormItemWrapper: React.FC<FormItemWrapperProps> = ({
   schema,
   justify,
   labelExtra,
   children
 }) => {
  const {errorFields} = useContext(FormContext);
  const {$id} = schema;

  const isRequired = useRequired(schema);
  const errorField = useMemo(() => getErrorField($id, errorFields), [$id, errorFields]);

  return (
    <div
      className={cls('ant-form-item ant-form-item-with-help', {
        'ant-form-item-has-error': !!errorField
      })}
    >
      <Row align="middle" justify={justify} gutter={[12, 0]} style={{marginBottom: 8}}>
        <Col>
          {isRequired ? <span className="required-marker">*</span> : null}
          {schema.title}
        </Col>
        <Col>{labelExtra}</Col>
      </Row>
      {children}
      <div className="ant-form-item-explain ant-form-item-explain-connected">
        <div role="alert" className="ant-form-item-explain-error">
          {errorField?.errors?.[0]}
        </div>
      </div>
    </div>
  );
};

export default FormItemWrapper;
