# List <!-- omit in toc -->
- [reflection and Java module](#reflection-and-java-module)
- [Set up Java modules in Intellij](#set-up-java-modules-in-intellij)


# reflection and Java module

[예제](https://github.com/jayground8/study-example/tree/main/example-maven-multi-modules)

이제 `World` 클래스를 아래처럼 작성해본다. `country`가 private field로 있다.

```java
public class World {
  private String country;

  public World() {
  }

  public World(String country) {
      this.country = country;
  }

  public String getCountry() {
      return country;
  }

  public static void world() {
      System.out.println("world2");
  }
}
```

이제 reflection API를 사용하면 아래처럼 private field도 이렇게 접근해서 설정해버릴 수도 있다.

```java
try {
  World world = new World("Korea");
  Class<?> worldClass = Class.forName("io.jayground8.hello.internal.World");
  Field countryField = worldClass.getDeclaredField("country");
  countryField.setAccessible(true);
  countryField.set(world, "USA");
  System.out.println(world.getCountry());
} catch (Exception e) {
  System.out.println(e);
}
```

그리고 public class는 어떤 package의 경로를 두던 다 접근 가능하다. internal이라고 이제 패키지 밖으로 공개하고 싶지 않지만 public으로 설정해야 되는 class가 있다라고 하면 패키지를 사용하는 사람이 원하면 접근해서 사용할 수 있다. 이렇게 특정 구현체에 의존하게 되면 해당 package가 변경되었을 때 의존하는 어플리케이션에 오류를 발생할 가능성이 높아진다.

![internal directory](/images/java/09-internal-directory.png)

이제 `package-info.java`를 정의해서 Java module를 정의해보면 어떻게 될까?

먼저 hello module에서 io.jayground8.hello만 명시적으로 노출했기 때문에, io.jayground8.hello.internal.World 클래스가 public이지만 접근 할 수 없게 된다.

```
module hello {
    exports io.jayground8.hello;
}
```

그래서 Intellij에서 친절하게 이렇게 에러가 보이는 것을 확인할 수 있다.

![java module prevent access internal](/images/java/10-java-module-prevent.png)

그리고 reflection은 어떻게 될까? `java.lang.reflect.InaccessibleObjectException: Unable to make field private java.lang.String io.jayground8.hello.internal.World.country accessible: module hello does not "opens io.jayground8.hello.internal" to module app` 처럼 에러가 나는 것을 확인 할 수 있다.


# Set up Java modules in Intellij

Java9에서 적용된 module을 테스트해보기 위해서 IntelliJ에서 project structure부터 셋팅을 해야했다. Project에 `hello.module`과 `main.module`을 구성하려고 하였다.

Intellij에서 empty project 생성

`hello.module`과 `main.module` 디렉터리를 두개 생성하고, src 디렉터리를 만들고 `Sources root`으로 변경한다. 그리고 이제 `main.module`에 `module-info.java` 파일을 추가한다.

![create module-info.java](/images/java/04-create-module-info.png)

그리고 `hello.module`에도 `module-info.java`를 동일하게 생성하려고 하지만, 보이지 않는다.

![can not create other module-info.java](/images/java/05-can-not-create-another-module-info.png)

하나의 프로젝트에서 복수의 모듈을 가질 수가 없게 되어서  `module-info.java`를 Intellij에서 생성을 할 수가 없었다. 그래서 `hello.module`과 `main.module`을 별도의 Intellij module(Java module과 별개로 Intellij에서 module이라는 단위로 구분을 한다)으로 설정을 해주었다. 새로 module을 생성할 때는 empty module 옵션이 없어서 import from exisiting sources 메뉴로 `hello.module`과 `main.module`의 디렉토리를 module로 생성하였다.

![new moudle from existing sources](/images/java/06-module-from-existing-sources.png)

먼저 `hello.module` 간단하게 아래처럼 `Hello`와 `World` 클래스를 만들었다.

```java
package io.jayground8.hello;

public class Hello {
    public static void hello() {
        System.out.println("hello");
    }
}
```

```java
package io.jayground8.hello;

public class World {
    public static void world() {
        System.out.println("world");
    }
}
```

그리고 `module-info.java`에서 `exports`로 다른 모듈에서 사용할 수 있도록 정의한다.

```java
module hello.module {
    exports io.jayground8.hello;
}
```

이제 `main.module`에서 사용해볼 때, 이렇게 Intellij에서 자동으로 셋팅을 할 수가 있다.

![import from hello module](/images/java/07-import-from-hello-module.png)

![set requires in main module](/images/java/08-set-requires-in-main-module.png)

그리고 짜잔 될줄 알았지만 `java: too many module declarations found` 에러가 발생하였다. empty project로 생성할 때 root directory가 Intellij module로 설정되어 있었고 아래처럼 정의가 되어 있었다. 이제 sourceFolder가 아래처럼 정의가 되어 있기 때문에 package-info.java가 하나가 아니라 여러개를 가지고 build를 하려고 해서 실패하는 것이었다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module type="GENERAL_MODULE" version="4">
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
    <content url="file://$MODULE_DIR$">
      <sourceFolder url="file://$MODULE_DIR$/hello.module/src" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/main.module/src" isTestSource="false" />
    </content>
    <orderEntry type="sourceFolder" forTests="false" />
  </component>
</module>
```

따라서 별도의 모듈로 `hello.module`과 `main.module`을 정의해줬기 때문에, 아래처럼 삭제해주고 Main을 실행하였다..

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module type="GENERAL_MODULE" version="4">
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
  </component>
</module>
```

```java
package io.jayground8.main;

import io.jayground8.hello.Hello;
import io.jayground8.hello.World;

public class Main {
    public static void main(String[] args) {
        Hello.hello();
        World.world();
    }
}
```

이제 정상적으로 console `hello`와 `world`가 찍히는 것을 확인할 수 있다.