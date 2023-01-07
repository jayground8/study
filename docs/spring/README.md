# Quiz <!-- omit in toc -->
- [validate request with jakarta api validation](#validate-request-with-jakarta-api-validation)
- [deploy maven package to Github package](#deploy-maven-package-to-github-package)
- [generate code with openapi-generator-maven-plugin](#generate-code-with-openapi-generator-maven-plugin)

# validate request with jakarta api validation

`jakarta-api-validation`을 통해서 Object에 조건을 주고 Validation을 하도록 해보자. Spring boot로 POST request가 올 때, payload에 특정 값이 없으면 Bad request를 내도록 한다.


아래와 같이 `jakarta.validation-api`와 Spring boot에서 Bean validation을 사용할 수 있도록 `spring-boot-starter-validation`도 추가되어야 한다.
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>jakarta.validation</groupId>
        <artifactId>jakarta.validation-api</artifactId>
        <version>3.0.2</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
<dependency>-->
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

`@NotNull` 어노테이션으로 이제 Cat object가 JSON으로 serialize될 때 Null이 아니어야 된다는 Constraint를 작성하였다.

```java
public class Cat {
    private String id;
    private String name;
    private Integer age;

    public Cat() {
    }

    public Cat(String id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    @NotNull
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getAge() {
        return age;
    }
}
```

이제 Controller에서 `@Valid` 어노테이션으로 유효한지 확인하도록 한다.

```java
@RestController
public class CatController {
    @PostMapping(value = "/cats", produces = MediaType.APPLICATION_JSON_VALUE)
    public Cat registerCat(@RequestBody @Valid Cat cat) {
        System.out.println(cat);
        return cat;
    }
}
```

Payload에 id를 보내면 정상적으로 200 응답이 온다.

```bash
$ curl -i -X POST \
    -H "Content-type: application/json" \
    -d '{"id":"1"}' \
    localhost:8080/cats
HTTP/1.1 200 
Content-Type: application/json
Transfer-Encoding: chunked
Date: Fri, 06 Jan 2023 06:12:22 GMT

{"id":"1","name":null,"age":null}%
```

하지만 id 값을 보내지 않으면 400 Bad Request 응답을 받게 된다.

```bash
$ curl -i -X POST \
    -H "Content-type: application/json" \
    -d '{"name":"Toto"}' \
    localhost:8080/cats
HTTP/1.1 400 
Content-Type: application/json
Transfer-Encoding: chunked
Date: Fri, 06 Jan 2023 06:13:09 GMT
Connection: close

{"timestamp":"2023-01-06T06:13:09.065+00:00","status":400,"error":"Bad Request","path":"/cats"}%   
```

# deploy maven package to Github package

Nexus repository 3을 사용하여 직접 private repository를 구축하여 사용할 수도 있다. 하지만 이번에는 Github package를 사용해본다. Github package을 통해 Maven, Gradle, NuGet, npm 등 다양한 repository를 사용할 수 있다. 

아래와 같이 Github action을 통해서 해당 repository에 있는 source code를 build하고 package를 repository에 deploy 할 수 있다. 아래의 `server-id`는 해당 코드가 있는 Repository 이름이 되어야 한다.

```yml
name: Create package

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Set up Java 11
        uses: actions/setup-java@v1
        with:
          java-version: 11
          server-id: something
          settings-path: ${{ github.workspace }}

      - name: Build with Maven
        run: mvn -B package --file pom.xml

      - name: Publish to GitHub Packages Apache Maven
        run: mvn deploy -s $GITHUB_WORKSPACE/settings.xml
        env:
          GITHUB_TOKEN: ${{ github.token }}
```

해당 Github action의 workflow가 정상적으로 돌고 나면 아래처럼 package가 등록된 것을 확인 할 수 있다.

![deployed maven package](/images/spring/02-deploy-maven-package-to-github-package.png)

이렇게 Github package에 등록된 package를 사용하려면 Github classic access token를 발급해야 한다.

> You need an access token to publish, install, and delete private, internal, and public packages.

![github classic access token](/images/spring/04-github-classic-token.png)

read package 권한을 부여해서 Github package에 접근할 수 있도록 한다.

![permission scope of access token](/images/spring/05-github-classic-token-package-read-permission.png)

그리고 Maven 실행 관련 설정을 위해서 `~/.m2/settings.xml`를 아래처럼 작성한다.

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                      http://maven.apache.org/xsd/settings-1.0.0.xsd">

  <activeProfiles>
    <activeProfile>github</activeProfile>
  </activeProfiles>

  <profiles>
    <profile>
      <id>github</id>
      <repositories>
        <repository>
          <id>central</id>
          <url>https://repo1.maven.org/maven2</url>
        </repository>
        <repository>
          <id>github</id>
          <url>https://maven.pkg.github.com/jayground8/something</url>
          <snapshots>
            <enabled>true</enabled>
          </snapshots>
        </repository>
      </repositories>
    </profile>
  </profiles>

  <servers>
    <server>
      <id>github</id>
      <username>jayground8</username>
      <password>발급한 github access token</password>
    </server>
  </servers>
</settings>
```

해당 package를 사용하는 곳에서 dependency에 정의하면 된다.

![package](/images/spring/03-github-package.png)

# generate code with openapi-generator-maven-plugin

`API first` 방식으로 개발을 할 때, `openapi-generator-maven-plugin`을 활용할 수 있다. 

1. 먼저 Open API specification에 맞춰서 작성한다.

```yaml
openapi: 3.0.1
info:
  title: Cat API
  description: Example
  version: 0.0.1
paths:
  /cats:
    post:
      summary: register a cat
      description: register new cat
      operationId: regiterCat
      requestBody:
        description: register new cat
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Cat'
            examples:
              application/json:
                value:
                  id: "1"
                  name: "Toto"
                  age: 10
      responses:
        "200":
          description: successful operation
          content:
            "application/json; charset=utf-8":
              schema:
                $ref: '#/components/schemas/Cat'
              examples:
                application/json:
                  value:
                    id: "1"
                    name: "Toto"
                    age: 10
    get:
      summary: List all cats
      description: Returns all cats
      operationId: getAllCats
      responses:
        "200":
          description: successful operation
          content:
            "application/json; charset=utf-8":
              schema:
                type: "array"
                items:
                  $ref: '#/components/schemas/Cat'
              examples:
                application/json:
                  value:
                    - id: "1"
                      nam: "Durian"
                      age: 8
                    - id: "2"
                      nam: "Coco"
                      age: 10
                    - id: "3"
                      nam: "Toto"
                      age: 10
        "400":
          description: Invalid ID supplied
          content: {}
  /cat/{id}:
    get:
      summary: Find cat by ID
      description: Returns a single cat
      operationId: getCatByID
      parameters:
        - name: id
          in: path
          description: ID of cat to get
          schema:
            type: string
          required: true
          example: 10
      responses:
        "200":
          description: successful operation
          content:
            "application/json; charset=utf-8":
              schema:
                $ref: '#/components/schemas/Cat'
              examples:
                application/json:
                  value:
                    id: "1"
                    name: "Toto"
                    age: 10
                    # name: "pizza"
                    # version: "1.0.0"
                    # see https://github.com/apiaryio/dredd/issues/1430 for why
        "400":
          description: Invalid ID supplied
          content: {}
        "404":
          description: Cat not found
          content: {}
components:
  schemas:
    Cat:
      type: object
      required:
        - id
        - name
        - age
      properties:
        id:
          type: string
        name:
          type: string
        age:
          type: integer
```

2. spring initializr로 spring project를 생성하고, `pom.xml`에 dependency를 아래와 같이 적용한다.

`Spring Boot 2.x`를 사용할 떄는 아래와 같이 필요하고

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>jakarta.validation</groupId>
        <artifactId>jakarta.validation-api</artifactId>
        <version>2.0.2</version>
    </dependency>

    <dependency>
        <groupId>javax.annotation</groupId>
        <artifactId>javax.annotation-api</artifactId>
        <version>1.3.2</version>
    </dependency>

    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-swagger2</artifactId>
        <version>3.0.0</version>
    </dependency>

    <dependency>
        <groupId>org.openapitools</groupId>
        <artifactId>jackson-databind-nullable</artifactId>
        <version>0.2.4</version>
    </dependency>
</dependencies>
```

`Spring Boot 3.x`을 사용할 경우에는 아래와 같이 정의해야 한다. 

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>jakarta.validation</groupId>
        <artifactId>jakarta.validation-api</artifactId>
        <version>3.0.2</version>
    </dependency>

    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-swagger2</artifactId>
        <version>3.0.0</version>
    </dependency>

    <dependency>
        <groupId>org.openapitools</groupId>
        <artifactId>jackson-databind-nullable</artifactId>
        <version>0.2.4</version>
    </dependency>
</dependencies>
```

그리고 `plugin`에 아래와 같이 추가해준다. Spring Boot 3.x를 사용할 경우에는 `<useSpringBoot3>true</useSpringBoot3>`를 설정해줘야 한다. Configuration options은 [이 문서](https://openapi-generator.tech/docs/generators/spring/)를 참고 하면 된다.

```xml
<plugins>
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
    <plugin>
        <groupId>org.openapitools</groupId>
        <artifactId>openapi-generator-maven-plugin</artifactId>
        <version>6.2.1</version>
        <executions>
            <execution>
                <goals>
                    <goal>generate</goal>
                </goals>
                <configuration>
                    <inputSpec>
                        ${project.basedir}/src/main/resources/cats.yml
                    </inputSpec>
                    <generatorName>spring</generatorName>
                    <apiPackage>io.jayground8.apifirst.openapi.api</apiPackage>
                    <modelPackage>io.jayground8.apifirst.openapi.model</modelPackage>
                    <supportingFilesToGenerate>
                        ApiUtil.java
                    </supportingFilesToGenerate>
                    <configOptions>
                        <useSpringBoot3>true</useSpringBoot3>
                        <delegatePattern>true</delegatePattern>
                    </configOptions>
                </configuration>
            </execution>
        </executions>
    </plugin>
</plugins>
```

3. `mvn install`로 최종 jar 파일을 만든다. 아래와 같이 코드가 생성된 것을 확인 할 수 있다.

![generated code](/images/spring/01-spring-openapi-generate-code.png)

```bash
$ curl -i localhost:8888/cats 
HTTP/1.1 501 
Content-Length: 0
Date: Fri, 06 Jan 2023 01:34:21 GMT
Connection: close
```

```bash
$ curl -i localhost:8888/cats/1
HTTP/1.1 501 
Content-Length: 0
Date: Fri, 06 Jan 2023 01:36:53 GMT
Connection: close
```

```bash
$ curl -i \
    -H 'Content-type: application/json' \
    -d '{"id":"1", "name":"Toto", "age":10}' \
    -X POST localhost:8888/cats
HTTP/1.1 501 
Content-Length: 0
Date: Fri, 06 Jan 2023 01:37:43 GMT
Connection: close
```

그런데 생성된 코드를 확인해보면, Jakarta validation의 어노테이션으로 getter의 return 값이 Null이 아니어야 하는 Contraint를 준 것을 확인할 수 있다.

```java
public class Cat {
    // 생략
    public @NotNull String getId() {
        return this.id;
    }

    public @NotNull String getName() {
        return this.name;
    }

    public @NotNull Integer getAge() {
        return this.age;
    }
}
```

그리고 아래처럼 `@Valid` 어노테이션으로 Payload로 보내는 값의 유효성을 체크하게 된다.

```java
@RequestMapping(
    method = {RequestMethod.POST},
    value = {"/cats"},
    produces = {"application/json; charset=utf-8"},
    consumes = {"application/json"}
)
default ResponseEntity<Cat> regiterCat(
    @Parameter(name = "Cat",description = "register new cat",required = true) 
    @RequestBody @Valid Cat cat) {
    return this.getDelegate().regiterCat(cat);
}
```

Spring에서 Validation이 정상적으로 작동할 수 있도록 아래와 같이 dependency를 추가한다.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

🤔 흠 이렇게 open api generator로 spring code를 만들고 나서 서버를 실행하면 아래처럼 OAS3.0의 examples 값을 return 해주지 않을까 기대하였다.  Mocking Server를 실행할 수 있는 `Prism`처럼 examples에 정의된 값을 리턴 해주지는 않는다. Request payload를 validation하고, Response를 어떻게 보내줘야 하는지 OAS를 통해서 만들어지고 그것에 맞춰서 코드를 작성하는 것이 목적이고, Mocking server를 제공하려는 목적은 아닌 것으로 보인다.

```yml
responses:
    "200":
        description: successful operation
        content:
        "application/json; charset=utf-8":
            schema:
            $ref: '#/components/schemas/Cat'
            examples:
            application/json:
                value:
                id: "1"
                name: "Toto"
                age: 10
```

```bash
npm install --global @stoplight/prism-cli
prism mock -p 9999 cats.yml

```