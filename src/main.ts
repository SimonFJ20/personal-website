import { route } from "./router";

const main = () => {
    const appDiv = document.querySelector<HTMLDivElement>("div#app");
    if (!appDiv) throw new Error("div#app not found");
    appDiv.innerHTML = route(window.location.pathname);
};

main();
