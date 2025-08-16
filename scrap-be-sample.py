from bs4 import BeautifulSoup
import requests

url = 'https://www.comsoc.org/publications/magazines/ieee-wireless-communications/cfp/multi-satellite-collaborative'
response = requests.get(url)

print(response.status_code)
