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

export const getDateDiff = (dateStr) => {
  const dateTimestamp = Date.parse(dateStr.replace(/-/gi, '/'));
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const halfamonth = day * 15;
  const month = day * 30;
  const now = new Date().getTime();
  const diffValue = now - dateTimestamp;
  if (diffValue < 0) {
    return;
  }
  const monthCnt = diffValue / month;
  const weekCnt = diffValue / (7 * day);
  const dayCnt = diffValue / day;
  const hourCnt = diffValue / hour;
  const minCnt = diffValue / minute;
  let result = '';

  if (monthCnt >= 1) {
    result = '' + parseInt(monthCnt) + '月前';
  } else if (weekCnt >= 1) {
    result = '' + parseInt(weekCnt) + '周前';
  } else if (dayCnt >= 1) {
    result = '' + parseInt(dayCnt) + '天前';
  } else if (hourCnt >= 1) {
    result = '' + parseInt(hourCnt) + '小时前';
  } else if (minCnt >= 1) {
    result = '' + parseInt(minCnt) + '分钟前';
  } else result = '刚刚';
  return result;
};

export const getTimeDiff = (startTime, endTime) => {
  if (startTime && endTime) {
    const eT = new Date(endTime).getTime();
    const sT = new Date(startTime).getTime();

    const mss = eT - sT;
    const days = parseInt(mss / (1000 * 60 * 60 * 24));
    const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = parseInt((mss % (1000 * 60)) / 1000);

    return days + ' 天 ' + hours + ' 小时 ' + minutes + ' 分钟 ' + seconds + ' 秒 ';
  } else {
    return '---';
  }
};
