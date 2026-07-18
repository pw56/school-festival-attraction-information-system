import React from 'react';

const PairCountDisplay = ({ count }: {count: number}) => {
  return (
    <div className="text-center transform -translate-y-1/2">
      <span 
        className="block text-center font-bold text-[#333333] whitespace-pre-wrap text-[8rem] leading-none"
      >
        ペアの数: {count}組
      </span>
    </div>
  );
}

export default PairCountDisplay;
