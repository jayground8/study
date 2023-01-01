# 문제 <!-- omit in toc -->
- [Spring Security를 Component 방식으로 설정을 해보자](#spring-security를-component-방식으로-설정을-해보자)


# Spring Security를 Component 방식으로 설정을 해보자

Spring boot `3.0.1`을 사용하였고, 따라서 spring-security-web `6.0.1`를 사용하게 된다. 과거의 많은 예제들이 `WebSecurityConfigurerAdapter` 클래스의 method들을 override하여 설정하는 것으로 나와 있다. 하지만 최근 버전에서는 `WebSecurityConfigurerAdapter`는 Deprecated되었고, Bean에 등록하는 방식으로 Spring security 설정을 하는 것을 지양한다.

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.0.1</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
```

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

먼저 Basic authentication을 사용하고, 모든 request에 대해서 인증을 하도록 설정한다.

```java
@Configuration
public class WebAuthorizationConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.httpBasic();
        http.authorizeHttpRequests().anyRequest().authenticated();
        return http.build();
    }
}
```

Spring Security에서는 사용자가 Request를 하면 Authentication filter -> Authentication manager -> Authentication provider -> User details service, password encoder -> Security context 흐름을 타게 된다. Database처럼 persistent system이 필요 없고 user를 생성할 수 있는(`UserDetailsService`는 username으로 User를 가져오는 역할만 하고, `UserDetailsManger`는 User를 생성하거나 비밀번호를 변경하는 추가적인 메소드를 제공한다) `InMemoryUserDetailsManager`와 password를 plain text로 `NoOpPasswordEncoder`를 사용해보자. User를 생성하기 위해서 User builder 클래스를 사용하였다.

```java
@Configuration
public class UserManagementConfig {
    @Bean
    public UserDetailsService userDetailsService() {
        var userDetailservice = new InMemoryUserDetailsManager();

        var user = User.withUsername("test")
                .password("test1234")
                .authorities("read")
                .build();

        userDetailservice.createUser(user);
        return userDetailservice;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
       return NoOpPasswordEncoder.getInstance();
    }
}
```

`NoOpPasswordEncoder` 클래스를 사용했기 때문에 정상적으로 응답이 오는 것을 확인할 수 있다.

```bash
curl -i -u test:test1234 localhost:8080/
```

아랫처럼 설정했던 `PasswordEncoder` Bean을 등록하지 않도록 하면 어떻게 될까? default가 `BCryptPasswordEncoder`로 되기 때문에 plain text `test1234`로 저장한 `test` 유저의 인증이 실패하여 401 status를 응답 받게 된다.

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return NoOpPasswordEncoder.getInstance();
}
```

따라서 생성하는 user의 passowrd를 `BCryptPasswordEncoder` 객체로 encode해서 저장하도록 한다.

```java
@Bean
public UserDetailsService userDetailsService(BCryptPasswordEncoder bCryptPasswordEncoder) {
    var userDetailservice = new InMemoryUserDetailsManager();

    var user = User.withUsername("test")
            .password(bCryptPasswordEncoder.encode("test1234"))
            .authorities("read")
            .build();

    userDetailservice.createUser(user);
    return userDetailservice;
}

@Bean
public BCryptPasswordEncoder bCryptPasswordEncoder() {
    return new BCryptPasswordEncoder();
}
```

`AuthenticationManager`를 설정하고 싶으면 아랫처럼 작성할 수 있다. passwordEncoder를 Bean에 등록하고, authenticationManager에서 bCryptPasswordEncoder를 ecoder로 사용하게 하였는데, 어떻게 될까? authentiction filter -> authentication manager을 통해 manager에 설정된 bCryptPasswordEncoder가 사용되고, `curl -i -u test:test1234 localhost:8080/`은 401를 응답하게 된다.

```java
@Configuration
public class UserManagementConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        var userDetailservice = new InMemoryUserDetailsManager();

        var user = User.withUsername("test")
                .password("test1234")
                .authorities("read")
                .build();

        userDetailservice.createUser(user);
        return userDetailservice;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, BCryptPasswordEncoder bCryptPasswordEncoder, UserDetailsService userDetailsService) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(bCryptPasswordEncoder)
                .and()
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```