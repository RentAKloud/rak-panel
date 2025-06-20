export function router(routes, root) {
  document.addEventListener("click", (e) => {
    if (e.target.nodeName === "A") {
      e.preventDefault();
      history.pushState({}, "", e.target.attributes["href"].value);
      // location.pathname = e.target.attributes["href"].value; // causes page reload

      renderRoute(routes, root);
    }
  });

  // executes for both back and forward
  window.addEventListener("popstate", function (e) {
    renderRoute(routes, root);
  });

  renderRoute(routes, root);
}

async function renderRoute(routes, root) {
  root = document.querySelector(root);
  const path = location.pathname;

  const route = routes.find((r) => {
    const regx = new RegExp(r.path.replaceAll(/:.*\/?/g, "(.*)"));
    const matches = path.match(regx);
    console.log(r.path, matches);
    if (matches && matches[0] === path) {
      return true;
    }
    return false;
  });

  if (route) {
    if (route.component) {
      const html = await jsonToHtml(await route.component());
      root.innerHTML = html;
    } else {
      root.innerHTML = route.html;
    }
  } else {
    const html = await jsonToHtml(
      await routes.find((r) => r.path === "404").component(),
    );
    root.innerHTML = html;
  }

  const currLink = document.querySelector(`a[href='${location.pathname}']`);
  if (currLink) {
    currLink.classList.add("link-primary");
  }
}

async function jsonToHtml(json) {
  let result = "";

  for (const node of json) {
    if (node.component) {
      result += node.component;

      if (node.slots) {
        for (const slot of node.slots) {
          if (!result.includes(`{${slot.key}}`)) {
            continue;
          }

          result = result.replace(`{${slot.key}}`, slot.component);
        }
      }

      if (node.children) {
        result = result.replace("{children}", await jsonToHtml(node.children));
      }
    } else if (node.ele) {
      const childrenHtml = node.children ? await jsonToHtml(node.children) : "";
      result += `<${node.ele} ${Object.keys(node.attrs || [])
        .map((key) => `${key}="${node.attrs[key]}"`)
        .join(" ")}>${node.content || childrenHtml}</${node.ele}>`;
    } else if (node.loop) {
      const data = node.data || (await fetch(node.fetch));
      const content = data.map((d) => {
        const keys = Object.keys(d);
        const initialValue = node.component || node.content;
        return keys.reduce(
          (sum, key) => sum.replaceAll(`{${key}}`, d[key]),
          initialValue,
        );
      });

      result += content.join("");
    }
  }

  return result;
}
