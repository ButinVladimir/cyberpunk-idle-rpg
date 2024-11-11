import { t } from 'i18next';
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { GameSpeed } from '@state/global-state/types';
import { ConfirmationAlertOpenEvent, ConfirmationAlertSubmitEvent } from '@components/shared/confirmation-alert/events';
import { GameStateAlert } from '@shared/types';
import { GameSpeedButtonsController } from './controller';
import { GameSpeedButtonProps } from './interfaces';

@customElement('ca-game-speed-buttons')
export class GameSpeedButtons extends LitElement {
  static styles = css`
    :host {
      display: flex;
      box-sizing: border-box;
      align-items: center;
    }
  `;

  private _gameSpeedButtonsController: GameSpeedButtonsController;

  constructor() {
    super();

    this._gameSpeedButtonsController = new GameSpeedButtonsController(this);
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener(ConfirmationAlertSubmitEvent.type, this.handleConfirmFastForwardDialog);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener(ConfirmationAlertSubmitEvent.type, this.handleConfirmFastForwardDialog);
  }

  render() {
    const gameSpeed = this._gameSpeedButtonsController.gameSpeed;

    return html`
      ${this.renderButton({
        gameSpeed: GameSpeed.paused,
        label: 'pause',
        icon: gameSpeed === GameSpeed.paused ? 'pause-fill' : 'pause',
      })}
      ${this.renderButton({
        gameSpeed: GameSpeed.normal,
        label: 'playNormal',
        icon: gameSpeed === GameSpeed.normal ? 'play-fill' : 'play',
      })}
      ${this.renderButton({
        gameSpeed: GameSpeed.fast,
        label: 'playFast',
        icon: gameSpeed === GameSpeed.fast ? 'fast-forward-fill' : 'fast-forward',
      })}
      <sl-tooltip>
        <intl-message slot="content" label="ui:topBar:gameSpeedButtons:fastForward"> Game speed button </intl-message>

        <sl-icon-button
          name="skip-end"
          label=${t(`topBar.gameSpeedButtons.fastForward`, { ns: 'ui' })}
          @click=${this.handleOpenFastForwardDialog}
        >
        </sl-icon-button>
      </sl-tooltip>
    `;
  }

  renderButton = (props: GameSpeedButtonProps): TemplateResult => {
    const { label, gameSpeed, icon } = props;

    return html`
      <sl-tooltip>
        <intl-message slot="content" label="ui:topBar:gameSpeedButtons:${label}"> Game speed button </intl-message>

        <sl-icon-button
          name=${icon}
          label=${t(`topBar.gameSpeedButtons.${label}`, { ns: 'ui' })}
          @click=${this.handleChangeGameSpeed(gameSpeed)}
        >
        </sl-icon-button>
      </sl-tooltip>
    `;
  };

  private handleChangeGameSpeed = (gameSpeed: GameSpeed) => (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    this._gameSpeedButtonsController.changeGameSpeed(gameSpeed);
  };

  private handleOpenFastForwardDialog = (event: Event) => {
    event.stopPropagation();

    this.dispatchEvent(new ConfirmationAlertOpenEvent(GameStateAlert.fastForward, ''));
  };

  private handleConfirmFastForwardDialog = (event: Event) => {
    const convertedEvent = event as ConfirmationAlertSubmitEvent;

    if (convertedEvent.gameAlert !== GameStateAlert.fastForward) {
      return;
    }

    this._gameSpeedButtonsController.fastForward();
  };
}
