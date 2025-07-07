import type { ThemeUserConfig } from "valaxy-theme-sakura";
import { defineValaxyConfig } from "valaxy";
import { addonMeting } from "valaxy-addon-meting";
import { addonWaline } from "valaxy-addon-waline";

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
      motto: "You got to put the past behind you before you can move on.",
      // 首页轮播图片
      urls: [
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-858k3j.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-3l2vm3.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-3z9dz9.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-zyxq6j.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/home-wallpaper.jpg",
        "https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-yxoejx.jpg",
      ],
      randomUrls: true,
      // 首页视频
      playerUrl: "output.mp4",
      style: "filter-grid",
      fixedImg: true,
      typewriter: true,
      enableHitokoto: true,
      waveTheme: "yunCloud",
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
      // {
      //   icon: "i-fa-archive",
      //   locale: "menu.archives",
      //   link: "/archives",
      // },
      {
        icon: "i-fa-edit",
        text: "留言",
        link: "/comment",
      },
      {
        icon: "111",
        text: "标签",
        link: "/tags",
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
  ],

  vite: {
    optimizeDeps: {
      include: ["d3", "lodash-es"],
    },
  },
});
