import socket
import subprocess
import sys
import time
import json
from lxml import html, etree
from db import BoardManager
import re
from urllib.parse import urlparse, parse_qs
import urllib3

packages = {
    "beautifulsoup4": "bs4",
    "requests": "requests"
}

for package, import_name in packages.items():
    try:
        __import__(import_name)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
from bs4 import BeautifulSoup
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
class Crawler:

    def __init__(self, socket_path='/tmp/cpp_python_socket'):
        self.socket_path = socket_path
        self.sock = None
        self.connect()
        with open('boards_db.json', 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        self.board_db = {
            category: {board['title']: board['url'] for board in boards}
            for category, boards in raw_data.items()
        }

    def get_url(self,categoty,name):
        return self.board_db.get(categoty, {}).get(name)

    def connect(self):
        try:
            self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            self.sock.connect(self.socket_path)
            print(f"CONNECTED: {self.socket_path}")
        except Exception as e:
            print(f"FAILED TO CONNECT: {e}")
            self.sock = None

    def send_data(self, message):
        if not self.sock:
            self.connect()
        self.sock.sendall(message)

    def receive_data(self, buffer_size=65565):
        try:
            data = self.sock.recv(buffer_size)
            if not data:
                return None
            return data.decode('utf-8')
        except Exception as e:
            print(f"RECEPTION ERROR: {e}")
            return None

    def close(self):
        if self.sock:
            self.sock.close()

    def send_html(self, title, date, raw_html, board_id):
        try:
            final_data = f"{board_id}|{title}|{date}|{raw_html}"
            encoded_data = final_data.encode('utf-8')
            data_len = len(encoded_data)
            print(f"[*] 전송 시도: {title} ({data_len} bytes)")
            print("[+] 전송 완료")
        except Exception as e:
            print(f"[-] 전송 중 에러 발생: {e}")

    def get_article_id_from_js(self, xpath):
        if xpath:
            article_id = re.search(r"view\('(\d+)'\)", xpath[0].get('href'))
        if article_id:
            return article_id.group(1)
        return None

    def exact_crowl(self, url, new_count, view_xpath, date_xpath, title_xpath):
        if(url == 'http://swcon.khu.ac.kr/wordpress/post/'): #hardcoded
            url = f"{url}?vid={new_count}"
        headers = {
            "User-Agent": "KHU_NOTICE_Bot/1.0 (contact: 3.14151265@khu.ac.kr)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            resp.raise_for_status()
            resp.encoding = 'utf-8'
            tree = html.fromstring(resp.text)
            content_nodes = tree.xpath(view_xpath)
            date_str = tree.xpath(date_xpath)[0].text_content().strip() if tree.xpath(date_xpath) else "0000-00-00"
            title_str = tree.xpath(title_xpath)[0].text_content().strip() if tree.xpath(title_xpath) else "미상"
            if content_nodes:
                from lxml import etree
                content_html = etree.tostring(content_nodes[0], encoding='unicode', method='html')
                return [content_html,date_str,title_str]
            else:
                return ["","",""]

        except Exception as e:
            return f"에러 발생: {e}"

    def get_detail_post(self,board, article_id,view_xpath,date_xpath,title_xpath):
        view_url = board['url'].replace('list.do', 'view.do').split('?')[0]
        parsed_url = urlparse(board['url'])
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}/"
        params = parse_qs(parsed_url.query)
        menu_no = params.get('menuNo', [None])[0]
        payload = {
            "menuNo": menu_no,
            "boardId": str(article_id),
            "searchCategory": "",
            "searchKeyword": "",
            "searchCondition": "",
            "pageIndex": "1",
            "boardType": "",
            "listUserDisplayCount": "10"
        }

        headers = {
            "User-Agent": "KHU_NOTICE_Bot/1.0 (contact: 3.14151265@khu.ac.kr)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": base_url,
            "Referer": board['url'],
        }

        try:
            session = requests.Session()
            session.get(headers["Referer"])
            resp = session.post(view_url, data=payload, headers=headers, timeout=10)
            resp.encoding = 'utf-8'
            tree = html.fromstring(resp.text)
            date_str = tree.xpath(date_xpath)[0].text_content().strip() if tree.xpath(date_xpath) else "0000-00-00"
            title_str = tree.xpath(title_xpath)[0].text_content().strip() if tree.xpath(title_xpath) else "미상"
            content_node = tree.xpath(view_xpath)
            if content_node:
                target = content_node[0]
                for img in target.xpath('.//img'):
                    src = img.get('src')
                    if src and src.startswith('/'):
                        img.set('src', base_url + src)

                raw_html = etree.tostring(target, encoding='unicode', method='html')
                return [raw_html,date_str,title_str]
            return ["","",""]
        except Exception as e:
            print(f"상세 페이지 로딩 실패: {e}")
            return {
                "date": None,
                "content": None,
                "images": None
            }
    def debug_print(self,x):
        print(f"[*] 추출된 HTML 길이: {len(x[0])} 글자")
        print(f"[*] 제목: {x[2]}")
        print(f"[*] Date: {x[1]}")

    def crawling(self, board):
        headers = {
            "User-Agent": "KHU_NOTICE_Bot/1.0 (contact: 3.14151265@khu.ac.kr)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        try:
            resp = requests.get(board['url'], headers=headers, timeout=10)
            tree = html.fromstring(resp.content)
            count_xpath=''
            article_xpath=''
            view_xpath = ''
            date_xpath = ''
            title_xpath = ''

            match board['code']: ##FUCK
                case 1:
                    count_xpath = '/html/body/section/div/div[1]/div[2]/div/div[1]/strong'
                    article_xpath = '/html/body/section/div/div[1]/div[2]/div/div[2]/div/table/tbody[1]/tr[5]/td[2]/a'
                    view_xpath = '//*[@id="cont"]'
                    date_xpath = '/html/body/section/div/div[1]/div[2]/article/header/div/div'
                    title_xpath = '/html/body/section/div/div[1]/div[2]/article/header/h2'
                case 2:
                    count_xpath ='/html/body/div/div[1]/div/div[3]/section/div[2]/div/div[2]/div[2]/div/div[2]/strong'
                    article_xpath = '/html/body/div/div[1]/div/div[3]/section/div[2]/div/div[2]/div[2]/div/table/tbody/tr[1]/td[2]/a'
                    view_xpath = '/html/body/div/div[1]/div/div[3]/section/div[2]/div'
                    date_xpath = '/html/body/div/div[1]/div/div[3]/section/div[2]/div/div[2]/div/div/div/div[1]/div[3]/span[1]'
                    title_xpath = '/html/body/div/div[1]/div/div[3]/section/div[2]/div/div[2]/div/div/div/div[1]/div[2]/p'
                case 3:
                    count_xpath = '/html/body/div/section/div[2]/div[3]/div[3]/article/div/div[1]/strong'
                    article_xpath = '/html/body/div/section/div[2]/div[3]/div[3]/article/div/div[2]/div/table/tbody[2]/tr[1]/td[2]/a'
                    view_xpath = '//*[@id="cont"]'
                    date_xpath = '/html/body/div/section/div[2]/div[3]/div[3]/article/article/header/div[1]/div'
                    title_xpath = '/html/body/div/section/div[2]/div[3]/div[3]/article/article/header/h2'
                case 4:
                    count_xpath = '/html/body/div[1]/div[3]/div/div[1]/main/article/div/div[2]/div/div/div/form[2]/div[1]/table/tbody/tr[8]/td[1]/span'
                    article_xpath = '/html/body/div[1]/div[3]/div/div[1]/main/article/div/div[2]/div/div/div/form[2]/div[1]/table/tbody/tr[8]/td[2]/a/span'
                    view_xpath = '//*[@id="primary"]'
                    date_xpath = '/html/body/div[1]/div[3]/div/div[1]/main/article/div/div[2]/div/div/div/form/div[1]/table/tbody/tr[1]/td/span[2]'
                    title_xpath = '/html/body/div[1]/div[3]/div/div[1]/main/article/div/div[2]/div/div/div/form/div[1]/table/tbody/tr[1]/td/span[1]'
                case 5:
                    count_xpath = '/html/body/section/div/section[2]/div/div[2]/div/article/div/div[1]/strong'
                    article_xpath = '/html/body/section/div/section[2]/div/div[2]/div/article/div/div[2]/div/table/tbody[1]/tr[5]/td[2]/a'
                    view_xpath = '/html/body/section/div/section[2]/div'
                    date_xpath = '/html/body/section/div/section[2]/div/div[2]/div/article/article/header/div[1]/div'
                    title_xpath = '/html/body/section/div/section[2]/div/div[2]/div/article/article/header/h2'
                case 6:
                    count_xpath = '/html/body/main/div/div/section[2]/div/div/div/div/div/div/div/div[1]/div[1]'
                    article_xpath = '/html/body/main/div/div/section[2]/div/div/div/div/div/div/div/div[2]/table/tbody/tr[1]/td[2]/a/div'
                    view_xpath = '/html/body/main/div/div/section[2]'
                    date_xpath = '/html/body/main/div/div/section[2]/div/div/div/div/div/div/div/div/div[1]/div[2]/div[2]/div[2]'
                    title_xpath = '/html/body/main/div/div/section[2]/div/div/div/div/div/div/div/div/div[1]/div[1]/h1'

            cnt = tree.xpath(count_xpath)[0].text_content()
            clean_data = re.sub(r'[^0-9]', '', cnt)
            print(clean_data)
            if cnt:
                new_count = int(clean_data)
                old_count = board['last_count']
                if new_count > old_count:
                    print(f"[{board['title']}] 새 글 발견! {old_count} -> {new_count}")
                    if (board['code'] == 4):
                        x = self.exact_crowl(board['url'],new_count, view_xpath, date_xpath, title_xpath)
                    else:
                        post_id = self.get_article_id_from_js(tree.xpath(article_xpath))
                        x = self.get_detail_post(board, post_id, view_xpath, date_xpath, title_xpath)
                    self.debug_print(x)
                    board['last_count'] = new_count
                    self.send_html(board['url'],x[2],x[1],x[0])
                    return True

                else:
                    print(f"[{board['title']}] 변동 없음 ({new_count})")
                    return False

            else:
                print(f"[{board['title']}] 파싱 실패: 경로를 찾을 수 없음")
                return False

        except Exception as e:
            print(f"[{board['title']}] 연결 에러: {e}")
            return False


comm = Crawler()
db = BoardManager()


for i in range(1,20):
    comm.crawling(db.get_next())
    time.sleep(1)

db.save_data()
