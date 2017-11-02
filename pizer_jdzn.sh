
#############################################################################
######################      target： 该文件用于一键启动项目  #####################
######################      author： pizer              #####################
######################      time：   2017.11.2          #####################
#############################################################################


#创建dockerfile

#pizer_env_jre
mkdir -p pizer_env_jre
cat <<EOT >> pizer_env_jre/Dockerfile
FROM java:8
WORKDIR /usr/pizer/
RUN wget http://mirrors.tuna.tsinghua.edu.cn/apache/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz
RUN tar -xvf apache-maven-3.5.2-bin.tar.gz
RUN rm -rf apache-maven-3.5.2-bin.tar.gz
RUN mkdir -p /usr/pizer/apache-maven-3.5.2/maven_repository
RUN chmod -R 777 /usr/pizer/apache-maven-3.5.2/

RUN mkdir -p /usr/pizer/java_app
RUN mkdir -p /usr/pizer/java_lib
RUN chmod -R 777 /usr/pizer/java_lib/
RUN mkdir -p /usr/pizer/app
ENV MAVEN_HOME /usr/pizer/apache-maven-3.5.2/
RUN ln -s /usr/pizer/apache-maven-3.5.2/bin/mvn /usr/bin/mvn
CMD ["mvn"]
EOT

#pizer_env_zookeeper
mkdir -p pizer_env_zookeeper
cat <<EOT >> pizer_env_zookeeper/Dockerfile
FROM zookeeper:3.4.10
EOT

#pizer_env_node
# HEALTHCHECK --interval=30s --timeout=3s \CMD npm install; nodemon app.js || exit 1
mkdir -p pizer_env_node
cat <<EOT >> pizer_env_node/Dockerfile
FROM node:7.9.0-alpine
RUN npm install -g nodemon
WORKDIR /usr/pizer/app
CMD ["/bin/sh", "-c", "npm install; nodemon app.js"]

EOT

#pizer_env_java_lib
mkdir -p pizer_env_java_lib
cat <<EOT >> pizer_env_java_lib/Dockerfile
FROM pizer_env_jre:latest
WORKDIR /usr/pizer/java_app
CMD ["/bin/sh", "-c", "rm -rf /usr/pizer/java_lib/*; mvn package -U"]
EOT

#pizer_env_java_app
mkdir -p pizer_env_java_app
cat <<EOT >> pizer_env_java_app/Dockerfile
FROM pizer_env_jre:latest
RUN mkdir -p /usr/pizer/java_app/logs
RUN chmod -R 777 /usr/pizer/java_app/logs
WORKDIR /usr/pizer/java_app
CMD ["/bin/sh", "-c", "mvn clean install package; java -jar java-dubbo-zookeeper-node-1.0-SNAPSHOT.jar"]
EOT


# 生成镜像

docker build -t pizer_env_jre ./pizer_env_jre
docker build -t pizer_env_zookeeper ./pizer_env_zookeeper
docker build -t pizer_env_node ./pizer_env_node
docker build -t pizer_env_java_lib ./pizer_env_java_lib
docker build -t pizer_env_java_app ./pizer_env_java_app


# 从git拉取代码
git clone https://github.com/PizerLiu/java-dubbo-zookeeper-node.git
cd java-dubbo-zookeeper-node/

# 将java项目移动到 /usr/pizer/java_app
mkdir /usr/pizer
mkdir /usr/pizer/java_app

cp java-dubbo-zookeeper-node/* -rf /usr/pizer/java_app

# 将node代码放入 /usr/pizer/app
mkdir /usr/pizer/app
cp node-zookeeper-dubbo-java/* -rf /usr/pizer/app

# 将volumes放入 /usr/pizer/volumes
mkdir /usr/pizer/volumes
cp volumes/* -rf /usr/pizer/volumes

# 创建网络
docker network create pizer_loacal_network

# 创建 pizer_jdzn.yml

cat <<EOT >> pizer_jdzn.yml
version: "2.1"

networks:
  default:
    external:
      name: pizer_loacal_network

services:

  pizer_env_zookeeper:
    image: 'pizer_env_zookeeper:latest'
    container_name: pizer_env_zookeeper
    hostname: pizer_env_zookeeper

  pizer_java_lib:
    image: 'pizer_env_java_lib:latest'
    container_name: pizer_java_lib
    volumes:
      - /usr/pizer/volumes/maven/conf:/usr/pizer/apache-maven-3.5.2/conf
      - /usr/pizer/java_app:/usr/pizer/java_app
      - /usr/pizer/java_lib:/usr/pizer/java_lib

  pizer_java_app:
    image: 'pizer_env_java_app:latest'
    container_name: pizer_java_app
    environment:
      - ZOOKEEPER_SERVER=pizer_env_zookeeper
    volumes:
      - /usr/pizer/java_app:/usr/pizer/java_app
      - /usr/pizer/java_lib:/usr/pizer/java_lib

  pizer_node_app:
    image: 'pizer_env_node:latest'
    container_name: pizer_node_app
    environment:
      - ZOOKEEPER_SERVER=pizer_env_zookeeper
    volumes:
      - /usr/pizer/app:/usr/pizer/app
    ports:
      - 5001:5000
    depends_on:
    - "pizer_java_app"
    - "pizer_java_lib"
EOT

# 设置 pizer_jdzn.yml 权限
chmod 777 pizer_jdzn.yml

# docker-compose启动容器
docker-compose -f pizer_jdzn.yml up -d

# 删除yml
rm -rf pizer_jdzn.yml










