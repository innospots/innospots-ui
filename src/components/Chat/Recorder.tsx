import React, { useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import clsx from 'classnames';
import { AudioFilled } from '@ant-design/icons';

import canUse from '@/common/utils/canUse';

import styles from './style.less';

const canPassive = canUse('passiveListener');
const listenerOpts = canPassive ? { passive: true } : false;
const listenerOptsWithoutPassive = canPassive ? { passive: false } : false;
const MOVE_INTERVAL = 80;

interface ButtonTextMap {
  [k: string]: string;
}

const btnTextMap: ButtonTextMap = {
  inited: 'hold2talk',
  recording: 'release2send',
  willCancel: 'release2send',
};

let ts = 0;
let startY = 0;

export interface RecorderHandle {
  stop: () => void;
}

export interface RecorderProps {
  canRecord?: boolean;
  volume?: number;
  onStart?: () => void;
  onEnd?: (data: { duration: number }) => void;
  onCancel?: () => void;
  ref?: React.MutableRefObject<RecorderHandle>;
}

const Recorder = React.forwardRef<RecorderHandle, RecorderProps>((props, ref) => {
  const { volume, onStart, onEnd, onCancel } = props;
  const [status, setStatus] = useState('inited');
  const btnRef = useRef<HTMLDivElement>(null);

  const doEnd = useCallback(() => {
    const duration = Date.now() - ts;
    if (onEnd) {
      onEnd({ duration });
    }
  }, [onEnd]);

  useImperativeHandle(ref, () => ({
    stop() {
      setStatus('inited');
      doEnd();
      ts = 0;
    },
  }));

  useEffect(() => {
    const wrapper = btnRef.current!;

    function handleTouchStart(e: TouchEvent) {
      if (e.cancelable) {
        e.preventDefault();
      }
      const touch0 = e.touches[0];
      startY = touch0.pageY;
      ts = Date.now();
      setStatus('recording');

      if (onStart) {
        onStart();
      }
    }

    function handleMouseStart(e: MouseEvent) {
      if (e.cancelable) {
        e.preventDefault();
      }
      startY = e.pageY;
      ts = Date.now();
      setStatus('recording');

      if (onStart) {
        onStart();
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (!ts) return;
      const nowY = e.pageY;
      const isCancel = startY - nowY > MOVE_INTERVAL;
      setStatus(isCancel ? 'willCancel' : 'recording');
    }

    function handleMouseEnd(e: MouseEvent) {
      if (!ts) return;
      const endY = e.pageY;
      const isRecording = startY - endY < MOVE_INTERVAL;

      setStatus('inited');

      if (isRecording) {
        doEnd();
      } else if (onCancel) {
        onCancel();
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!ts) return;
      const nowY = e.touches[0].pageY;
      const isCancel = startY - nowY > MOVE_INTERVAL;
      setStatus(isCancel ? 'willCancel' : 'recording');
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!ts) return;
      const endY = e.changedTouches[0].pageY;
      const isRecording = startY - endY < MOVE_INTERVAL;

      setStatus('inited');

      if (isRecording) {
        doEnd();
      } else if (onCancel) {
        onCancel();
      }
    }

    wrapper.addEventListener('mousedown', handleMouseStart);
    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseup', handleMouseEnd);
    wrapper.addEventListener('mouseleave', handleMouseEnd);
    // wrapper.addEventListener('touchstart', handleTouchStart, listenerOptsWithoutPassive);
    // wrapper.addEventListener('touchmove', handleTouchMove, listenerOpts);
    // wrapper.addEventListener('touchend', handleTouchEnd);
    // wrapper.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
      wrapper.removeEventListener('touchend', handleTouchEnd);
      wrapper.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [doEnd, onCancel, onStart]);

  const isCancel = status === 'willCancel';
  const wavesStyle = { transform: `scale(${(volume || 1) / 100 + 1})` };

  const renderRecorderToast = () => {
    return (
      <div className={styles.recorderToast}>
        <div className={styles.recorderWaves} style={wavesStyle}>
          <AudioFilled className={styles.recorderWave1} />
          <AudioFilled className={styles.recorderWave2} />
          <AudioFilled className={styles.recorderWave3} />
        </div>
      </div>
    );
  };

  return (
    <div className={clsx(styles.recorder, { [styles.recorderCancel]: isCancel })} ref={btnRef}>
      {status !== 'inited' && renderRecorderToast()}
      <div className={styles.recorderBtn} role="button">
        <span>按住说话</span>
      </div>
    </div>
  );
});

export default Recorder;