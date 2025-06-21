export function router(routes, root) {
  document.addEventListener("click", (e) => {
    if (e.target.nodeName === "A") {
      e.preventDefault();

      const url = e.target.attributes["href"]?.value;
      if (url) {
        const [route, params] = findRoute(routes, url);
        history.pushState({ params }, "", url);
        // location.pathname = e.target.attributes["href"].value; // causes page reload

        renderRoute(route, root);
      }
    }
  });

  // executes for both back and forward
  window.addEventListener("popstate", function (e) {
    const [route] = findRoute(routes);
    renderRoute(route, root);
  });

  const [route] = findRoute(routes);
  renderRoute(route, root);
}

function findRoute(routes, target = location.pathname) {
  let params = {};

  const route = routes.find((r) => {
    const regx = new RegExp(r.path.replaceAll(/:.*\/?/g, "(.*)"));
    const matches = target.match(regx);

    if (matches && matches[0] === target) {
      r.path
        .match(/:([a-z0-9]*)/gi)
        ?.map((p) => p.replace(":", ""))
        .forEach((param, i) => {
          params[param] = matches[i + 1];
        });
      return true;
    }
    return false;
  });

  return [route, params];
}

async function renderRoute(route, root) {
  root = document.querySelector(root);

  if (route) {
    if (route.component) {
      const { html, scripts } = await jsonToHtml(await route.component());
      root.innerHTML = html;

      if (scripts) {
        eval(scripts);
      }
    } else {
      root.innerHTML = route.html;
    }
  } else {
    const { html } = await jsonToHtml(
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
  let _scripts = "";

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
        const { html, scripts } = await jsonToHtml(node.children);
        _scripts += scripts;
        result = result.replace("{children}", html);
      }
    } else if (node.ele) {
      const childrenHtml = node.children
        ? (await jsonToHtml(node.children)).html
        : "";
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

    if (node.script) {
      _scripts += node.script;
    }
  }

  return { html: result, scripts: _scripts };
}
