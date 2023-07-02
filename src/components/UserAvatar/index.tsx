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
import { AvatarSize } from 'antd/es/avatar/SizeContext';

import multiAvatar from '@multiavatar/multiavatar';
import NiceAvatar from '@/components/Nice/NiceAvatar';

const UserAvatar:React.FC<{
  userInfo: {
    avatarKey?: string,
    avatarBase64?: string
  }
  size?: AvatarSize
  className?: string
  style?: React.CSSProperties
}> = ({ size, userInfo, style, ...rest }) => {

  return userInfo.avatarKey ? (
    <div
      style={{
        width: '100%',
        height: '100%',
        ...style
      }}
      dangerouslySetInnerHTML={{
        __html: multiAvatar(userInfo.avatarKey)
      }}
      { ...rest }
    />
  ) : (
    <NiceAvatar
      size={size || 40}
      src={userInfo.avatarBase64}
      style={{
        backgroundColor: '#1245fa',
        ...style
      }}
      { ...rest }
    />
  )
}

export default UserAvatar
