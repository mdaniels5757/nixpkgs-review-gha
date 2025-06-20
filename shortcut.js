// ==UserScript==
// @name        nixpkgs-review-gha
// @match       https://github.com/*
// ==/UserScript==

const repo = "Defelo/nixpkgs-review-gha";

const prTrackers = [
  { name: "nixpk.gs", toUrl: pr => `https://nixpk.gs/pr-tracker.html?pr=${pr}` },
  { name: "ocfox.me", toUrl: pr => `https://nixpkgs-tracker.ocfox.me/?pr=${pr}` },
];

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));
const query = async (doc, sel) => {
  await sleep(0);
  while (true) {
    const elem = doc.querySelector(sel);
    if (elem !== null) return elem;
    await sleep(100);
  }
};

const setupActionsPage = async () => {
  const match = /^https:\/\/github.com\/([^/]+\/[^/]+)\/actions\/workflows\/review.yml#(\d+)$/.exec(location.href);
  if (match === null || match[1] !== repo) return;
  
  const pr = match[2];
  history.replaceState(null, '', location.href.replace(/#\d+$/, ""));

  (await query(document, "details > summary.btn")).click();
  (await query(document, "input.form-control[name='inputs[pr]']")).value = pr;
};

const setupPrPage = async () => {
  const match = /^https:\/\/github.com\/NixOS\/nixpkgs\/pull\/(\d+)/i.exec(location.href);
  if (match === null) return;
  
  const pr = match[1];
  const actions = await query(document, ".gh-header-show .gh-header-actions");

  if (actions.querySelector(".run-nixpkgs-review") === null) {
    const btn = document.createElement("button");
    btn.classList.add("Button", "Button--secondary", "Button--small", "run-nixpkgs-review");
    btn.innerText = "Run nixpkgs-review";
    actions.prepend(btn);
    btn.onclick = () => {
      window.open(`https://github.com/${repo}/actions/workflows/review.yml#${pr}`);
    };
  }

  if (actions.querySelector(".goto-pr-tracker") === null) {
    for (const { name, toUrl } of prTrackers) {
      const btn = document.createElement("button");
      btn.classList.add("Button", "Button--secondary", "Button--small", "goto-pr-tracker");
      btn.innerText = prTrackers.length === 1 ? "PR Tracker" : `PR Tracker (${name})`;
      actions.prepend(btn);
      btn.onclick = () => {
        window.open(toUrl(pr));
      };
    }
  }
}

new MutationObserver(setupPrPage).observe(document, { subtree: true, childList: true });

setupActionsPage();
setupPrPage();
