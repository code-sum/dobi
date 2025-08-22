from bs4 import BeautifulSoup
import requests

url = 'https://www.github.com/'
response = requests.get(url)

print(response.status_code)
