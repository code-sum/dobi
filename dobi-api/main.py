import requests
from bs4 import BeautifulSoup
import time
import re
from typing import List

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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

class CrawlRequest(BaseModel):
    urls: List[str] = Field(..., example=['https://www.wikipedia.org/wiki/Apple'])
    keywords: str = Field(..., example='apple, banana')

class CrawlResult(BaseModel):
    url: str
    found_terms: List[str]
    found_count: int
    page_title: str
    preview_text: str

class TextCrawler:
    def __init__(self, search_terms=['apple', 'banana'], delay=1):
        self.search_terms = search_terms
        self.delay = delay
        
        self.chrome_options = Options()
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--window-size=1920,1080")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        
        self.chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
        self.chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        self.chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.chrome_options.add_experimental_option("useAutomationExtension", False)

    def search_text_in_content(self, content):
        soup = BeautifulSoup(content, 'html.parser')
        for script in soup(["script", "style", "nav", "footer", "noscript"]):
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
        results = []
        
        driver = webdriver.Chrome(options=self.chrome_options)
        
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                })
            """
        })

        try:
            for i, url in enumerate(urls):
                try:
                    print(f"🔄 접근 중: {url}")
                    driver.get(url)
                    time.sleep(3)
                    
                    content = driver.page_source
                    page_title = self.extract_title(content)
                    
                    print(f"✅ 로드된 페이지 제목: {page_title}") 
                    if "Access Denied" in page_title or "Just a moment" in page_title:
                        print("⚠️ 봇 차단이 의심됩니다.")

                    found_terms, page_text = self.search_text_in_content(content)
                    
                    result = {
                        'url': url,
                        'found_terms': found_terms,
                        'found_count': len(found_terms),
                        'page_title': page_title,
                        'preview_text': page_text[:200] + '...' if len(page_text) > 200 else page_text
                    }
                    results.append(result)
                    
                except Exception as e:
                    print(f"❌ {url} 크롤링 실패: {e}")
                    continue
                
                if i < len(urls) - 1:
                    time.sleep(self.delay)
                    
        finally:
            driver.quit()
        
        return results

@app.post("/api/crawl", response_model=List[CrawlResult])
async def run_crawl(request: CrawlRequest):
    search_terms_list = [term.strip() for term in request.keywords.split(',') if term.strip()]
    crawler = TextCrawler(search_terms=search_terms_list, delay=1)
    crawl_results = crawler.crawl_sites(request.urls)
    return crawl_results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)