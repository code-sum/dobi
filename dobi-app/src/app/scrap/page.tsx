"use client";

import React, { useState } from 'react';

export default function Scrap() {
  const [inputs, setInputs] = useState([{ id: 1 }]);
  // 1. 현재 단계를 관리할 상태 추가 (초기값: 1)
  const [currentStep, setCurrentStep] = useState(1);

  const handleAddInput = () => {
    const newId = inputs.length > 0 ? Math.max(...inputs.map(i => i.id)) + 1 : 1;
    setInputs([...inputs, { id: newId }]);
  };

  const handleRemoveInput = () => {
    if (inputs.length > 1) {
      setInputs(inputs.slice(0, -1));
    }
  };

  // 2. "다음" 버튼을 누르면 currentStep을 2로 변경
  const handleNext = () => {
    setCurrentStep(2);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* 3. currentStep이 1일 때만 1단계 UI를 보여줌 */}
        {currentStep === 1 && (
          <div className="scrap-first-box">
            <div>
              <h1>1단계:</h1>
              <h1>크롤링 하고 싶은 사이트 주소를 입력해주세요</h1>
            </div>
            
            <div>
              {inputs.map(input => (
                <div key={input.id} className="mt-2">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2">
              <button onClick={handleAddInput} className="mr-2 px-3 py-1 border rounded-md">+</button>
              <button onClick={handleRemoveInput} className="px-3 py-1 border rounded-md">-</button>
            </div>
            <div className="mt-4">
              {/* handleNext 함수를 onClick 이벤트에 연결 */}
              <button onClick={handleNext}>다음</button>
            </div>
          </div>
        )}

        {/* 4. currentStep이 2일 때만 2단계 UI를 보여줌 */}
        {currentStep === 2 && (
          <div className="scrap-second-box">
            <div>
              <h1>2단계:</h1>
              <h1>입력하신 사이트에서 어떤 단어들을 찾고 싶은가요?</h1>
            </div>
            <div>
              <textarea className="w-full p-2 border rounded-md"></textarea>
            </div>
            <div>
              <button>다음</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}