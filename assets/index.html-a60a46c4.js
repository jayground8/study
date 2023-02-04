import{_ as e,M as t,p,q as i,R as s,t as n,N as o,a1 as l}from"./framework-96b046e1.js";const c={},r=l(`<h1 id="list" tabindex="-1"><a class="header-anchor" href="#list" aria-hidden="true">#</a> List <!-- omit in toc --></h1><ul><li><a href="#play-with-prisma">Play with Prisma</a></li></ul><h1 id="play-with-prisma" tabindex="-1"><a class="header-anchor" href="#play-with-prisma" aria-hidden="true">#</a> Play with Prisma</h1><p>Prisma 회사는 Prisma data platform이라는 프로덕트를 가지고 있는 회사인데, 오픈소스로 ORM 프레임워크를 제공한다. 많은 오픈소스 프로젝트들이 유지 보수가 안 되는데, 이렇게 오픈소스를 제공하면서 그걸 바탕으로 비지니스도 하는 회사가 있는 것이 유지 보수 측면에서 유리한 것 같기도 하다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">npm</span> init <span class="token parameter variable">--yes</span>
<span class="token function">npm</span> <span class="token function">install</span> typescript ts-node @types/node --save-dev
npx tsc <span class="token parameter variable">--init</span>
<span class="token function">npm</span> <span class="token function">install</span> prisma --save-dev
npx prisma init --datasource-provider mysql
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>prisma init</code>을 하면 <code>prisma/schema.prisma</code>라는 파일이 생성된다. 예제처럼 User와 Post model을 만들어본다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>generator client <span class="token punctuation">{</span>
  provider <span class="token operator">=</span> <span class="token string">&quot;prisma-client-js&quot;</span>
<span class="token punctuation">}</span>

datasource db <span class="token punctuation">{</span>
  provider <span class="token operator">=</span> <span class="token string">&quot;mysql&quot;</span>
  url      <span class="token operator">=</span> env<span class="token punctuation">(</span><span class="token string">&quot;DATABASE_URL&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

model User <span class="token punctuation">{</span>
  <span class="token function">id</span>    Int     @id @default<span class="token punctuation">(</span>autoincrement<span class="token punctuation">(</span><span class="token punctuation">))</span>
  email String  @unique
  name  String?
  posts Post<span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>

model Post <span class="token punctuation">{</span>
  <span class="token function">id</span>        Int     @id @default<span class="token punctuation">(</span>autoincrement<span class="token punctuation">(</span><span class="token punctuation">))</span>
  title     String
  content   String?
  published Boolean @default<span class="token punctuation">(</span>false<span class="token punctuation">)</span>
  author    User    @relation<span class="token punctuation">(</span>fields: <span class="token punctuation">[</span>authorId<span class="token punctuation">]</span>, references: <span class="token punctuation">[</span>id<span class="token punctuation">]</span><span class="token punctuation">)</span>
  authorId  Int
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>이제 <code>npx prisma migrate dev --name init</code>로 migration을 하면 database에 table들이 생성이 된다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> show tables<span class="token punctuation">;</span>
+--------------------+
<span class="token operator">|</span> Tables_in_mydb     <span class="token operator">|</span>
+--------------------+
<span class="token operator">|</span> Post               <span class="token operator">|</span>
<span class="token operator">|</span> User               <span class="token operator">|</span>
<span class="token operator">|</span> _prisma_migrations <span class="token operator">|</span>
+--------------------+
<span class="token number">3</span> rows <span class="token keyword">in</span> <span class="token builtin class-name">set</span> <span class="token punctuation">(</span><span class="token number">0.00</span> sec<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>그리고 Model에서 관계를 설정해서 기본으로 Foregin Key Contraint이 정의가 되었다. ON DELETE action에서 <code>Restrict</code>로 되어 있는 것을 확인할 수 있다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> show create table Post<span class="token punctuation">;</span>

KEY <span class="token variable"><span class="token variable">\`</span>Post_authorId_fkey<span class="token variable">\`</span></span> <span class="token punctuation">(</span><span class="token variable"><span class="token variable">\`</span>authorId<span class="token variable">\`</span></span><span class="token punctuation">)</span>,
  CONSTRAINT <span class="token variable"><span class="token variable">\`</span>Post_authorId_fkey<span class="token variable">\`</span></span> 
  FOREIGN KEY <span class="token punctuation">(</span><span class="token variable"><span class="token variable">\`</span>authorId<span class="token variable">\`</span></span><span class="token punctuation">)</span> 
  REFERENCES <span class="token variable"><span class="token variable">\`</span>User<span class="token variable">\`</span></span> <span class="token punctuation">(</span><span class="token variable"><span class="token variable">\`</span><span class="token function">id</span><span class="token variable">\`</span></span><span class="token punctuation">)</span> 
  ON DELETE RESTRICT ON UPDATE CASCADE
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>좀 더 유연하게 데이터를 관리하기 위해서 FK Constraint Database상에서 정의하지 않는 경우도 많이 보았다. Prisma에서는 이러한 FK Constraint을 지원하지 않은 데이터베이스에서 사용할 수 있도록 <code>relationMode</code> 옵션을 제공한다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>datasource db <span class="token punctuation">{</span>
  provider <span class="token operator">=</span> <span class="token string">&quot;mysql&quot;</span>
  url      <span class="token operator">=</span> env<span class="token punctuation">(</span><span class="token string">&quot;DATABASE_URL&quot;</span><span class="token punctuation">)</span>
  relationMode <span class="token operator">=</span> <span class="token string">&quot;prisma&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>다시 migration을 진행하고 table을 확인해보면 FK constraint이 없어 진 것을 확인할 수 있다. (migration이 alter table, drop index로 두 번에 걸쳐서 진행되기 때문에 명령어를 두 번 실행함)</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>npx prisma migrate dev <span class="token parameter variable">--name</span> relationMode
npx prisma migrate dev <span class="token parameter variable">--name</span> relationMode
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> show create table Post<span class="token punctuation">;</span>

PRIMARY KEY <span class="token punctuation">(</span><span class="token variable"><span class="token variable">\`</span><span class="token function">id</span><span class="token variable">\`</span></span><span class="token punctuation">)</span>,
  KEY <span class="token variable"><span class="token variable">\`</span>Post_authorId_fkey<span class="token variable">\`</span></span> <span class="token punctuation">(</span><span class="token variable"><span class="token variable">\`</span>authorId<span class="token variable">\`</span></span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>이렇게 migration을 하고 나면 prisma client에서 사용하는 Type들이 같이 update가 된다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>✔ Generated Prisma Client <span class="token punctuation">(</span><span class="token number">4.8</span>.1 <span class="token operator">|</span> library<span class="token punctuation">)</span> to ./node_modules/@prisma/client <span class="token keyword">in</span> 48ms
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>이제 primsa client을 통해서 아래처럼 데이터베이스에 데이터를 insert하고 query할 수 있다.</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> PrismaClient <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@prisma/client&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> prisma <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">PrismaClient</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> user <span class="token operator">=</span> <span class="token keyword">await</span> prisma<span class="token punctuation">.</span>user<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">data</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;may6&#39;</span><span class="token punctuation">,</span>
      <span class="token literal-property property">email</span><span class="token operator">:</span> <span class="token string">&#39;may6@example.com&#39;</span><span class="token punctuation">,</span>
      <span class="token literal-property property">posts</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">create</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;hello&#39;</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>user<span class="token punctuation">)</span>

  <span class="token keyword">const</span> users <span class="token operator">=</span> <span class="token keyword">await</span> prisma<span class="token punctuation">.</span>user<span class="token punctuation">.</span><span class="token function">findMany</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>users<span class="token punctuation">)</span>

  <span class="token keyword">const</span> usersWithPosts <span class="token operator">=</span> <span class="token keyword">await</span> prisma<span class="token punctuation">.</span>user<span class="token punctuation">.</span><span class="token function">findMany</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">include</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token literal-property property">posts</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>usersWithPosts<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">await</span> prisma<span class="token punctuation">.</span><span class="token function">$disconnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token punctuation">.</span><span class="token function">catch</span><span class="token punctuation">(</span><span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token parameter">e</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span>
    <span class="token keyword">await</span> prisma<span class="token punctuation">.</span><span class="token function">$disconnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    process<span class="token punctuation">.</span><span class="token function">exit</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>prisma cli중에 기존 DB의 schema를 가져오는 기능이 있다. <code>prisma/schema.prisma</code> 파일에 정의했던 Model들 지우고</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>generator client <span class="token punctuation">{</span>
  provider <span class="token operator">=</span> <span class="token string">&quot;prisma-client-js&quot;</span>
<span class="token punctuation">}</span>

datasource db <span class="token punctuation">{</span>
  provider     <span class="token operator">=</span> <span class="token string">&quot;mysql&quot;</span>
  url          <span class="token operator">=</span> env<span class="token punctuation">(</span><span class="token string">&quot;DATABASE_URL&quot;</span><span class="token punctuation">)</span>
  relationMode <span class="token operator">=</span> <span class="token string">&quot;prisma&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>명령어를 실행한다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>npx prisma db pull
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>이제 relationMode를 prisma로 설정하여서 이제 FK constraint이 생기지 않도록 했다. FK constraint 없기 떄문에 아래처럼 불러오게 된다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>model Post <span class="token punctuation">{</span>
  <span class="token function">id</span>        Int     @id @default<span class="token punctuation">(</span>autoincrement<span class="token punctuation">(</span><span class="token punctuation">))</span>
  title     String
  content   String?
  published Boolean @default<span class="token punctuation">(</span>false<span class="token punctuation">)</span>
  authorId  Int
<span class="token punctuation">}</span>

model User <span class="token punctuation">{</span>
  <span class="token function">id</span>    Int     @id @default<span class="token punctuation">(</span>autoincrement<span class="token punctuation">(</span><span class="token punctuation">))</span>
  email String  @unique
  name  String?
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>FK constraint이 있는 상태라면 이렇게 불러오게 된다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>model Post <span class="token punctuation">{</span>
  <span class="token function">id</span>        Int     @id @default<span class="token punctuation">(</span>autoincrement<span class="token punctuation">(</span><span class="token punctuation">))</span>
  title     String
  content   String?
  published Boolean @default<span class="token punctuation">(</span>false<span class="token punctuation">)</span>
  authorId  Int
  User      User    @relation<span class="token punctuation">(</span>fields: <span class="token punctuation">[</span>authorId<span class="token punctuation">]</span>, references: <span class="token punctuation">[</span>id<span class="token punctuation">]</span><span class="token punctuation">)</span>

  @@index<span class="token punctuation">(</span><span class="token punctuation">[</span>authorId<span class="token punctuation">]</span>, map: <span class="token string">&quot;Post_authorId_fkey&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

model User <span class="token punctuation">{</span>
  <span class="token function">id</span>    Int     @id @default<span class="token punctuation">(</span>autoincrement<span class="token punctuation">(</span><span class="token punctuation">))</span>
  email String  @unique
  name  String?
  Post  Post<span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>이제 FK가 없는 상태에서 DB pull을 하고 prisma client에서 사용하려면, <code>@relation</code>을 작성하여 추가해줘야 한다.</p><p>이제 migration한 history는 데이터베이스 _prisma_migrations 테이블에 저장이 된다. 데이터베이스에 migration file이 적용되었는지는 이 테이블의 데이터를 보고 판단하게 된다. 만약 _prisma_migrations 테이블의 데이터를 지우고 migration을 하면 어떻게 될까?</p><p>dev 명령어를 쓸 때는 이제 reset을 할 것인지 나오고</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>npx prisma migrate dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>deploy 명령어를 쓸 때는 이제 첫 migration file부터 시작을 하면서 이미 table들이 만들어져 있기때문에 에러가 발생한다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>npx prisma migrate deploy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>다른 migration tool처럼 이제 _prisma_migrations 테이블에 있는 데이터도 잘 보관해야 된다. 그리고 버전관리를 해서 history도 잘 남기는게 만약 데이터베이스에 문제가 있더라도 복구할 수 있겠다.</p><p>그리고 이제 이미 적용된 local file이 있다라고 하면 아랫처럼 추가할 수 있다. 이제 _prisma_migrations 테이블에 추가되는 것을 확인할 수 있다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>npx prisma migrate resolve <span class="token parameter variable">--applied</span> 20230111230206_init
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><code>npx prisma migrate dev</code> 명령어는 이제 shadow database라는 것을 만들고 거기에 migration file을 적용한다음에 prisma schema와 다른 것이 있는지 확인한다. 과정을 확인해보기 위해서 general_log을 table에 저장하도록 변경한다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SET global general_log <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
SET global log_output <span class="token operator">=</span> <span class="token string">&#39;table&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">select</span> convert<span class="token punctuation">(</span>argument using utf8<span class="token punctuation">)</span> from general_log<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>이제 <code>general_log</code>의 데이터를 보면 아래처럼 database를 생성하고 삭제하는 로그를 볼 수 있고, migration file들을 적용하고 schema를 확인하는 것을 볼 수 있다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>CREATE DATABASE <span class="token variable"><span class="token variable">\`</span>prisma_migrate_shadow_db_b3d435d9-ebc2-42b6-a117-9ef51cf6f0cf<span class="token variable">\`</span></span>
DROP DATABASE IF EXISTS <span class="token variable"><span class="token variable">\`</span>prisma_migrate_shadow_db_b3d435d9-ebc2-42b6-a117-9ef51cf6f0cf<span class="token variable">\`</span></span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>이제 메뉴얼하게 DB변경을 하면</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> describe User<span class="token punctuation">;</span>
+-------+--------------+------+-----+---------+----------------+
<span class="token operator">|</span> Field <span class="token operator">|</span> Type         <span class="token operator">|</span> Null <span class="token operator">|</span> Key <span class="token operator">|</span> Default <span class="token operator">|</span> Extra          <span class="token operator">|</span>
+-------+--------------+------+-----+---------+----------------+
<span class="token operator">|</span> <span class="token function">id</span>    <span class="token operator">|</span> int          <span class="token operator">|</span> NO   <span class="token operator">|</span> PRI <span class="token operator">|</span> NULL    <span class="token operator">|</span> auto_increment <span class="token operator">|</span>
<span class="token operator">|</span> email <span class="token operator">|</span> varchar<span class="token punctuation">(</span><span class="token number">191</span><span class="token punctuation">)</span> <span class="token operator">|</span> NO   <span class="token operator">|</span> UNI <span class="token operator">|</span> NULL    <span class="token operator">|</span>                <span class="token operator">|</span>
<span class="token operator">|</span> name  <span class="token operator">|</span> varchar<span class="token punctuation">(</span><span class="token number">191</span><span class="token punctuation">)</span> <span class="token operator">|</span> YES  <span class="token operator">|</span>     <span class="token operator">|</span> NULL    <span class="token operator">|</span>                <span class="token operator">|</span>
+-------+--------------+------+-----+---------+----------------+
<span class="token number">3</span> rows <span class="token keyword">in</span> <span class="token builtin class-name">set</span> <span class="token punctuation">(</span><span class="token number">0.00</span> sec<span class="token punctuation">)</span>

mysql<span class="token operator">&gt;</span> alter table User modify <span class="token function">column</span> name varchar<span class="token punctuation">(</span><span class="token number">192</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
Query OK, <span class="token number">0</span> rows affected <span class="token punctuation">(</span><span class="token number">0.01</span> sec<span class="token punctuation">)</span>
Records: <span class="token number">0</span>  Duplicates: <span class="token number">0</span>  Warnings: <span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>drift detection을 하게 된다.</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ npx prisma migrate dev
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource <span class="token string">&quot;db&quot;</span><span class="token builtin class-name">:</span> MySQL database <span class="token string">&quot;mydb&quot;</span> at <span class="token string">&quot;localhost:3306&quot;</span>

Drift detected: Your database schema is not <span class="token keyword">in</span> <span class="token function">sync</span> with your migration history.

The following is a summary of the differences between the expected database schema given your migrations files, and the actual schema of the database.

It should be understood as the <span class="token builtin class-name">set</span> of changes to get from the expected schema to the actual schema.

<span class="token punctuation">[</span>*<span class="token punctuation">]</span> Changed the <span class="token variable"><span class="token variable">\`</span>User<span class="token variable">\`</span></span> table
  <span class="token punctuation">[</span>*<span class="token punctuation">]</span> Altered <span class="token function">column</span> <span class="token variable"><span class="token variable">\`</span>name<span class="token variable">\`</span></span> <span class="token punctuation">(</span>type changed<span class="token punctuation">)</span>

? We need to reset the MySQL database <span class="token string">&quot;mydb&quot;</span> at <span class="token string">&quot;localhost:3306&quot;</span><span class="token builtin class-name">.</span>
Do you want to continue? All data will be lost. › <span class="token punctuation">(</span>y/N<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,45),u=s("code",null,"schema.prisma",-1),d={href:"https://github.com/prisma/prisma/issues/2377#issuecomment-821203725",target:"_blank",rel:"noopener noreferrer"};function v(m,k){const a=t("ExternalLinkIcon");return p(),i("div",null,[r,s("p",null,[n("이제 Prisma를 사용해서 web app을 만든다고 할 때, 이러한 "),u,n(" 파일을 서비스별로 나눌 수 있을까? 찾아보니깐 아쉽게도 "),s("a",d,[n("Github에 해당 관련 이슈"),o(a)]),n("가 올라와 있었고, 아직 Prisma에서 제공하는 방법은 없고 third party package를 사용하여 해결을 고민해볼 수 있다.")])])}const g=e(c,[["render",v],["__file","index.html.vue"]]);export{g as default};
