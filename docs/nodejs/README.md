# List <!-- omit in toc -->
- [Play with Prisma](#play-with-prisma)


# Play with Prisma

Prisma 회사는 Prisma data platform이라는 프로덕트를 가지고 있는 회사인데, 오픈소스로 ORM 프레임워크를 제공한다. 많은 오픈소스 프로젝트들이 유지 보수가 안 되는데, 이렇게 오픈소스를 제공하면서 그걸 바탕으로 비지니스도 하는 회사가 있는 것이 유지 보수 측면에서 유리한 것 같기도 하다.

```bash
npm init --yes
npm install typescript ts-node @types/node --save-dev
npx tsc --init
npm install prisma --save-dev
npx prisma init --datasource-provider mysql
```

`prisma init`을 하면 `prisma/schema.prisma`라는 파일이 생성된다. 예제처럼 User와 Post model을 만들어본다.

```bash
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

이제 `npx prisma migrate dev --name init`로 migration을 하면 database에 table들이 생성이 된다.

```bash
mysql> show tables;
+--------------------+
| Tables_in_mydb     |
+--------------------+
| Post               |
| User               |
| _prisma_migrations |
+--------------------+
3 rows in set (0.00 sec)
```

그리고 Model에서 관계를 설정해서 기본으로 Foregin Key Contraint이 정의가 되었다. ON DELETE action에서 `Restrict`로 되어 있는 것을 확인할 수 있다.

```bash
mysql> show create table Post;

KEY `Post_authorId_fkey` (`authorId`),
  CONSTRAINT `Post_authorId_fkey` 
  FOREIGN KEY (`authorId`) 
  REFERENCES `User` (`id`) 
  ON DELETE RESTRICT ON UPDATE CASCADE
```

좀 더 유연하게 데이터를 관리하기 위해서 FK Constraint Database상에서 정의하지 않는 경우도 많이 보았다. Prisma에서는 이러한 FK Constraint을 지원하지 않은 데이터베이스에서 사용할 수 있도록 `relationMode` 옵션을 제공한다.

```bash
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

다시 migration을 진행하고 table을 확인해보면 FK constraint이 없어 진 것을 확인할 수 있다. (migration이 alter table, drop index로 두 번에 걸쳐서 진행되기 때문에 명령어를 두 번 실행함)

```bash
npx prisma migrate dev --name relationMode
npx prisma migrate dev --name relationMode
```

```bash
mysql> show create table Post;

PRIMARY KEY (`id`),
  KEY `Post_authorId_fkey` (`authorId`)
```

이렇게 migration을 하고 나면 prisma client에서 사용하는 Type들이 같이 update가 된다.

```bash
✔ Generated Prisma Client (4.8.1 | library) to ./node_modules/@prisma/client in 48ms
```

이제 primsa client을 통해서 아래처럼 데이터베이스에 데이터를 insert하고 query할 수 있다.

```js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'may6',
      email: 'may6@example.com',
      posts: {
        create: {
          title: 'hello'
        }
      }
    }
  })
  console.log(user)

  const users = await prisma.user.findMany()
  console.log(users)

  const usersWithPosts = await prisma.user.findMany({
    include: {
      posts: true
    }
  })
  console.log(usersWithPosts)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

prisma cli중에 기존 DB의 schema를 가져오는 기능이 있다. `prisma/schema.prisma` 파일에 정의했던 Model들 지우고

```bash
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}
```

명령어를 실행한다.

```bash
npx prisma db pull
```

이제 relationMode를 prisma로 설정하여서 이제 FK constraint이 생기지 않도록 했다. FK constraint 없기 떄문에 아래처럼 불러오게 된다.

```bash
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

FK constraint이 있는 상태라면 이렇게 불러오게 된다.

```bash
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int
  User      User    @relation(fields: [authorId], references: [id])

  @@index([authorId], map: "Post_authorId_fkey")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  Post  Post[]
}
```

이제 FK가 없는 상태에서 DB pull을 하고 prisma client에서 사용하려면, `@relation`을 작성하여 추가해줘야 한다.

이제 migration한 history는 데이터베이스 _prisma_migrations 테이블에 저장이 된다. 데이터베이스에 migration file이 적용되었는지는 이 테이블의 데이터를 보고 판단하게 된다. 만약 _prisma_migrations 테이블의 데이터를 지우고 migration을 하면 어떻게 될까?

dev 명령어를 쓸 때는 이제 reset을 할 것인지 나오고

```bash
npx prisma migrate dev
```

deploy 명령어를 쓸 때는 이제 첫 migration file부터 시작을 하면서 이미 table들이 만들어져 있기때문에 에러가 발생한다.

```bash
npx prisma migrate deploy
```

다른 migration tool처럼 이제 _prisma_migrations 테이블에 있는 데이터도 잘 보관해야 된다. 그리고 버전관리를 해서 history도 잘 남기는게 만약 데이터베이스에 문제가 있더라도 복구할 수 있겠다.

그리고 이제 이미 적용된 local file이 있다라고 하면 아랫처럼 추가할 수 있다. 이제 _prisma_migrations 테이블에 추가되는 것을 확인할 수 있다.

```bash
npx prisma migrate resolve --applied 20230111230206_init
```

`npx prisma migrate dev` 명령어는 이제 shadow database라는 것을 만들고 거기에 migration file을 적용한다음에 prisma schema와 다른 것이 있는지 확인한다. 과정을 확인해보기 위해서 general_log을 table에 저장하도록 변경한다.

```bash
SET global general_log = 1;
SET global log_output = 'table';
select convert(argument using utf8) from general_log;
```

이제 `general_log`의 데이터를 보면 아래처럼 database를 생성하고 삭제하는 로그를 볼 수 있고, migration file들을 적용하고 schema를 확인하는 것을 볼 수 있다.

```bash
CREATE DATABASE `prisma_migrate_shadow_db_b3d435d9-ebc2-42b6-a117-9ef51cf6f0cf`
DROP DATABASE IF EXISTS `prisma_migrate_shadow_db_b3d435d9-ebc2-42b6-a117-9ef51cf6f0cf` 
```

이제 메뉴얼하게 DB변경을 하면

```bash
mysql> describe User;
+-------+--------------+------+-----+---------+----------------+
| Field | Type         | Null | Key | Default | Extra          |
+-------+--------------+------+-----+---------+----------------+
| id    | int          | NO   | PRI | NULL    | auto_increment |
| email | varchar(191) | NO   | UNI | NULL    |                |
| name  | varchar(191) | YES  |     | NULL    |                |
+-------+--------------+------+-----+---------+----------------+
3 rows in set (0.00 sec)

mysql> alter table User modify column name varchar(192);
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

drift detection을 하게 된다.

```bash
$ npx prisma migrate dev
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "mydb" at "localhost:3306"

Drift detected: Your database schema is not in sync with your migration history.

The following is a summary of the differences between the expected database schema given your migrations files, and the actual schema of the database.

It should be understood as the set of changes to get from the expected schema to the actual schema.

[*] Changed the `User` table
  [*] Altered column `name` (type changed)

? We need to reset the MySQL database "mydb" at "localhost:3306".
Do you want to continue? All data will be lost. › (y/N)
```

이제 Prisma를 사용해서 web app을 만든다고 할 때, 이러한 `schema.prisma` 파일을 서비스별로 나눌 수 있을까? 찾아보니깐 아쉽게도 [Github에 해당 관련 이슈](https://github.com/prisma/prisma/issues/2377#issuecomment-821203725)가 올라와 있었고, 아직 Prisma에서 제공하는 방법은 없고 third party package를 사용하여 해결을 고민해볼 수 있다.