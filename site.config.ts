import { defineSiteConfig } from "valaxy";

export default defineSiteConfig({
  mode: "light",
  url: "https://blog.yeastar.xin",
  favicon: "/avatar.ico",
  lang: "zh-CN",
  languages: ["zh-CN"],
  timezone: "ASia/Shanghai",
  title: "YukiLog",
  subtitle: "欢迎来到我的世界, 这里没有神, 只有我构筑的代码、记忆和光",
  author: {
    avatar:
      "avatar-modified.png",
    name: "Lian",
    /** 还支持email, link, intro */
    status: {
      emoji: "📚",
      message: "每天忙的像陀螺",
    },
  },
  description: "别看啦，小恋一直一直喜欢你哦.",
  lastUpdated: true,
  social: [
    {
      name: "QQ 群 970312342",
      link: "https://qm.qq.com/cgi-bin/qm/qr?k=XQ2qzBppK5DKgppRfbOnfCHJRqnbYZf0&jump_from=webapi&authKey=iY8fr0pfAwgkHNGPdEaJ0ZsN/5dAeXENazeRxwuE/rBveYq4MtbwoyGpWGMql+fF",
      icon: "i-ri-qq-line",
      color: "#12B7F5",
    },
    {
      name: "GitHub",
      link: "https://github.com/Yueosa",
      icon: "i-ri-github-line",
      color: "#6e5494",
    },
    {
      name: "网易云音乐",
      link: "https://music.163.com/#/user/home?id=630887153",
      icon: "i-ri-netease-cloud-music-line",
      color: "#C20C0C",
    },
    {
      name: "哔哩哔哩",
      link: "https://space.bilibili.com/433677987",
      icon: "i-ri-bilibili-line",
      color: "#FF8EB3",
    },
    {
      name: "Twitter",
      link: "https://twitter.com/Yosa04942475621",
      icon: "i-ri-twitter-x-fill",
      color: "black",
    },
    {
      name: "E-Mail",
      link: "mailto:yichengxin7@gmail.com",
      icon: "i-ri-mail-line",
      color: "#8E71C1",
    },
  ],

  search: {
    enable: true,
    type: "fuse",
  },

  statistics: {
  enable: true,
  readTime: {
    speed: {
      cn: 300, // 默认 300
      en: 100, // 默认 100
    },
  },
  },

  encrypt: {
  enable: true, // 默认 AES-CBC
  },


  sponsor: {
    enable: true,
    title: "我很可爱，请给我钱！",
    methods: [
      {
        name: "支付宝",
        url: "/alipay.jpg",
        color: "#00A3EE",
        icon: "i-ri-alipay-line",
      },
      {
        name: "QQ 支付",
        url: "/qqpay.jpg",
        color: "#12B7F5",
        icon: "i-ri-qq-line",
      },
      {
        name: "微信支付",
        url: "/weixinpay.jpg",
        color: "#2DC100",
        icon: "i-ri-wechat-pay-line",
      },
    ],
  },
});
