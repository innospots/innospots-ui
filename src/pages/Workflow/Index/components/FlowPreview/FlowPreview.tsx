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

import React, { Suspense } from 'react';
import { Drawer, DrawerProps, Spin } from 'antd';

import useModal from '@/common/hooks/useModal';

const Canvas = React.lazy(() => import('../../../Builder/components/Canvas'));

export const MODAL_NAME = 'FLOW_PREVIEW';

const FlowPreview:React.FC<DrawerProps> = ({ ...rest }) => {

  const [modal, modalInfo] = useModal(MODAL_NAME);
  const { visible, initValues } = modalInfo;

  return (
    <Drawer
      width={1200}
      open={visible}
      bodyStyle={{padding: 0}}
      onClose={() => modal.hide()}
      { ...rest }
    >
      <Suspense fallback={<Spin />}>
        {
          visible && initValues.id && (
            <Canvas
              mode="preview"
              workflowInstanceId={initValues?.id}
            />
          )
        }
      </Suspense>
    </Drawer>
  )
}

export default FlowPreview;
