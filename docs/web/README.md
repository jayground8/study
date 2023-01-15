# List <!-- omit in toc -->
- [Web push with Firebase Messaging](#web-push-with-firebase-messaging)

# Web push with Firebase Messaging

[예제](https://github.com/jayground8/study-example/tree/main/example-web-push)

Firebase Messaging으로 Push notification을 보내본다. Firebase에서 project를 생성하고 아래처럼 정보를 넣어준다. `Notification`으로 알림을 받을 것인지 확인을 하고, `Registration token`을 받아 오게 된다. 그리고 `onMessage`로 notification 정보를 받게 된다.

```html
<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js";

    const firebaseConfig = {
      apiKey: "<%= apiKey %>",
      authDomain: "<%= authDomain %>",
      projectId: "<%= projectId %>",
      storageBucket: "<%= storageBucket %>",
      messagingSenderId: "<%= messagingSenderId %>",
      appId: "<%= appId %>",
      measurementId: "<%= measurementId %>"
    };
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    Notification.requestPermission()
        .then((permission) => {
            console.log(permission)
            if (permission === 'granted') {
                console.log("Notification permission granted!")
                return getToken(messaging, { 
                    vapidKey: "<%= vapidKey %>" 
                })
            }
        })
        .then((token) => {
            console.log('token', token)
        })
        .catch((err) => {
            console.error(err)
        })

    onMessage(messaging, (payload) => {
        console.log('Message received. ', payload)
    })
</script>
```

그리고 `firebase-messaging-sw.js`를 추가해야되는데, 여기에 백그라운드일 때 알림을 보여줄 수 있도록 설정한다. [Firebase 문서](https://firebase.google.com/docs/cloud-messaging/js/receive#handle_messages_when_your_web_app_is_in_the_foreground)에서는 아래처럼 service worker에서 global하게 불러올 파일을 정의하고 있다.

```js
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging.js');
```

하지만 `fail to load`가 발생하였고, [Stackoverflow 답변](https://stackoverflow.com/a/73727007)에서 버전 8 이상에서는 아래처럼 `compat`이 부터 있는 라이브러리를 가져와야 한다.

```js
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');
importScripts('firebaseConfig.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
});
```

이제 test로 메세지를 보내본다. Firebase console에서 아래처럼 새로운 캠패인을 만들고 테스트로 알림을 보내본다. 이미지 링크도 넣어서 preview에서 나오는 것처럼 이미지도 같이 보일 줄 알았지만, 보이지가 않았다.

![send test notification in Firebase console](/images/web/01-firebase-messaging-campagin-send-test.png)

그래서 아래처럼 Firebase console에서 service account를 발급하고, Firebase Admin SDK를 통해서 push 알림을 보냈다. icon에 보일 image link를 정의해줬고, fcm_options의 link값도 설정하여 알림을 눌렀을 때 해당 링크로 갈 수 있도록 하였다. 보낼 수 있는 property는 [mdn web docs](https://developer.mozilla.org/en-US/docs/Web/API/Notification)를 참고한다.

![create a service account in Firebase console](/images/web/02-firebase-service-account.png)

```js
require('dotenv').config();
const admin = require("firebase-admin");
const { getMessaging } = require('firebase-admin/messaging')

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const registrationToken = process.env.REGISTRATION_TOKEN;

const message = {
  notification: {
    title: "FCM Message",
    body: "This is an FCM Message",
  },
  webpush: {
    notification: {
      body: 'which?',
      icon: "https://www.logoarena.com/contestimages/public_new/9345/12536_1544527702_50501.png"
    },
    fcm_options: {
      link: `http://localhost:${process.env.PORT}/`
    }
  },
  data: {
    custom: "hello"
  },
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
getMessaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
```

그런데 백그라운드에서 알림이 뜨지 않았다. Mac의 알림 설정에서 Chrome에 대해서 아래처럼 알림을 허용해줘야 한다.

![enable notification on Mac](/images/web/03-mac-notification-setting.png)

이제 정상적으로 크롬에서 알림이 image까지 같이 뜨는 것을 확인할 수 있다.

![push notification](/images/web/04-push-notification-on-mac.png)

Safari에서도 [MacOs 13에서 Safari 16에서 Push API와 Notification API를 지원](https://developer.apple.com/documentation/usernotifications/sending_web_push_notifications_in_safari_and_other_browsers)한다고 나와있지만, FCM으로 push notification을 보내지 못하는 것 같다. [아직 open 상태인 관련된 github issue](https://github.com/firebase/firebase-js-sdk/issues/6620)