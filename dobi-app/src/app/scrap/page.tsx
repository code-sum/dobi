import React from 'react';

export default function Scrap() {
  return (
    <div>
      <div className="scrap-first-box">
        <div>
          <h1>1단계:</h1>
          <h1>크롤링 하고 싶은 사이트 주소를 입력해주세요</h1>
        </div>
        <div>
          <button>+</button>
          <button>-</button>
        </div>
        <div>
          <button>다음</button>
        </div>
      </div>
      <div className="scrap-second-box">
        <div>
          <h1>2단계:</h1>
          <h1>입력하신 사이트에서 어떤 단어들을 찾고 싶은가요?</h1>
        </div>
        <div>
          <textarea></textarea>
        </div>
        <div>
          <button>다음</button>
        </div>
      </div>
    </div>
  );
}