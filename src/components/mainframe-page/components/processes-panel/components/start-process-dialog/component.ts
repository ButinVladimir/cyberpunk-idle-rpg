import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import { BaseComponent } from '@shared/base-component';
import { ProgramName } from '@state/progam-factory/types';
import { IProgram } from '@state/progam-factory/interfaces/program';
import {
  ConfirmationAlertOpenEvent,
  ConfirmationAlertCloseEvent,
  ConfirmationAlertSubmitEvent,
} from '@/components/shared/confirmation-alert/events';
import { ProgramAlert } from '@shared/types';
import { StartProcessDialogCloseEvent } from './events';
import { StartProcessDialogController } from './controller';
import { DescriptionRenderer } from './description-renderer';
import { IDescriptionRenderer } from './interfaces';

@customElement('ca-start-process-dialog')
export class StartProcessDialog extends BaseComponent<StartProcessDialogController> {
  static styles = css`
    sl-dialog {
      --width: 40rem;
    }

    sl-dialog::part(body) {
      padding-top: 0;
      padding-bottom: 0;
    }

    sl-dialog::part(footer) {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      gap: var(--sl-spacing-small);
    }

    h4.title {
      font-size: var(--sl-font-size-large);
      font-weight: var(--sl-font-weight-bold);
      margin: 0;
    }

    div.body {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    div.inputs-container {
      display: grid;
      column-gap: var(--sl-spacing-medium);
      grid-template-columns: 2fr 1fr;
    }

    p.hint {
      margin-top: 0;
      margin-bottom: var(--sl-spacing-medium);
      color: var(--ca-hint-color);
      font-size: var(--ca-hint-font-size);
    }

    span.input-label {
      font-size: var(--sl-font-size-medium);
      line-height: var(--sl-line-height-dense);
    }

    div.footer {
      display: flex;
    }

    div.program-description {
      margin-top: var(--sl-spacing-medium);
      margin-bottom: 0;
    }

    div.program-description p {
      margin: 0;
    }

    div.program-description p.line-break {
      height: var(--sl-spacing-medium);
    }
  `;

  protected controller: StartProcessDialogController;

  private _programInputRef = createRef<SlSelect>();

  private _threadsInputRef = createRef<SlInput>();

  @property({
    attribute: 'is-open',
    type: Boolean,
  })
  isOpen = false;

  @state()
  private _programName?: ProgramName = undefined;

  @state()
  private _threads = 1;

  @state()
  private _maxThreads = 1;

  @state()
  private _confirmationAlertVisible = false;

  constructor() {
    super();

    this.controller = new StartProcessDialogController(this);
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener(ConfirmationAlertCloseEvent.type, this.handleCloseConfirmationAlert);
    document.addEventListener(ConfirmationAlertSubmitEvent.type, this.handleConfirmConfirmationAlert);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener(ConfirmationAlertCloseEvent.type, this.handleCloseConfirmationAlert);
    document.removeEventListener(ConfirmationAlertSubmitEvent.type, this.handleConfirmConfirmationAlert);
  }

  updated(_changedProperties: Map<string, any>) {
    super.updated(_changedProperties);

    if (_changedProperties.get('isOpen') === false) {
      this._programName = undefined;
      this._threads = 1;
      this._confirmationAlertVisible = false;
    }
  }

  renderContent() {
    const program = this._programName ? this.controller.getProgram(this._programName) : undefined;

    const threadsInputDisabled = !(program && !program.isAutoscalable);
    const submitButtonDisabled = !(
      program &&
      (program.isAutoscalable || (this._threads >= 1 && this._threads <= this._maxThreads))
    );

    const currentProcess = this._programName ? this.controller.getProcessByName(this._programName) : undefined;

    const descriptionRenderer: IDescriptionRenderer | undefined = program
      ? new DescriptionRenderer({
          formatter: this.controller.formatter,
          ram: this.controller.ram,
          cores: this.controller.cores,
          program: program,
          threads: this._threads,
          currentThreads: currentProcess ? currentProcess.threads : 0,
        })
      : undefined;

    return html`
      <sl-dialog ?open=${this.isOpen && !this._confirmationAlertVisible} @sl-request-close=${this.handleClose}>
        <h4 slot="label" class="title">
          <intl-message label="ui:mainframe:processes:startProcess"> Start process </intl-message>
        </h4>

        <div class="body">
          <p class="hint">
            <intl-message label="ui:mainframe:processes:startProcessDialogHint"> Select program. </intl-message>
          </p>

          <div class="inputs-container">
            <sl-select
            ${ref(this._programInputRef)}
             name="program" value=${this._programName ?? ''} hoist @sl-change=${this.handleProgramChange}>
              <span class="input-label" slot="label">
                <intl-message label="ui:mainframe:program">Program</intl-message>
              </span>

              ${this.controller.listPrograms().map(this.formatProgramSelectItem)}
            </sl-select>

            <sl-input
            ${ref(this._threadsInputRef)}
              name="threads"
              value=${this._threads}
              type="number"
              min="1"
              max=${Math.max(this._maxThreads, 1)}
              step="1"
              ?disabled=${threadsInputDisabled}
              @sl-change=${this.handleThreadsChange}
            >
              <span class="input-label" slot="label">
                <intl-message label="ui:mainframe:threads">Threads</intl-message>
              </span>
            </sl-input>
            </sl-select>
          </div>

          ${descriptionRenderer ? descriptionRenderer.renderDescription() : null}
        </div>

        <sl-button slot="footer" size="medium" variant="default" outline @click=${this.handleClose}>
          <intl-message label="ui:common:close"> Close </intl-message>
        </sl-button>

        <sl-button ?disabled=${submitButtonDisabled} slot="footer" size="medium" variant="primary" @click=${this.handleOpenConfirmationAlert}>
          <intl-message label="ui:mainframe:processes:startProcess"> Start process </intl-message>
        </sl-button>
      </sl-dialog>
    `;
  }

