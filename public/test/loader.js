class HtmlFragmentLoader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const files = ['fragment-a.html', 'fragment-b.html', 'fragment-c.html'];
    for (const file of files) {
      const response = await fetch(file);
      const html = await response.text();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      this.shadowRoot.appendChild(wrapper);
    }
  }
}

customElements.define('html-fragment-loader', HtmlFragmentLoader);
