import { Component } from "../../core/Component.js";
import { text, contextLabel } from "../shared.js";
export class CountdownComponent extends Component {
  render() {
    const s = this.gameState;
    this.container.innerHTML = `<section id="countdown-screen" class="countdown-wrap panel"><h1>${text(s, "countdown")}</h1><p class="countdown-context">${contextLabel(s)}</p><div id="countdown-display" class="countdown-number" role="status">3</div><p>${text(s, "countdownHint")}</p><button data-action="cancel">${text(s, "cancel")}</button></section>`;
  }
}
