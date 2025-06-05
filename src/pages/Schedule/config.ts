import _ from 'lodash';

export const SCHEUDLE_MODE_OPTIONS = ['ONCE', 'SCHEDULED', 'MANUAL', 'CRON']; 

export const JOB_TYPES = ['FLOW_JOB', 'EXECUTE']; // , 'LINE_CHAIN', 'CMD', 'SCRIPT', 'BEAN', 'API', 'SQL', 'FLOW_EVENT'

export const TIME_PERIOD_OPTIONS = ['MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH'];

export const WEEK_OPTIONS = _.map(Array(7), (_, index) => (index + 1) + '');

export const MONTH_OPTIONS = _.map(Array(31), (_, index) => (index + 1) + '');
