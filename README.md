# bulldozer

#### 项目介绍
* bulldozer(服务端)主要用到redis、mysql、mongodb，其中redis为必须;
   1. redis存储request模板、主要包含:请求地址及参数、解析此request的方法函数事件、附带的数据信息等
   2. mysql、mongodb主要存储解析后的数据，其中mysql通过将json对象转换成sql语句实现通用的insert、update、delete、select操作；
****
#### 软件架构
![avatar](https://github.com/jiang19210/data/blob/master/bulldozer.png?raw=true)
****
#### 安装教程
* 安装nodejs、pm2，安装最新版本即可
* 安装redis(必须)、mongodb(不必须)、mysql(不必须)

#### 使用说明

* 配置db连接，完整配置如下:https://github.com/jiang19210/bulldozer/blob/master/config/local.json  
    1. 除了redis是必须，mongodb和mysql可以不进行配置；但是如果利用bulldozer存储数据到mysql或者mongodb就需要进行配置  
    2. redis配置中cluster里面是集群配置，和单机配置只需要一个即可，如果两个都配置了，会优先连接集群配置，既单机配置失效
* 运行命令：npm test 测试，npm start 用pm2启动，npm stop 用pm2 停止
* 打开地址 http://127.0.0.1:8080/ 如果正常就说明启动成功

****
* 客户端：https://github.com/jiang19210/bulldozer
* 完整例子：https://github.com/jiang19210/bulldozer-c-example