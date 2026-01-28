//
// Created by sb on 1/25/26.
//
#include <database.h>
#include <iostream>
#include <utility>
#include <filesystem>
#include <fstream>
#include <random>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>
#include <thread>
#include <shared_mutex>
#include <mutex>
#include <ctime>

Post::Post(const std::string &url, const std::string &title, const std::string &main,
        const uint64_t date, const uint64_t board_id):
url(url), title(title), main(main), date(date), board_id(board_id){};

Database::Database() : boards{} {
        std::ifstream readFile;
        readFile.open("../db/titles.txt");
        if (!readFile.is_open()) {
                std::cerr << "error occurred during initialization of DB" << std::endl;
                exit(100);
        }
        std::string tmp;
        while (std::getline(readFile, tmp)) {
                if (!tmp.empty()) {
                        titles.insert(tmp);
                } else break;
        }
        readFile.close();
        readFile.open("../db/board/boards.txt");
        if (!readFile.is_open()) {
                std::cerr << "error occurred during initialization of DB" << std::endl;
                exit(101);
        }
        uint64_t now = 0;
        while (std::getline(readFile, tmp)) {
                if (tmp.empty()) {
                        break;
                }
                if (tmp == "#####") {
                        now++;
                        continue;
                }
                if (tmp == "$$$$$") {
                        break;
                }
                boards[now].bbs.insert(std::stoull(tmp));
        }
        now = 0;
        while (std::getline(readFile, tmp)) {
                if (tmp.empty()) {
                        break;
                }
                if (tmp == "#####") {
                        now++;
                        continue;
                }
                if (tmp == "$$$$$") {
                        break;
                }
                boards[now].name = tmp;
        }
        now = 0;
        while (std::getline(readFile, tmp)) {
                if (tmp.empty()) {
                        break;
                }
                if (tmp == "#####") {
                        now++;
                        continue;
                }
                else if (tmp == "$$$$$") {
                        break;
                }
                boards[now].url = tmp;
        }
        readFile.close();
}
Database::~Database() {
        save_before_crash();
}
void Database::store(Post post) {
        uint64_t id = hashing(post);
        std::unique_lock db_lock(db_mtx);
        std::unique_lock board_lock(boards[post.board_id].board_mtx);
        if (titles.contains(post.title)) {
                boards[post.board_id].bbs.insert(id);
        }
        else {
                titles.insert(post.title);
                boards[post.board_id].bbs.insert(id);
                std::string pwd = "../db/" + std::to_string(id);;
                std::filesystem::path p(pwd);
                std::filesystem::create_directories(p);
                std::string path = pwd + "/data.txt";
                if (std::ofstream readFile(path); readFile.is_open()) {
                        readFile <<(post.url + "\n");
                        readFile <<(post.title + "\n");
                        readFile <<(std::to_string(post.date) + "\n");
                        readFile <<(std::to_string(post.board_id) +"\n");
                        readFile.close();
                }
                path = pwd + "/index.html";
                if (std::ofstream readFile(path); readFile.is_open()) {
                        readFile <<"<html><head><meta charset='UTF-8'></head><body>";
                        readFile <<post.main;
                        readFile <<"</body></html>";
                        readFile.close();
                }
                // TODO() 이미지 저장은 추후 구현
        }


}

bool Database::serve(Board board, std::multiset<uint64_t,std::greater<>> &ret,
        const uint64_t at, const uint64_t range) {
        //at: 접근을 시작할 위치, range: serve할 게시글의 개수
        //1. 유효성 확인 -> board.bbs의 원소개수 확인하여 at이 존재하는지 확인
        //2. 최대 n개 serve
        std::shared_lock lock(board.board_mtx);
        if (board.bbs.size() <= at) {
                return false;
        }
        auto pt = board.bbs.begin();
        for (int i = 0; i < at; ++i) ++pt;
        if (board.bbs.size() < at + range ) {
                while (pt != board.bbs.end()) {
                        ret.insert(*pt);
                }
        }
        else {
                for (int i = 0; i < range; ++i) {
                        ret.insert(*pt);
                        ++pt;
                }
        }
        return true;
}

