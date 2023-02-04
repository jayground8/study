# lua-nginx-module를 사용해서 Docker image 만들기

Nginx Docker image로 간단하게 뭔가 테스트를 해보다가, lua를 사용해서 테스트 시나리오를 만들고 싶었다. 이 간단한 lua 사용을 위해서 Official Nginx docker image 대신에 새로 Dockerfile을 작성하고 Image를 빌드하게 되었다. 하지만 lua-nginx-module을 추가하는 과정은 간단하지 않았다...

엄청난 삽질 끝에 필요한 소스코드를 받아서 build하는 식으로 작성으로 해결이 되었다. 테스트용으로 lua만 사용하면 되기 때문에 Docker layer별로 필요없는 파일을 지우거나, ubuntu대신에 alpine을 사용하거나 하는 것은 크게 신경쓰지 않았다.

먼저 [lua-nginx-module](https://github.com/openresty/lua-nginx-module#nginx-compatibility) 문서에서 Nginx와 호환성을 Nginx 1.19.3까지 테스트가 완료되었다고 나온다. 그리고 문서에 나온 것처럼 1.19.3은 openregistry domain으로 되어 있는 `https://openresty.org/download/nginx-1.19.3.tar.gz` URL로 받았다. 그리고 luajit도 openregistry에서 fork해서 관리하는 것을 사용하기 위해서 `https://github.com/openresty/luajit2/archive/refs/tags/v2.1-20230119.tar.gz`를 사용했다. luajit 2.x 버전을 사용해야 한다.

```dockerfile
FROM ubuntu:18.04

RUN apt-get update && apt-get install -y wget libpcre3-dev zlib1g-dev libssl-dev build-essential unzip lua5.1

RUN wget https://github.com/openresty/lua-nginx-module/archive/v0.10.22.zip && \
    unzip v0.10.22.zip && \
    rm v0.10.22.zip

RUN wget https://openresty.org/download/nginx-1.19.3.tar.gz && \
    tar -xzvf nginx-1.19.3.tar.gz && \
    rm nginx-1.19.3.tar.gz

RUN wget https://github.com/openresty/luajit2/archive/refs/tags/v2.1-20230119.tar.gz && \
    tar xzf v2.1-20230119.tar.gz && \
    rm v2.1-20230119.tar.gz && \
    cd luajit2-2.1-20230119 && \
    make install PREFIX=/usr/local
```

이제 `make install`을 실행할 때 PREFIX로 `/usr/local` 경로로 설치하도록 정의했다. 이제 luajit의 binary 파일과 include 파일들을 찾을 수 있게 환경변수 `LUAJIT_LIB`와 `LUAJIT_INC`의 경로를 정해준다. 그리고 `/user/local` prefix로 경로가 설정해줬으니 아래처럼 설정해준다. 그리고 `--add-dynamic-module` 플래그를 사용하였는데 이 옵션을 사용해야지 shared library file로 `/usr/local/nginx/modules/ngx_http_lua_module.so`가 생성된다. 이것을 nginx.conf 설정시 dynamic하게 load를 할 것이다.

```dockerfile
WORKDIR nginx-1.19.3

RUN export LUAJIT_LIB=/usr/local/bin && \
    export LUAJIT_INC=/usr/local/include/luajit-2.1 && \
    ./configure --add-dynamic-module=../lua-nginx-module-0.10.22 && \
    make
RUN make install
```

그리고 `lua-nginx-module 0.10.22`를 사용했는데, `lua_load_resty_core off;`를 사용할 수 없기 때문에 `lua-restry-core`와 `lua-restry-lrucache`도 설치가 필요하다.

```dockerfile
RUN wget https://github.com/openresty/lua-resty-core/archive/refs/tags/v0.1.24.tar.gz && \
    tar xzf v0.1.24.tar.gz && \
    cd lua-resty-core-0.1.24 && \
    make && \
    make install PREFIX=/opt/nginx
RUN wget https://github.com/openresty/lua-resty-lrucache/archive/refs/tags/v0.13.tar.gz && \
    tar xzf v0.13.tar.gz && \
    cd lua-resty-lrucache-0.13 && \
    make && \
    make install PREFIX=/opt/nginx
```

마지막으로 내가 정의한 `nginx.conf`를 복사하고, foreground로 실행하기 위해서 `-g 'damon off;'`를 CMD에 추가하였다.

```dockerfile
COPY nginx.conf /etc/nginx/nginx.conf
CMD ["/usr/local/nginx/sbin/nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
```

이제 `nginx.conf`에서 먼저 소스코드로 build해서 만들어진 `ngx_http_lua_module.so`를 로드하도록 `load_module`을 정의해줬고, `lua-restry-core`와 `lua-restry-lrucache`를 ` PREFIX=/opt/nginx`로 정의해서 설치했기 때문에 `lua_package_path`를 아래와 같이 정의 해줬다. 

`nginx.conf`
```conf
load_module /usr/local/nginx/modules/ngx_http_lua_module.so;

worker_processes  1;

events {
  worker_connections 1024;
}

http {
  lua_package_path "/opt/nginx/lib/lua/?.lua;;";
  access_log /dev/stdout;

  upstream node-app {
    server web:3000;
    keepalive 256;
  }
  server {
    listen 80;

    location /wait {
      content_by_lua_block {
        ngx.sleep(5)
        ngx.exec("/hello")
      }
    }

    location /hello {
      proxy_pass http://node-app;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # location /nginx_status {
    #     stub_status on;
    #     access_log off;
    # }
  }
}
```

그리고 마지막에 docker-compose로 container를 띄울 때 `libluajit-5.1.so.2`를 찾을 수 있도록 환경변수 `LD_LIBRARY_PATH=/usr/local/lib`를 추가해준다.

```yml
...생략
  nginx:
    build:
      context: .
      dockerfile: nginx.Dockerfile
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    environment:
      - LD_LIBRARY_PATH=/usr/local/lib
```

엄청난 삽질 끝에 docker-compose build를 성공하고, docker-compose up으로 에러없이 nginx를 lua와 함께 띄울 수 있었다...😂😂😂