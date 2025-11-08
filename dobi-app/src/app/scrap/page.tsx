"use client";

import React, { useState } from 'react';

// --- 백엔드의 CrawlResult 모델과 일치하는 타입 정의 ---
interface CrawlResult {
  url: string;
  found_terms: string[];
  found_count: number;
  page_title: string;
  preview_text: string;
}

export default function Scrap() {
  const [inputs, setInputs] = useState([{ id: 1, value: '' }]);
  const [currentStep, setCurrentStep] = useState(1);
  const [keywords, setKeywords] = useState('');

  // --- 결과 관리를 위한 상태 수정 ---
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CrawlResult[]>([]); // [수정됨] 문자열 대신 객체 배열로
  const [error, setError] = useState<string | null>(null);   // [추가됨] 에러 메시지 상태

  const handleUrlChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputs = inputs.map(input => {
      if (input.id === id) {
        return { ...input, value: event.target.value };
      }
      return input;
    });
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    const newId = inputs.length > 0 ? Math.max(...inputs.map(i => i.id)) + 1 : 1;
    setInputs([...inputs, { id: newId, value: '' }]);
  };

  const handleRemoveInput = () => {
    if (inputs.length > 1) {
      setInputs(inputs.slice(0, -1));
    }
  };
  
  const handleNext = () => {
    const hasValue = inputs.some(input => input.value.trim() !== '');
    if (!hasValue) {
      alert('URL을 하나 이상 입력해주세요.');
      return;
    }
    setCurrentStep(2);
  };

  // [수정됨] 2. 크롤링 시작 함수 (API 연동)
  const handleStartCrawling = async () => {
    if (keywords.trim() === '') {
      alert('키워드를 입력해주세요.');
      return;
    }

    const urlsToCrawl = inputs.map(input => input.value).filter(url => url.trim() !== '');

    setIsLoading(true);
    setResults([]);
    setError(null);
    setCurrentStep(3); // 결과 화면(3단계)으로 이동

    try {
      const response = await fetch("http://localhost:8000/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: urlsToCrawl,
          keywords: keywords, // 백엔드에서 받을 단일 키워드 문자열
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      }

      const data: CrawlResult[] = await response.json();
      setResults(data);

    } catch (err: any) {
      setError(err.message || '크롤링 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // [수정됨] 처음으로 돌아가는 리셋 함수
  const handleReset = () => {
    setInputs([{ id: 1, value: '' }]);
    setCurrentStep(1);
    setKeywords('');
    setIsLoading(false);
    setResults([]);
    setError(null);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-md">
        
        {/* --- 1단계: URL 입력 --- */}
        {currentStep === 1 && (
          <div className="w-full">
            <div>
              <h1 className="text-xl font-bold">1단계:</h1>
              <h1>크롤링 하고 싶은 사이트 주소를 입력해주세요</h1>
            </div>
            <div className="flex items-center mt-4">
              <div>
                {inputs.map(input => (
                  <div key={input.id} className="mt-2">
                    <input
                      type="url"
                      placeholder="https://example.com"
                      className="w-full p-2 border rounded-md"
                      value={input.value}
                      onChange={(e) => handleUrlChange(input.id, e)}
                    />
                  </div>
                ))}
              </div>
              <div className="ml-2">
                <button onClick={handleAddInput} className="mr-2 px-3 py-1 border rounded-md">+</button>
                <button onClick={handleRemoveInput} className="px-3 py-1 border rounded-md">-</button>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={handleNext} className="w-full p-2 bg-blue-500 text-white rounded-md">다음</button>
            </div>
          </div>
        )}

        {/* --- 2단계: 키워드 입력 --- */}
        {currentStep === 2 && (
          <div className="w-full">
            <div>
              <h1 className="text-xl font-bold">2단계:</h1>
              <h1>입력하신 사이트에서 어떤 단어들을 찾고 싶은가요?</h1>
            </div>
            <div className="mt-4">
              <textarea 
                className="w-full p-2 border rounded-md h-32"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="찾고 싶은 단어를 쉼표(,)로 구분하여 입력하세요."
              />
            </div>
            <div className="mt-4">
              <button onClick={handleStartCrawling} className="w-full p-2 bg-green-500 text-white rounded-md">크롤링 시작</button>
            </div>
          </div>
        )}

        {/* --- [수정됨] 3단계: 결과 화면 --- */}
        {currentStep === 3 && (
          <div className="w-full">
            <h1 className="text-xl font-bold">크롤링 결과</h1>
            {isLoading ? (
              <p>크롤링 중입니다... 잠시만 기다려주세요.</p>
            ) : error ? (
              <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
                <strong>오류 발생:</strong> {error}
              </div>
            ) : results.length > 0 ? (
              <div className="mt-4 space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="p-4 border rounded-md shadow-sm bg-slate-100 text-slate-800">
                    <h2 className="text-lg font-semibold truncate" title={result.page_title}>
                      {result.page_title}
                    </h2>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 break-all">
                      {result.url}
                    </a>
                    <p className="mt-2 text-sm">
                      <strong>발견된 키워드 ({result.found_count}개):</strong> {result.found_terms.join(', ') || '없음'}
                    </p>
                    <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>미리보기:</strong> {result.preview_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4">결과가 없습니다. (혹은 크롤링에 실패했습니다)</p>
            )}
            <div className="mt-4">
                <button onClick={handleReset} className="w-full p-2 bg-gray-500 text-white rounded-md">처음으로</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}