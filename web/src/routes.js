export default [
  {
    path: "/",
    component: () => fetch("/pages/home.json").then((res) => res.json()),
  },
  {
    path: "/websites",
    component: () => fetch("/pages/websites.json").then((res) => res.json()),
  },
  {
    path: "/websites/new",
    component: () => fetch("/pages/website-new.json").then((res) => res.json()),
  },
  {
    path: "/websites/:domain",
    component: () => fetch("/pages/website.json").then((res) => res.json()),
  },
  {
    path: "/domains",
    component: () => fetch("/pages/domains.json").then((res) => res.json()),
  },
  { path: "/about", html: '<h1>Page 2 <a href="/">back</a></h1>' },
  {
    path: "404",
    component: () => fetch("/pages/404.json").then((res) => res.json()),
  },
];
