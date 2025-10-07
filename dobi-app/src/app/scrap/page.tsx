"use client";

import React, { useState } from 'react';

export default function Scrap() {
  // 1. input의 id와 실제 입력값(value)을 함께 저장
  const [inputs, setInputs] = useState([{ id: 1, value: '' }]);
  const [currentStep, setCurrentStep] = useState(1);
  const [keywords, setKeywords] = useState('');

  // --- 결과 관리를 위한 상태 추가 ---
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [results, setResults] = useState('');       // 결과 메시지

  // URL input의 내용이 변경될 때마다 호출되는 함수
  const handleUrlChange = (id, event) => {
    const newInputs = inputs.map(input => {
      if (input.id === id) {
        // id가 일치하는 항목의 value를 업데이트
        return { ...input, value: event.target.value };
      }
      return input;
    });
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    const newId = inputs.length > 0 ? Math.max(...inputs.map(i => i.id)) + 1 : 1;
    // 새 input 객체에도 value: ''를 추가
    setInputs([...inputs, { id: newId, value: '' }]);
  };

  const handleRemoveInput = () => {
    if (inputs.length > 1) {
      setInputs(inputs.slice(0, -1));
    }
  };
  
  const handleNext = () => {
    // URL이 하나라도 입력되었는지 확인
    const hasValue = inputs.some(input => input.value.trim() !== '');
    if (!hasValue) {
      alert('URL을 하나 이상 입력해주세요.');
      return;
    }
    setCurrentStep(2);
  };

  // 2. 크롤링 시작 함수 구현
  const handleStartCrawling = () => {
    if (keywords.trim() === '') {
      alert('키워드를 입력해주세요.');
      return;
    }

    // 실제 크롤링 로직은 보통 백엔드 서버에서 수행
    console.log("크롤링 시작!");
    const urlsToCrawl = inputs.map(input => input.value).filter(url => url.trim() !== '');
    console.log("대상 URL:", urlsToCrawl);
    console.log("검색 키워드:", keywords);

    setIsLoading(true);
    setResults('');
    setCurrentStep(3); // 결과 화면(3단계)으로 이동

    // 2초 후 크롤링이 완료된 것처럼 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      const resultMessage = `✅ 크롤링 완료!\n\n- 대상 URL: ${urlsToCrawl.join(', ')}\n- 검색 키워드: "${keywords}"\n\n(실제 결과 데이터는 백엔드 API를 통해 받아와야 합니다.)`;
      setResults(resultMessage);
    }, 2000);
  };
  
  // 처음으로 돌아가는 리셋 함수
  const handleReset = () => {
    setInputs([{ id: 1, value: '' }]);
    setCurrentStep(1);
    setKeywords('');
    setIsLoading(false);
    setResults('');
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
        {/* --- 1단계: URL 입력 --- */}
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
                    value={input.value} // 상태의 value와 input의 value를 연결
                    onChange={(e) => handleUrlChange(input.id, e)} // 변경될 때마다 handleUrlChange 호출
                  />
                </div>
              ))}
            </div>
            <div className="mt-2">
              <button onClick={handleAddInput} className="mr-2 px-3 py-1 border rounded-md">+</button>
              <button onClick={handleRemoveInput} className="px-3 py-1 border rounded-md">-</button>
            </div>
            <div className="mt-4">
              <button onClick={handleNext}>다음</button>
            </div>
          </div>
        )}

        {/* --- 2단계: 키워드 입력 --- */}
        {currentStep === 2 && (
          <div className="scrap-second-box">
            <div>
              <h1>2단계:</h1>
              <h1>입력하신 사이트에서 어떤 단어들을 찾고 싶은가요?</h1>
            </div>
            <div>
              <textarea 
                className="w-full p-2 border rounded-md"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="찾고 싶은 단어를 쉼표(,)로 구분하여 입력하세요."
              />
            </div>
            <div>
              <button onClick={handleStartCrawling}>크롤링 시작</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="scrap-result-box text-white">
            <h1>크롤링 결과</h1>
            {isLoading ? (
              <p>크롤링 중입니다... 잠시만 기다려주세요.</p>
            ) : (
              <pre className="blackspace-pre-wrap bg-slate-100 text-slate-800 p-4 rounded-md mt-4 border border-slate-200">{results}</pre>
            )}
            <div className="mt-4">
                <button onClick={handleReset}>처음으로</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}