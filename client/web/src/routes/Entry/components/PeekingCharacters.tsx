import React, { useState, useEffect } from 'react';
import './PeekingCharacters.css';

interface PeekingCharactersProps {
  isPasswordFocused: boolean;
  isPasswordVisible: boolean;
  isTyping: boolean;
}

/**
 * 偷看密码的小人组件
 * 四个可爱的小人在密码框上方，根据密码框状态做出不同反应
 */
const PeekingCharacters: React.FC<PeekingCharactersProps> = ({
  isPasswordFocused,
  isPasswordVisible,
  isTyping,
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'covering' | 'peeking' | 'watching'>('idle');

  useEffect(() => {
    if (isPasswordVisible) {
      setAnimationState('watching');
    } else if (isPasswordFocused && isTyping) {
      setAnimationState('peeking');
    } else if (isPasswordFocused) {
      setAnimationState('covering');
    } else {
      setAnimationState('idle');
    }
  }, [isPasswordFocused, isPasswordVisible, isTyping]);

  return (
    <div className="peeking-characters-container">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={`peeking-character peeking-character-${index} peeking-state-${animationState}`}
        >
          <div className="peeking-body">
            {/* 头部 */}
            <div className="peeking-head">
              <div className="peeking-eyes">
                <div className="peeking-eye peeking-eye-left"></div>
                <div className="peeking-eye peeking-eye-right"></div>
              </div>
              <div className="peeking-mouth"></div>
            </div>
            {/* 身体 */}
            <div className="peeking-torso"></div>
            {/* 双手 */}
            <div className="peeking-hands">
              <div className="peeking-hand peeking-hand-left"></div>
              <div className="peeking-hand peeking-hand-right"></div>
            </div>
            {/* 双腿 */}
            <div className="peeking-legs">
              <div className="peeking-leg peeking-leg-left"></div>
              <div className="peeking-leg peeking-leg-right"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PeekingCharacters;
