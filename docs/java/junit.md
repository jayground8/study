# Quiz <!-- omit in toc -->
- [Static import](#static-import)
- [TestInstance lifecycle and @BeforeAll](#testinstance-lifecycle-and-beforeall)
- [BDD with Cucumber and Junit integration](#bdd-with-cucumber-and-junit-integration)


# Static import

이제 static import를 통해서 static method를 바로 import할 수 있다.

```java
package org.example;

public class Something {
    static public String hello() {
        return "hello";
    }
}
```

```java
package org.example;
import static org.example.Something.hello;

public class Main {
    public static void main(String[] args) {
        System.out.println(hello());
    }
}
```

Junit을 사용할 때 이렇게 볼 수 있다.

```java
import static org.junit.jupiter.api.Assertions.assertEquals;
```

# TestInstance lifecycle and @BeforeAll

기본적으로 method는 새로운 instance에서 실행이 된다.

```java
@TestInstance(TestInstance.Lifecycle.PER_METHOD)
public class ExampleTest {

    @Test
    void example1() {
        System.out.println(this.hashCode());
    }

    @Test
    void example2() {
        System.out.println(this.hashCode());
    }
}
```

하지만 `TestInstance.Lifecycle.PER_CLASS`로 설정을 하면 같은 instance에서 실행되는 것을 확인할 수 있다.

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ExampleTest {

    @Test
    void example1() {
        System.out.println(this.hashCode());
    }

    @Test
    void example2() {
        System.out.println(this.hashCode());
    }
}
```

그리고 `@BeforeAll`이나 `@AfterAll`은 같은 instance에서 실행될 수 있도록 Lifecycle를 설정해주거나

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ExampleTest {

    @BeforeAll
    void init() {}
}
```

static method로 정의해서 사용할 수 있다.

```java
public class ExampleTest {

    @BeforeAll
    static void init() {}
}
```

참고로 Junit5부터 Test class에 있는 test method가 public이 아니어도 괜찮다.

# BDD with Cucumber and Junit integration

`info.cukes.cucumber-java` package는 아래처럼 `1.2.6` 버전까지 있고, Java 17에서는 돌아가지 않았다.

![old package](/images/java/01-old-cucumber-java-package.png)

따라서 dependency 설정은 아래처럼 하고,

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>7.10.1</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>7.10.1</version>
    <scope>test</scope>
</dependency>
```

plugin에 이런 설정을 추가하였다.

```xml
<plugin>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <properties>
            <configurationParameters>
                cucumber.junit-platform.naming-strategy=long
            </configurationParameters>
        </properties>
    </configuration>
</plugin>
```

이렇게 `ticket_policy.feature` 파일을 추가하여 Gherkin 형식으로 작성을 한다.

![test directory](/images/java/02-cucumber-direcotry.png)


`ticket_policy.feature`
```gherkin
Feature: Ticket Policy
  A customer follow a policy of using tickets

  Scenario: Ticket has expired
    Given there is a ticket
    When ticket is expired
    Then you can't use the ticket to take a class
```

그리고 test logic을 `TicketPolicy` 클래스에 정의를 한다.

`TicketPolicy.java`
```java
public class TicketPolicy {
    @Given("there is a ticket")
    public void there_is_a_ticket() {
        // Write code here that turns the phrase above into concrete actions
//        throw new io.cucumber.java.PendingException();
    }

    @When("ticket is expired")
    public void ticket_is_expired() {
        // Write code here that turns the phrase above into concrete actions
//        throw new io.cucumber.java.PendingException();
    }

    @Then("you can't use the ticket to take a class")
    public void you_can_t_use_the_ticket_to_take_a_class() {
        // Write code here that turns the phrase above into concrete actions
//        throw new io.cucumber.java.PendingException();
    }
}
```