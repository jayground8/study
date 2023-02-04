import{_ as i,M as l,p as o,q as c,R as n,t as s,N as a,a1 as t}from"./framework-96b046e1.js";const d={},r=n("h1",{id:"lua-nginx-module를-사용해서-docker-image-만들기",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#lua-nginx-module를-사용해서-docker-image-만들기","aria-hidden":"true"},"#"),s(" lua-nginx-module를 사용해서 Docker image 만들기")],-1),p={href:"https://github.com/jayground8/study-example/tree/main/example-nginx-lua",target:"_blank",rel:"noopener noreferrer"},u=n("p",null,"Nginx Docker image로 간단하게 뭔가 테스트를 해보다가, lua를 사용해서 테스트 시나리오를 만들고 싶었다. 이 간단한 lua 사용을 위해서 Official Nginx docker image 대신에 새로 Dockerfile을 작성하고 Image를 빌드하게 되었다. 하지만 lua-nginx-module을 추가하는 과정은 간단하지 않았다...",-1),v=n("p",null,"엄청난 삽질 끝에 필요한 소스코드를 받아서 build하는 식으로 작성으로 해결이 되었다. 테스트용으로 lua만 사용하면 되기 때문에 Docker layer별로 필요없는 파일을 지우거나, ubuntu대신에 alpine을 사용하거나 하는 것은 크게 신경쓰지 않았다.",-1),m={href:"https://github.com/openresty/lua-nginx-module#nginx-compatibility",target:"_blank",rel:"noopener noreferrer"},k=n("code",null,"https://openresty.org/download/nginx-1.19.3.tar.gz",-1),b=n("code",null,"https://github.com/openresty/luajit2/archive/refs/tags/v2.1-20230119.tar.gz",-1),g=t(`<div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token instruction"><span class="token keyword">FROM</span> ubuntu:18.04</span>

<span class="token instruction"><span class="token keyword">RUN</span> apt-get update &amp;&amp; apt-get install -y wget libpcre3-dev zlib1g-dev libssl-dev build-essential unzip lua5.1</span>

<span class="token instruction"><span class="token keyword">RUN</span> wget https://github.com/openresty/lua-nginx-module/archive/v0.10.22.zip &amp;&amp; <span class="token operator">\\</span>
    unzip v0.10.22.zip &amp;&amp; <span class="token operator">\\</span>
    rm v0.10.22.zip</span>

<span class="token instruction"><span class="token keyword">RUN</span> wget https://openresty.org/download/nginx-1.19.3.tar.gz &amp;&amp; <span class="token operator">\\</span>
    tar -xzvf nginx-1.19.3.tar.gz &amp;&amp; <span class="token operator">\\</span>
    rm nginx-1.19.3.tar.gz</span>

<span class="token instruction"><span class="token keyword">RUN</span> wget https://github.com/openresty/luajit2/archive/refs/tags/v2.1-20230119.tar.gz &amp;&amp; <span class="token operator">\\</span>
    tar xzf v2.1-20230119.tar.gz &amp;&amp; <span class="token operator">\\</span>
    rm v2.1-20230119.tar.gz &amp;&amp; <span class="token operator">\\</span>
    cd luajit2-2.1-20230119 &amp;&amp; <span class="token operator">\\</span>
    make install PREFIX=/usr/local</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>이제 <code>make install</code>을 실행할 때 PREFIX로 <code>/usr/local</code> 경로로 설치하도록 정의했다. 이제 luajit의 binary 파일과 include 파일들을 찾을 수 있게 환경변수 <code>LUAJIT_LIB</code>와 <code>LUAJIT_INC</code>의 경로를 정해준다. 그리고 <code>/user/local</code> prefix로 경로가 설정해줬으니 아래처럼 설정해준다. 그리고 <code>--add-dynamic-module</code> 플래그를 사용하였는데 이 옵션을 사용해야지 shared library file로 <code>/usr/local/nginx/modules/ngx_http_lua_module.so</code>가 생성된다. 이것을 nginx.conf 설정시 dynamic하게 load를 할 것이다.</p><div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token instruction"><span class="token keyword">WORKDIR</span> nginx-1.19.3</span>

<span class="token instruction"><span class="token keyword">RUN</span> export LUAJIT_LIB=/usr/local/bin &amp;&amp; <span class="token operator">\\</span>
    export LUAJIT_INC=/usr/local/include/luajit-2.1 &amp;&amp; <span class="token operator">\\</span>
    ./configure --add-dynamic-module=../lua-nginx-module-0.10.22 &amp;&amp; <span class="token operator">\\</span>
    make</span>
<span class="token instruction"><span class="token keyword">RUN</span> make install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>그리고 <code>lua-nginx-module 0.10.22</code>를 사용했는데, <code>lua_load_resty_core off;</code>를 사용할 수 없기 때문에 <code>lua-restry-core</code>와 <code>lua-restry-lrucache</code>도 설치가 필요하다.</p><div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token instruction"><span class="token keyword">RUN</span> wget https://github.com/openresty/lua-resty-core/archive/refs/tags/v0.1.24.tar.gz &amp;&amp; <span class="token operator">\\</span>
    tar xzf v0.1.24.tar.gz &amp;&amp; <span class="token operator">\\</span>
    cd lua-resty-core-0.1.24 &amp;&amp; <span class="token operator">\\</span>
    make &amp;&amp; <span class="token operator">\\</span>
    make install PREFIX=/opt/nginx</span>
<span class="token instruction"><span class="token keyword">RUN</span> wget https://github.com/openresty/lua-resty-lrucache/archive/refs/tags/v0.13.tar.gz &amp;&amp; <span class="token operator">\\</span>
    tar xzf v0.13.tar.gz &amp;&amp; <span class="token operator">\\</span>
    cd lua-resty-lrucache-0.13 &amp;&amp; <span class="token operator">\\</span>
    make &amp;&amp; <span class="token operator">\\</span>
    make install PREFIX=/opt/nginx</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>마지막으로 내가 정의한 <code>nginx.conf</code>를 복사하고, foreground로 실행하기 위해서 <code>-g &#39;damon off;&#39;</code>를 CMD에 추가하였다.</p><div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token instruction"><span class="token keyword">COPY</span> nginx.conf /etc/nginx/nginx.conf</span>
<span class="token instruction"><span class="token keyword">CMD</span> [<span class="token string">&quot;/usr/local/nginx/sbin/nginx&quot;</span>, <span class="token string">&quot;-c&quot;</span>, <span class="token string">&quot;/etc/nginx/nginx.conf&quot;</span>, <span class="token string">&quot;-g&quot;</span>, <span class="token string">&quot;daemon off;&quot;</span>]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>이제 <code>nginx.conf</code>에서 먼저 소스코드로 build해서 만들어진 <code>ngx_http_lua_module.so</code>를 로드하도록 <code>load_module</code>을 정의해줬고, <code>lua-restry-core</code>와 <code>lua-restry-lrucache</code>를 <code> PREFIX=/opt/nginx</code>로 정의해서 설치했기 때문에 <code>lua_package_path</code>를 아래와 같이 정의 해줬다.</p><p><code>nginx.conf</code></p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>load_module /usr/local/nginx/modules/ngx_http_lua_module.so;

worker_processes  1;

events {
  worker_connections 1024;
}

http {
  lua_package_path &quot;/opt/nginx/lib/lua/?.lua;;&quot;;
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
        ngx.exec(&quot;/hello&quot;)
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>그리고 마지막에 docker-compose로 container를 띄울 때 <code>libluajit-5.1.so.2</code>를 찾을 수 있도록 환경변수 <code>LD_LIBRARY_PATH=/usr/local/lib</code>를 추가해준다.</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token punctuation">...</span>생략
  <span class="token key atrule">nginx</span><span class="token punctuation">:</span>
    <span class="token key atrule">build</span><span class="token punctuation">:</span>
      <span class="token key atrule">context</span><span class="token punctuation">:</span> .
      <span class="token key atrule">dockerfile</span><span class="token punctuation">:</span> nginx.Dockerfile
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;80:80&quot;</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./nginx.conf<span class="token punctuation">:</span>/etc/nginx/nginx.conf<span class="token punctuation">:</span>ro
    <span class="token key atrule">deploy</span><span class="token punctuation">:</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
        <span class="token key atrule">limits</span><span class="token punctuation">:</span>
          <span class="token key atrule">cpus</span><span class="token punctuation">:</span> <span class="token string">&#39;0.50&#39;</span>
          <span class="token key atrule">memory</span><span class="token punctuation">:</span> 512M
        <span class="token key atrule">reservations</span><span class="token punctuation">:</span>
          <span class="token key atrule">cpus</span><span class="token punctuation">:</span> <span class="token string">&#39;0.25&#39;</span>
          <span class="token key atrule">memory</span><span class="token punctuation">:</span> 256M
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> LD_LIBRARY_PATH=/usr/local/lib
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>엄청난 삽질 끝에 docker-compose build를 성공하고, docker-compose up으로 에러없이 nginx를 lua와 함께 띄울 수 있었다...😂😂😂</p>`,13);function x(_,y){const e=l("ExternalLinkIcon");return o(),c("div",null,[r,n("p",null,[n("a",p,[s("예제"),a(e)])]),u,v,n("p",null,[s("먼저 "),n("a",m,[s("lua-nginx-module"),a(e)]),s(" 문서에서 Nginx와 호환성을 Nginx 1.19.3까지 테스트가 완료되었다고 나온다. 그리고 문서에 나온 것처럼 1.19.3은 openregistry domain으로 되어 있는 "),k,s(" URL로 받았다. 그리고 luajit도 openregistry에서 fork해서 관리하는 것을 사용하기 위해서 "),b,s("를 사용했다. luajit 2.x 버전을 사용해야 한다.")]),g])}const f=i(d,[["render",x],["__file","index.html.vue"]]);export{f as default};
