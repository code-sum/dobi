import requests
from bs4 import BeautifulSoup
import time
import re

class TextCrawler:
    def __init__(self, search_terms=['apple', 'banana'], delay=1):
        self.search_terms = search_terms
        self.delay = delay  # 요청 간 지연 시간 (초)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.results = []
    
    def fetch_page(self, url):
        """웹 페이지를 가져오는 함수"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"❌ {url} 페이지 로드 실패: {e}")
            return None
    
    def search_text_in_content(self, content, url):
        """HTML 콘텐츠에서 검색어를 찾는 함수"""
        soup = BeautifulSoup(content, 'html.parser')
        
        # 스크립트와 스타일 태그 제거
        for script in soup(["script", "style"]):
            script.decompose()
        
        # 텍스트만 추출
        text = soup.get_text()
        text = ' '.join(text.split())  # 공백 정리
        
        found_terms = []
        for term in self.search_terms:
            # 대소문자 구분 없이 검색
            if re.search(rf'\b{re.escape(term)}\b', text, re.IGNORECASE):
                found_terms.append(term)
        
        return found_terms, text
    
    def crawl_sites(self, urls):
        """여러 사이트를 크롤링하는 메인 함수"""
        print(f"🔍 검색어: {', '.join(self.search_terms)}")
        print(f"📝 총 {len(urls)}개 사이트 크롤링 시작...\n")
        
        for i, url in enumerate(urls, 1):
            print(f"[{i}/{len(urls)}] 크롤링 중: {url}")
            
            # 페이지 가져오기
            content = self.fetch_page(url)
            if content is None:
                continue
            
            # 텍스트 검색
            found_terms, page_text = self.search_text_in_content(content, url)
            
            # 결과 저장
            result = {
                'url': url,
                'found_terms': found_terms,
                'found_count': len(found_terms),
                'page_title': self.extract_title(content),
                'preview_text': page_text[:200] + '...' if len(page_text) > 200 else page_text
            }
            
            self.results.append(result)
            
            # 결과 출력
            if found_terms:
                print(f"✅ 발견: {', '.join(found_terms)}")
            else:
                print("❌ 검색어 없음")
            
            print("-" * 50)
            
            # 요청 간 지연
            if i < len(urls):
                time.sleep(self.delay)
    
    def extract_title(self, content):
        """페이지 제목 추출"""
        soup = BeautifulSoup(content, 'html.parser')
        title_tag = soup.find('title')
        return title_tag.text.strip() if title_tag else "제목 없음"
    
    def print_summary(self):
        """크롤링 결과 요약 출력"""
        print("\n" + "="*60)
        print("📊 크롤링 결과 요약")
        print("="*60)
        
        total_sites = len(self.results)
        sites_with_terms = len([r for r in self.results if r['found_count'] > 0])
        
        print(f"총 크롤링된 사이트: {total_sites}개")
        print(f"검색어가 발견된 사이트: {sites_with_terms}개")
        print(f"성공률: {sites_with_terms/total_sites*100:.1f}%\n" if total_sites > 0 else "")
        
        # 검색어별 통계
        term_stats = {term: 0 for term in self.search_terms}
        for result in self.results:
            for term in result['found_terms']:
                term_stats[term] += 1
        
        print("검색어별 발견 횟수:")
        for term, count in term_stats.items():
            print(f"  • {term}: {count}개 사이트")
        
        # 상세 결과
        print(f"\n{'='*60}")
        print("📋 상세 결과")
        print("="*60)
        
        for i, result in enumerate(self.results, 1):
            print(f"\n[{i}] {result['url']}")
            print(f"제목: {result['page_title']}")
            if result['found_terms']:
                print(f"발견된 검색어: {', '.join(result['found_terms'])}")
            else:
                print("발견된 검색어: 없음")
    
    def save_results_to_file(self, filename="crawling_results.txt"):
        """결과를 파일로 저장"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("웹 크롤링 결과\n")
            f.write("="*50 + "\n\n")
            f.write(f"검색어: {', '.join(self.search_terms)}\n")
            f.write(f"크롤링 일시: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for i, result in enumerate(self.results, 1):
                f.write(f"[{i}] {result['url']}\n")
                f.write(f"제목: {result['page_title']}\n")
                f.write(f"발견된 검색어: {', '.join(result['found_terms']) if result['found_terms'] else '없음'}\n")
                f.write(f"미리보기: {result['preview_text']}\n")
                f.write("-" * 50 + "\n")
        
        print(f"💾 결과가 '{filename}' 파일로 저장되었습니다.")


def main():
    # 크롤링할 사이트 목록
    urls_to_crawl = [
        'https://www.wikipedia.org/wiki/Apple',
        'https://www.wikipedia.org/wiki/Banana',
    ]
    
    # 크롤러 인스턴스 생성
    crawler = TextCrawler(
        search_terms=['apple', 'banana'],  # 검색할 단어들
        delay=1  # 요청 간 지연시간 (초)
    )
    
    # 크롤링 실행
    crawler.crawl_sites(urls_to_crawl)
    
    # 결과 요약 출력
    crawler.print_summary()

if __name__ == "__main__":
    main()