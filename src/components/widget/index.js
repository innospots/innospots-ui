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

import UserLoginLog from './UserLoginLog';
import JobPreview from './JobPreview';
import SystemInfo from './SystemInfo';
import NewMessage from './NewMessage';
import NewDynamic from './NewDynamic';
import NewActivity from './NewActivity';
import MachineInfo from './MachineInfo';
import ChangeRecord from './ChangeRecord';
import PlanPreview from './PlanPreview';
import KafakaPreview from './KafakaPreview';
import WebhookPreview from './WebhookPreview';
import WorkspaceInfo from './WorkspaceInfo';
import StrategyDetail from './StrategyDetail';

export const componentContent = {
  userLoginLog: UserLoginLog,
  systemInfo: SystemInfo,
  newDynamic: NewDynamic,
  newMessage: NewMessage,
  newActivity: NewActivity,
  machineInfo: MachineInfo,
  planPreview: PlanPreview,
  changeRecord: ChangeRecord,
  kafakaPreview: KafakaPreview,
  webhookPreview: WebhookPreview,
  workspaceInfo: WorkspaceInfo,
  // strategyDetail: StrategyDetail,
};

/**
 * 根据组件名称获取组件
 * @param name
 */
export const getComponentByName = (name) => {
  let result = componentContent[name || ''];
  return result;
};
