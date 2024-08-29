import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatter } from '@shared/formatter';
import { BuyHardwareUpgradeEvent } from './events';

@customElement('ca-mainframe-hardware-panel-article')
export class MainframeHardwarePanelArticle extends LitElement {
  static styles = css`
    :host {
      padding: var(--sl-spacing-large);
      box-sizing: border-box;
      border: var(--ca-border);
      border-radius: var(--sl-border-radius-small);
      display: flex;
      align-items: center;
      gap: var(--sl-spacing-small);
    }

    div.text-container {
      flex: 1 1 auto;
    }

    div.button-container {
      flex: 0 0 auto;
    }

    h4.title {
      font-size: var(--sl-font-size-large);
      font-weight: var(--sl-font-weight-bold);
      margin-top: 0;
      margin-bottom: var(--sl-spacing-medium);
      line-height: var(--sl-line-height-denser);
    }

    p.hint {
      margin: 0;
      color: var(--ca-hint-color);
      font-size: var(--ca-hint-font-size);
    }
  `;

  @property({
    attribute: 'label',
    type: String,
  })
  label!: string;

  @property({
    attribute: 'increase',
    type: Number,
  })
  increase!: number;

  @property({
    attribute: 'money',
    type: Number,
  })
  money!: number;

  @property({
    attribute: 'level',
    type: Number,
  })
  level!: number;

  @property({
    attribute: 'cost',
    type: Number,
  })
  cost!: number;

  render() {
    const buttonValue = JSON.stringify({
      cost: formatter.formatNumberLong(this.cost),
      increase: formatter.formatNumberDecimal(this.increase),
    });

    return html`
      <div class="text-container">
        <h4 class="title">
          <intl-message label="ui:mainframe:hardware:${this.label}" value=${formatter.formatNumberDecimal(this.level)}
            >Level</intl-message
          >
        </h4>
        <p class="hint">
          <intl-message label="ui:mainframe:hardware:${this.label}Hint"> Higher level leads to profit. </intl-message>
        </p>
      </div>
      <div class="button-container">
        <sl-button
          variant="primary"
          type="button"
          size="medium"
          ?disabled=${this.money < this.cost}
          @click=${this.handleBuy}
        >
          <intl-message label="ui:mainframe:hardware:buy" value=${buttonValue}> Buy </intl-message>
        </sl-button>
      </div>
    `;
  }

  handleBuy = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();

    this.dispatchEvent(new BuyHardwareUpgradeEvent());
  };
}