// Modular ES module: HtmlFragmentLoader
export class HtmlFragmentLoader extends HTMLElement {
  constructor(...fragments) {
    super();
    this.attachShadow({ mode: "open" });
    this.fragments = fragments.length ? fragments : [];
  }

  async connectedCallback() {
    // If no fragments passed, check attribute
    let files = this.fragments;
    if (!files.length && this.hasAttribute("fragments")) {
      files = this.getAttribute("fragments")
        .split(",")
        .map((f) => f.trim());
    }
    for (const file of files) {
      const response = await fetch(file);
      const html = await response.text();
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      this.shadowRoot.appendChild(wrapper);
    }
  }
}

customElements.define("html-fragment-loader", HtmlFragmentLoader);