  private handleClose = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    this.dispatchEvent(new StartProcessDialogCloseEvent());
  };

  private handleProgramChange = () => {
    if (!this._programInputRef.value) {
      return;
    }

    this._programName = this._programInputRef.value.value as ProgramName;

    const program = this.controller.getProgram(this._programName);
    const availableRam = this.controller.getAvailableRamForProgram(this._programName);

    this._maxThreads = 1;

    if (program && !program.isAutoscalable) {
      this._maxThreads = Math.max(Math.floor(availableRam / program.ram), 0);
    }
  };

  private handleThreadsChange = () => {
    if (!this._threadsInputRef.value) {
      return;
    }

    let threads = this._threadsInputRef.value.valueAsNumber;

    if (threads > this._maxThreads) {
      threads = this._maxThreads;
    }

    if (threads < 1) {
      threads = 1;
    }

    this._threads = threads;
    this._threadsInputRef.value.valueAsNumber = threads;
  };

  private handleOpenConfirmationAlert = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!this._programName) {
      return;
    }

    const program = this.controller.getProgram(this._programName);
    const runningScalableProgram = this.controller.getRunningScalableProgram();

    const existingProcess = this.controller.getProcessByName(this._programName);
    const formatter = this.controller.formatter;

    if (existingProcess) {
      const confirmationAlertParameters = JSON.stringify({
        programName: this._programName,
        threads: formatter.formatNumberDecimal(existingProcess.threads),
      });

      this._confirmationAlertVisible = true;

      this.dispatchEvent(new ConfirmationAlertOpenEvent(ProgramAlert.processReplace, confirmationAlertParameters));
    } else if (program?.isAutoscalable && runningScalableProgram) {
      const confirmationAlertParameters = JSON.stringify({
        programName: runningScalableProgram.program.name,
      });

      this._confirmationAlertVisible = true;

      this.dispatchEvent(
        new ConfirmationAlertOpenEvent(ProgramAlert.scalableProcessReplace, confirmationAlertParameters),
      );
    } else {
      this.startProcess();
    }
  };

  private handleConfirmConfirmationAlert = (event: Event) => {
    const convertedEvent = event as ConfirmationAlertSubmitEvent;

    if (
      convertedEvent.gameAlert !== ProgramAlert.processReplace &&
      convertedEvent.gameAlert !== ProgramAlert.scalableProcessReplace
    ) {
      return;
    }

    this._confirmationAlertVisible = false;

    this.startProcess();
  };

  private startProcess = () => {
    if (this._programName) {
      const isStarted = this.controller.startProcess(this._programName, this._threads);

      if (isStarted) {
        this.dispatchEvent(new StartProcessDialogCloseEvent());
      }
    }
  };

  private handleCloseConfirmationAlert = (event: Event) => {
    const convertedEvent = event as ConfirmationAlertCloseEvent;

    if (
      convertedEvent.gameAlert !== ProgramAlert.processReplace &&
      convertedEvent.gameAlert !== ProgramAlert.scalableProcessReplace
    ) {
      return;
    }

    this._confirmationAlertVisible = false;
  };

  private formatProgramSelectItem = (program: IProgram) => {
    const formatter = this.controller.formatter;
    const value = JSON.stringify({
      programName: program.name,
      level: formatter.formatNumberDecimal(program.level),
      quality: formatter.formatQuality(program.quality),
    });

    return html`<sl-option value=${program.name}>
      <intl-message label="ui:mainframe:processes:programSelectItem" value=${value}> Program </intl-message>
    </sl-option>`;
  };
}
