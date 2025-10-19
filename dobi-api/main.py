import requests
from bs4 import BeautifulSoup
import time
import re
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- 1. FastAPI 앱 인스턴스 생성 및 CORS 설정 ---
app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Pydantic을 사용한 데이터 모델 정의 ---

# [수정됨] 프론트엔드의 keywords (단일 문자열) 상태에 맞춤
class CrawlRequest(BaseModel):
    urls: List[str] = Field(..., example=['https://www.wikipedia.org/wiki/Apple'])
    keywords: str = Field(..., example='apple, banana') # search_terms: List[str] 대신 keywords: str

# API가 프론트엔드로 반환할 응답 데이터의 형식을 정의
class CrawlResult(BaseModel):
    url: str
    found_terms: List[str]
    found_count: int
    page_title: str
    preview_text: str

# --- 3. 기존 크롤러 클래스 (변경 없음) ---
class TextCrawler:
    def __init__(self, search_terms=['apple', 'banana'], delay=1):
        self.search_terms = search_terms
        self.delay = delay
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_page(self, url):
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"❌ {url} 페이지 로드 실패: {e}")
            return None
    
    def search_text_in_content(self, content):
        soup = BeautifulSoup(content, 'html.parser')
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = ' '.join(soup.get_text().split())
        
        found_terms = []
        for term in self.search_terms:
            if re.search(rf'\b{re.escape(term)}\b', text, re.IGNORECASE):
                found_terms.append(term)
        
        return found_terms, text
    
    def extract_title(self, content):
        soup = BeautifulSoup(content, 'html.parser')
        title_tag = soup.find('title')
        return title_tag.text.strip() if title_tag else "제목 없음"

    def crawl_sites(self, urls: List[str]) -> List[CrawlResult]:
        """ 여러 사이트를 크롤링하고 결과를 리스트로 반환하는 함수 """
        results = []
        for i, url in enumerate(urls):
            content = self.fetch_page(url)
            if content is None:
                continue
            
            found_terms, page_text = self.search_text_in_content(content)
            
            result = {
                'url': url,
                'found_terms': found_terms,
                'found_count': len(found_terms),
                'page_title': self.extract_title(content),
                'preview_text': page_text[:200] + '...' if len(page_text) > 200 else page_text
            }
            results.append(result)
            
            if i < len(urls) - 1:
                time.sleep(self.delay)
        
        return results

# --- 4. FastAPI 엔드포인트 정의 ---
@app.post("/api/crawl", response_model=List[CrawlResult])
async def run_crawl(request: CrawlRequest):
    """
    프론트엔드로부터 URL 리스트와 '키워드 문자열'을 받아 크롤링을 수행하고 결과를 반환
    """
    
    # [수정됨] 쉼표로 구분된 keywords 문자열을 리스트로 변환
    search_terms_list = [term.strip() for term in request.keywords.split(',') if term.strip()]
    
    # 요청 받은 데이터로 크롤러 인스턴스 생성
    crawler = TextCrawler(search_terms=search_terms_list, delay=1)
    
    # 크롤링 실행 및 결과 반환
    crawl_results = crawler.crawl_sites(request.urls)
    
    return crawl_results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)