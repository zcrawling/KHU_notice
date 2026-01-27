import socket
import subprocess
import sys
import os
import time
import json


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
class Crawler:

    def __init__(self, socket_path='/tmp/cpp_python_socket'):
        self.socket_path = socket_path
        self.sock = None
        self.connect()
        with open('db.json', 'r', encoding='utf-8') as f:
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
        self.sock.sendall(message.encode('utf-8'))

    def receive_data(self, buffer_size=1024):
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

    def get_khu_notices(self, url):
        headers = {
            "User-Agent": "KHU_NOTICE_Bot/1.0 (contact: 3.14151265@khu.ac.kr)",
        }
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            print("PARSING: ",response.status_code)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                # 공지사항 목록 추출 (td 태그 중 클래스가 subject인 것 안의 a 태그)
                notices = soup.select('td.subject a')
                for notice in notices:
                    title = notice.text.strip()
                    link = "http://kic.khu.ac.kr" + notice['href']
                    print(f"제목: {title}")
                    print(f"링크: {link}\n")

        except Exception as e:
            print(f"크롤링 중 에러 발생: {e}")




comm = Crawler()


try:
    # 예시: 초기화 정보 질의
    print("C++에게 초기화 정보 요청 중...")
    comm.send_data("INIT_REQUEST")  # 2. 송신

    config = comm.receive_data()  # 3. 수신
    print(f"C++로부터 받은 설정: {config}")

    # 예시: 크롤링 결과 전송 루프
    while True:
        # 크롤링 결과가 나왔다고 가정
        my_result = "12345"  # 게시글 ID 같은 숫자 데이터

        print(f"데이터 전송: {my_result}")
        comm.send_data(my_result)

        # C++의 응답(ACK)을 기다림
        ack = comm.receive_data()
        print(f"서버 응답: {ack}")

        import time

        time.sleep(5)  # 테스트용 간격

except KeyboardInterrupt:
    comm.close()
    print("통신 종료")
