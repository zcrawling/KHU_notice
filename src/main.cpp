#include "../include/crow.h"
#include <unistd.h>
#include <database.h>

int main() {
    crow::SimpleApp app;
    DB_with_Comm DB;
    CROW_ROUTE(app, "/")
    ([&]() {
        auto page = crow::mustache::load("index.html");
        crow::mustache::context ctx;
        ctx["db_content"] = DB.serve();
        return page.render(ctx);
    });

    // 2. 경로 (/<int>) GET 요청: int형 인자를 db.serve(int)에 전달
    CROW_ROUTE(app, "/<int>")
    ([&](int id) {
        auto page = crow::mustache::load("post.html");
        crow::mustache::context ctx;
        ctx["db_content"] = DB.serve(id);
        ctx["current_id"] = id;
        return page.render(ctx);
    });
    app.port(8080).multithreaded().run();
}
