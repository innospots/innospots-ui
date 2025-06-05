import React, { useState } from 'react';
import { Input } from 'antd';
import { UpCircleFilled } from '@ant-design/icons';

import Recorder, { RecorderProps } from './Recorder';

import styles from './style.less';

const micIcon = require('./images/mic.png');
const keyboardIcon = require('./images/keyboard.png');

const stopIcon = () => {
  return (
    <svg color="currentColor" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <title>Stop</title>
      <rect fill="currentColor" height="250" rx="24" ry="24" width="250" x="375" y="375"></rect>
      <circle
        cx="500"
        cy="500"
        fill="none"
        r="450"
        stroke="currentColor"
        strokeWidth="100"
        opacity="0.45"
      ></circle>
      <circle
        cx="500"
        cy="500"
        fill="none"
        r="450"
        stroke="currentColor"
        strokeWidth="100"
        strokeDasharray="600 9999999"
      >
        <animateTransform
          attributeName="transform"
          dur="1s"
          from="0 500 500"
          repeatCount="indefinite"
          to="360 500 500"
          type="rotate"
        ></animateTransform>
      </circle>
    </svg>
  );
};

export type ComposerProps = {
  recorder?: RecorderProps;
  onSubmit?: (message?: string) => void;
};

const Composer: React.FC<ComposerProps> = ({ recorder, onSubmit }) => {
  const [message, setMessage] = useState<string>();
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  const canRecord = recorder?.canRecord;
  const isInputText = inputMode === 'text';
  const isInputVoice = inputMode === 'voice';

  const renderStopButton = () => {
    return (
      <div className={styles.stopButton}>
        { stopIcon() }
      </div>
    );
  };

  const renderSendButton = () => {
    return (
      <div className={styles.sendButton} onClick={() => onSubmit?.(message)}>
        <UpCircleFilled />
      </div>
    );
  };

  const renderMicButton = () => {
    return (
      <div className={styles.iconButton} onClick={() => setInputMode('voice')}>
        <img src={micIcon} alt="mic" />
      </div>
    );
  };

  const renderKeyboardButton = () => {
    return (
      <div className={styles.iconButton} onClick={() => setInputMode('text')}>
        <img src={keyboardIcon} alt="keyboard" />
      </div>
    );
  };

  return (
    <div className={styles.composer}>
      {isInputText ? (
        <Input.TextArea
          value={message}
          bordered={false}
          placeholder="请输入消息"
          autoSize={{ minRows: 1, maxRows: 5 }}
          onChange={(e) => setMessage(e.target.value)}
        />
      ) : (
        <Recorder />
      )}
      <div className={styles.controls}>
        {renderStopButton()}
        {message && renderSendButton()}
        {canRecord && isInputText && renderMicButton()}
        {isInputVoice && renderKeyboardButton()}
      </div>
    </div>
  );
};

export default Composer;
