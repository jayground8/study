import { defineUserConfig } from 'vuepress'
import { defaultTheme } from 'vuepress'

export default defineUserConfig({
  base: 'study',
  lang: 'ko-KR',
  title: 'Spaced Repitition',
  description: 'just to remember what I learned',
  theme: defaultTheme({
    // collapsible sidebar
    sidebar: [
        {
          text: 'Java',
          link: '/java/',
          children: [
            {
              text: 'junit',
              link: '/java/junit.html'
            }
          ]
        },
        {
            text: 'Spring',
            link: '/spring/',
            children: [
              {
                text: 'spring-security',
                link: '/spring/spring-security.html'
              }
            ]
        },
    ]
  }),
})

