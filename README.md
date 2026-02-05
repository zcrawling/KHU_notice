# KHU NOTICE SERVER
경희대학교의 각 게시판에 올라온 공지사항들을 정기적으로 크롤링하여 보기쉽게 정리하는 웹사이트입니다.  


### STATUS: 개발중

## DEPENDENCY
C++ 20
CMAKE 4.1+  
libasio-dev (1.28+)  
libcurl4-openssl-dev (8.5.0+)  
python3 (3.11+)  
CrowCpp(https://github.com/CrowCpp/Crow/tree/master#)  

## BUILD
//TODO()


### 개발일지 

01/25: implement database.cpp  
01/26: deprecate mongoose, adopt Crow-cpp, Python3-requests    
01/27: Refactored database.cpp for <mutex> and <thread>  
01/27: implement crawler.py  
01/28: implement communication class in database    
01/28: implement simple server, project suspend  
   
   
   
idea from... https://github.com/drsungwon/khu-today-app