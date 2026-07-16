import React from 'react';

const PairCountDisplay = ({ children }: {children: number}) => {
  return (
    <div className="text-center">
      <span 
        id="count-text" 
        className="block text-center font-bold text-[#333333] whitespace-pre-wrap text-[8rem] leading-none"
      >
        ペアの数: {children}組
      </span>
    </div>
  );
}

export default PairCountDisplay;
