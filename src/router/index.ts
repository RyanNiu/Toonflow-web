import { createRouter, createWebHashHistory } from "vue-router";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/:catchAll(.*)",
      name: "404",
      meta: {
        title: "404",
      },
      component: () => import("@/pages/error/404.vue"),
    },
    {
      path: "/",
      redirect: "/workbench",
    },
    {
      path: "/workbench",
      component: () => import("@/pages/workbench/index.vue"),
      redirect: "/project",
      children: [
        {
          path: "/project",
          component: () => import("@/views/project/index.vue"),
        },
        {
          path: "/projectDetail",
          component: () => import("@/views/projectDetail/index.vue"),
        },
        {
          path: "/setting",
          component: () => import("@/views/setting/index.vue"),
        },
        {
          path: "/taskList",
          component: () => import("@/views/taskList/index.vue"),
        },
        {
          path: "/accountManage",
          meta: { requiresAdmin: true },
          component: () => import("@/views/accountManage/index.vue"),
        },
        {
          path: "/project/:projectId/script/:scriptId/storyboard",
          name: "StoryboardStandalone",
          meta: { title: "生成分镜图" },
          component: () => import("@/views/storyboard/index.vue"),
        },
      ],
    },
    {
      path: "/login",
      component: () => import("@/pages/login/index.vue"),
    },
  ],
});
router.beforeEach((to, from, next) => {
  if (to.path === "/login") {
    next();
  } else {
    if (localStorage.getItem("token")) {
      if (to.meta?.requiresAdmin) {
        const isAdmin = localStorage.getItem("is_admin") === "1";
        if (!isAdmin) return next("/project");
      }
      next();
    } else {
      next("/login");
    }
  }
});
export default router;
