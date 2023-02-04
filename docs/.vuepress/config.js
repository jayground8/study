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
              text: 'spring',
              link: '/java/spring.html'
            },
            {
              text: 'spring-security',
              link: '/java/spring-security.html'
            },
            {
              text: 'junit',
              link: '/java/junit.html'
            }
          ]
        },
        {
          text: 'Nodejs',
          link: '/nodejs/'
        },
        {
          text: 'Web',
          link: '/web/'
        },
        {
          text: 'Extra',
          link: '/extra/'
        }
    ]
  }),
})