void Database::save_before_crash() {
        std::unique_lock lock(db_mtx);
        std::ofstream writeFile;
        writeFile.open("../db/titles.txt");
        if (!writeFile.is_open()) {
                std::cerr << "error occurred during saving titles..." << std::endl;
                exit(102);
        }
        for (auto pt = titles.begin(); pt != titles.end(); ++pt) {
                writeFile <<*pt <<"\n";
        }
        writeFile.close();
        writeFile.open("../db/board/boards.txt");
        if (!writeFile.is_open()) {
                std::cerr << "error occurred during saving boards..." << std::endl;
                exit(103);
        }
        for (auto pt = titles.begin(); pt != titles.end(); ++pt) {
                writeFile << *pt <<"\n";
        }
        uint64_t now = 0;
        for (; now <MAX_BOARD; ++now) {
                if (!boards[now].bbs.empty()) {
                        for (auto pt = boards[now].bbs.begin(); pt != boards[now].bbs.end(); ++pt) {
                                writeFile<< *pt <<"\n";
                        }
                }
                writeFile <<"#####\n";
        }
        writeFile <<"$$$$$\n";
        for (now = 0; now <MAX_BOARD; ++now) {
                if (boards[now].name.empty()) {
                        writeFile <<"#####\n";
                }
                else writeFile<< boards[now].name <<"\n";
        }
        writeFile <<"$$$$$\n";
        for (now = 0; now <MAX_BOARD; ++now) {
                if (boards[now].url.empty()) {
                        writeFile <<"#####\n";
                }
                else writeFile<< boards[now].url <<"\n";
        }
        writeFile <<"$$$$$\n";
        writeFile.close();
}
std::string Database::convert_time_string(const uint64_t time) {
        std::string ret = "";
        std::random_device rd;
        std::mt19937 gen(rd());
        if (time < 10000000000000) {
                ret+= std::to_string(time);
                std::uniform_int_distribution<> dis(100000, 999999);
                ret +=std::to_string(dis(gen));
        }
        else if (time < 1000000000000000) {
                ret+= std::to_string(time);
                std::uniform_int_distribution<> dis(1000, 9999);
                ret +=std::to_string(dis(gen));
        }
        else {
                ret += std::to_string(time);
        }
        return ret;
}

uint64_t Database::hashing(const std::string & str) {
        // FNV-1a 64bit로 hashing
        uint64_t hash = 14695981039346656037ULL;
        for (const char c : str) {
                hash ^= static_cast<uint64_t>(static_cast<unsigned char>(c));
                hash *= 1099511628211ULL;
        }
        return hash;
}

uint64_t Database::hashing(const Post & post) {
        // FNV-1a 64bit로 hashing
        return hashing(post.title);
}

DB_with_Comm::DB_with_Comm() {
        comm_thread = std::thread(&DB_with_Comm::server, this);
        comm_thread.detach();
}

Post process_received_data(const std::string &msg) {
        std::string url, title, date, html_content;
        char delimiter = '|';

        size_t pos1 = msg.find(delimiter);
        url = msg.substr(0, pos1);

        size_t pos2 = msg.find(delimiter, pos1 + 1);
        title = msg.substr(pos1 + 1, pos2 - (pos1 + 1));

        size_t pos3 = msg.find(delimiter, pos2 + 1);
        date = msg.substr(pos2 + 1, pos3 - (pos2 + 1));

        html_content = msg.substr(pos3 + 1);

        // TODO: url<-> board_id로 변환, date파싱 필요
        // 일단 예시 데이터대로 생성
        int date_int = 20260122;
        int board_id = 1;

        Post tmp(url, title, html_content, date_int, board_id);
        return tmp;
}

void DB_with_Comm::server() {
        const char* socket_path = "/tmp/cpp_python_socket";
        int server_fd, client_fd;
        struct sockaddr_un address;
        server_fd = socket(AF_UNIX, SOCK_STREAM, 0);
        if (server_fd < 0) return;
        unlink(socket_path);
        memset(&address, 0, sizeof(address));
        address.sun_family = AF_UNIX;
        strncpy(address.sun_path, socket_path, sizeof(address.sun_path) - 1);
        if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
                perror("bind failed");
                return;
        }
        if (listen(server_fd, 5) < 0) {
                perror("listen failed");
                return;
        }
        while (true) {
                client_fd = accept(server_fd, NULL, NULL);
                if (client_fd < 0) continue;
                std::cout << "CONNECTED" << std::endl;
                char buffer[65536];
                while (true) {
                        memset(buffer, 0, sizeof(buffer));

                        // 2. 버퍼 크기만큼만 읽기 (안전)
                        int valread = read(client_fd, buffer, sizeof(buffer) - 1);

                        if (valread <= 0) {
                                std::cout << "[DISCONNECTED] 연결 종료" << std::endl;
                                break;
                        }

                        // 3. 읽어온 바이트 그대로 string 생성 (인코딩 변환 없이 바이트 복사)
                        std::string msg(buffer, valread);

                        // 4. [검증] 그냥 찍지 말고 길이를 먼저 확인!
                        std::cout << "[SUCCESS] " << valread << " 바이트 수신함." << std::endl;

                        this->store(process_received_data(msg));

                        std::string ack = "ACK";
                        send(client_fd, ack.c_str(), ack.length(), 0);
                }
        }
}

int main() {
        std::string my_data = "경희대 공지사항 크롤링 요청: " + std::to_string(12345);
        DB_with_Comm DB;
        while (true) {

        }
        return 0;
}
/////////////////