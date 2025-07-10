import type { ThemeUserConfig } from "valaxy-theme-sakura";
import { defineValaxyConfig } from "valaxy";
import { addonMeting } from "valaxy-addon-meting";
import { addonWaline } from "valaxy-addon-waline";
import { addonBangumi } from "valaxy-addon-bangumi";
import pkg from "valaxy-theme-sakura/package.json";
import { addonLightGallery } from "valaxy-addon-lightgallery";

export default defineValaxyConfig<ThemeUserConfig>({
  theme: "sakura",
  devtools: true,

  themeConfig: {
    // 核心配置文件
    ui: {
      primary: "#fe9500",

      toggleDarkButton: {
        lightIcon: "i-line-md-moon-alt-to-sunny-outline-loop-transition",
        darkIcon: "i-line-md-sunny-outline-to-moon-loop-transition",
      },
      pinnedPost: {
        icon: "i-fa-anchor",
      },
      postList: {
        icon: "i-fa-envira",
      },
      scrollDown: {
        icon: "i-fa-chevron-down",
      },
    },
    scrollDown: {
      enable: false,
    },

    footer: {
      since: 2025,
    },

    hero: {
      title: "Welcome~",
      motto: "往者不可谏，来者犹可追",
      // 首页轮播图片
      urls: [
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-858k3j.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-3l2vm3.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-zyxq6j.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-yxoejx.jpg",
      ],
      randomUrls: true,
      // 首页视频
      playerUrl: "output.mp4",
      style: "filter-dim",
      fixedImg: true,
      typewriter: false,
      enableHitokoto: false,
      waveTheme: "yunCloud",
    },

    notice: {
      message:
        '<b>这是一个公告信息, 主题开源地址请见: <a href="https://github.com/WRXinYue/valaxy-theme-sakura">https://github.com/WRXinYue/valaxy-theme-sakura</a></br>',
    },

    pagination: {
      animation: true,
      infiniteScrollOptions: {
        preload: true,
      },
    },

    postList: {
      text: "Discovery",

      isImageReversed: true,
      defaultImage: [
        "https://img.xjh.me/random_img.php?random?type=bg&return=302",
        "https://www.dmoe.cc/random.php?random",
      ],
    },

    postFooter: {
      navigationMerge: true,
    },

    navbar: [
      {
        icon: "i-fa-fort-awesome",
        locale: "menu.home",
        link: "/",
      },
      {
        icon: "i-line-md-folder-twotone",
        locale: "menu.categories",
        link: "/categories",
      },
      {
        icon: "i-fa-archive",
        locale: "menu.archives",
        link: "/archives",
      },
      {
        icon: "i-fa6-solid:file-image",
        text: "相册",
        link: "",
        items: [
          {
            text: "现实",
            icon: "i-fa6-solid:camera-retro",
            link: "/lightgallery/reality",
          },
          {
            text: "女装",
            icon: "i-fa6-solid:heart",
            link: "/lightgallery/dress",
          },
        ],
      },
      {
        icon: "i-fa-film",
        text: "番剧",
        link: "/anime",
      },
      {
        icon: "i-fa-edit",
        text: "留言板",
        link: "/comment",
      },
      {
        text: "友情链接",
        icon: "i-fa-chain",
        link: "/links",
        items: [
          {
            text: "GitHub",
            icon: "i-line-md-github-twotone",
            link: "https://github.com/WRXinYue/valaxy-theme-sakura",
            target: "_blank",
          },
          {
            text: "Valaxy",
            icon: "i-ri-cloud-fill",
            link: "https://github.com/YunYouJun/valaxy",
            target: "_blank",
          },
        ],
      },
      {
        text: pkg.author.name,
        icon: "i-line-md-hazard-lights-filled",
        link: pkg.author.url,
        target: "_blank",
      },
      {
        text: "关于",
        icon: "i-fa-leaf",
        link: pkg.author.url,
        target: "_blank",
      },
      {
        icon: "i-fa6-solid:bookmark",
        text: "标签",
        link: "/tags",
      },
      {
        text: "RSS",
        icon: "i-fa-feed",
        link: "/atom.xml",
        target: "_blank",
      },
    ],
    navbarOptions: {
      title: ["BLog", "YukiKoi"],
      subTitle: "这里是 Sakura 小姐的博客",
      offset: 0,
      invert: ["home"],
      showMarker: false,
      autoHide: ["home"],
    },

    sidebar: [
      {
        text: "🌈",
        locale: "menu.home",
        link: "/",
      },
      {
        text: "🗂️",
        locale: "menu.archives",
        link: "/archives/",
      },
      {
        text: "📂",
        locale: "menu.categories",
        link: "/categories/",
      },
      {
        text: "🏷️",
        locale: "menu.tags",
        link: "/tags/",
      },
      {
        text: "🎯 清单",
        items: [
          {
            text: "相册 📷",
            link: "/lightgallery",
          },
          {
            text: "电影 🎞️",
            link: "/movie",
          },
          {
            text: "番剧 🍨",
            link: "/anime",
          },
          {
            text: "游戏 🎮",
            link: "/game",
          },
          {
            text: "歌单 🎵",
            link: "/music",
          },
        ],
      },
      {
        text: "📝 留言板",
        link: "/comment",
      },
      {
        text: "🍻 朋友圈",
        link: "/links",
      },
      {
        text: "❤️ 打赏",
        link: "/posts/reward",
      },
      {
        text: "📌",
        locale: "menu.about",
        link: "https://github.com/Yueosa",
      },
    ],

    sidebarOptions: {
      position: "left",
    },

    tags: {
      rainbow: true,
    },

    scrollToTop: false,
    scrollIndicator: true,
    scrollLock: false,
  },

  siteConfig: {
    comment: {
      enable: true,
    },
  },

  addons: [
    addonWaline({
      serverURL: "https://waline-vercel-five-ebon.vercel.app/",
      pageview: true,
      comment: true,
    }),
    addonMeting({
      global: true,
      props: {
        id: "13729316168",
        server: "netease",
        type: "playlist",
      },
      options: {
        autoHidden: true,
        animationIn: true,
        lyricHidden: true,
      },
    }),
    addonBangumi({
      api: "https://yi_xiao_jiu-bangumi.web.val.run",
      bilibiliUid: "433677987",
      bgmEnabled: false,
    }),
    addonLightGallery(),
  ],

  vite: {
    optimizeDeps: {
      include: ["d3", "lodash-es"],
    },
  },
});
