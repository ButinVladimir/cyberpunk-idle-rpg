import { t } from 'i18next';
import { LitElement, css, html } from 'lit';
import { customElement, query, property, state } from 'lit/decorators.js';
import SlRange from '@shoelace-style/shoelace/dist/components/range/range.component.js';
import { MapCellZoomPanelController } from './controller';
import { MapCellZoomChangeEvent } from './events';
import { classMap } from 'lit/directives/class-map.js';

@customElement('ca-map-cell-zoom-panel')
export class MapCellZoomPanel extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      background-color: var(--sl-panel-background-color);
      border: var(--ca-border);
      border-radius: var(--sl-border-radius-small);
    }

    sl-icon-button {
      font-size: var(--sl-font-size-large);
    }

    div.range-container {
      flex: 1 1 auto;
      width: 0;
      box-sizing: border-box;
      display: none;
    }

    div.range-container.show-range {
      width: 20em;
      display: block;
      padding: var(--sl-spacing-2x-small) var(--sl-spacing-medium);
    }

    div.zoom-button-container {
      flex: 0 0 auto;
      padding: var(--sl-spacing-3x-small);
      position: relative;
    }

    sl-range {
      width: 100%;
    }
  `;

  private _mapCellZoomPanelController: MapCellZoomPanelController;

  @property({
    attribute: true,
    type: Number,
  })
  zoom!: number;

  @state()
  private _showRange = false;

  @query('sl-range')
  private _rangeElement!: SlRange;

  constructor() {
    super();

    this._mapCellZoomPanelController = new MapCellZoomPanelController(this);
  }

  render() {
    const rangeContainerClasses = classMap({
      'range-container': true,
      'show-range': this._showRange,
    });

    return html`
      <div class=${rangeContainerClasses}>
        <sl-range min="1" max="5" step="1" tooltip="bottom" value=${this.zoom} @sl-change=${this.handleChangeZoom}>
        </sl-range>
      </div>

      <div class="zoom-button-container">
        <sl-icon-button
          name="zoom-in"
          label=${t('city.cityOverview.toggleZoomPanel', { ns: 'ui' })}
          @click=${this.handleToggleZoomPanel}
        >
        </sl-icon-button>
      </div>
    `;
  }

  updated() {
    this._rangeElement.tooltipFormatter = this.decimalNumberFormatter;
  }

  private handleToggleZoomPanel = (event: Event) => {
    event.stopPropagation();

    this._showRange = !this._showRange;
  };

  private handleChangeZoom = (event: Event) => {
    event.stopPropagation();

    this.dispatchEvent(new MapCellZoomChangeEvent(this._rangeElement.value));
  };

  private decimalNumberFormatter = (value: number): string => {
    return this._mapCellZoomPanelController.formatter.formatNumberDecimal(value);
  };
}
