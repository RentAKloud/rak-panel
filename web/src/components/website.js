const { domain } = history.state.params;
for (let [_, ele] of document.querySelectorAll(".domain-name").entries()) {
  ele.innerHTML = domain;
}

async function init() {
  const root = document.querySelector("#web-root");
  root.innerHTML = `<div class="h-full content-center text-center">
    <span class="loading loading-infinity w-[8rem] text-primary"></span>
  </div>`;

  const resp = await fetch(`/data/websites/${domain}.json`);
  const data = await resp.json();
  let template = document.querySelector("template").innerHTML;

  Object.keys(data).forEach((key) => {
    template = template.replaceAll(`{${key}}`, data[key]);
  });

  root.innerHTML = template;
}

init();
