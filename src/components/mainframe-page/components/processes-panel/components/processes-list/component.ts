import { t } from 'i18next';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { ProgramName } from '@state/progam-factory/types';
import { ProcessesListController } from './controller';
import { ProgramAlert } from '@shared/types';
import { ConfirmationAlertOpenEvent, ConfirmationAlertSubmitEvent } from '@components/shared/confirmation-alert/events';

@customElement('ca-processes-list')
export class ProcessesList extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      align-self: stretch;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
    }

    th {
      font-weight: var(--sl-font-weight-bold);
    }

    th.program,
    td.program {
      width: 32%;
    }

    th.cores,
    td.cores {
      width: 17%;
    }

    thead th {
      font-weight: var(--ca-table-header-font-weight);
      border-top: var(--ca-border);
      border-bottom: var(--ca-border);
      text-align: left;
      padding: var(--sl-spacing-small);
    }

    tr.notification td {
      padding: var(--sl-spacing-3x-large);
      text-align: center;
      border-bottom: var(--ca-border);
    }

    tbody ca-processes-list-item:nth-child(2n + 1) {
      background-color: var(--ca-table-row-odd-color);
    }

    div.buttons-container {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-direction: row;
      gap: var(--sl-spacing-small);
      font-size: var(--sl-font-size-large);
    }
  `;

  private _processesListController: ProcessesListController;

  constructor() {
    super();

    this._processesListController = new ProcessesListController(this);
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener(ConfirmationAlertSubmitEvent.type, this.handleConfirmAllDeleteProcessesDialog);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener(ConfirmationAlertSubmitEvent.type, this.handleConfirmAllDeleteProcessesDialog);
  }

  render() {
    const processesActive = this.checkSomeProcessesActive();

    return html`
      <table>
        <thead>
          <th class="program">
            <intl-message label="ui:mainframe:program">Program</intl-message>
          </th>
          <th class="cores">
            <intl-message label="ui:mainframe:cores">Cores</intl-message>
          </th>
          <th class="progress">
            <div class="buttons-container">
              <sl-tooltip>
                <intl-message slot="content" label="ui:mainframe:processes:allProcessesToggle">
                  Toggle all processes
                </intl-message>

                <sl-icon-button
                  name=${processesActive ? 'pause-fill' : 'play-fill'}
                  label=${t('mainframe.processes.allProcessesToggle', { ns: 'ui' })}
                  @click=${this.handleToggleAllProcesses}
                >
                </sl-icon-button>
              </sl-tooltip>

              <sl-tooltip>
                <intl-message slot="content" label="ui:mainframe:processes:allProcessesDelete">
                  Delete all processes
                </intl-message>

                <sl-icon-button
                  id="delete-btn"
                  name="x-lg"
                  label=${t('mainframe.processes.allProcessesDelete', { ns: 'ui' })}
                  @click=${this.handleOpenDeleteAllProcessesDialog}
                >
                </sl-icon-button>
              </sl-tooltip>
            </div>
          </th>
        </thead>

        <tbody>
          ${this.renderContent()}
        </tbody>
      </table>
    `;
  }

  private renderContent = () => {
    const processes = this._processesListController.listProcesses();

    if (processes.length === 0) {
      return this.renderEmptyListNotification();
    }

    return repeat(processes, (programName) => programName, this.renderListItem);
  };

  private renderEmptyListNotification = () => {
    return html`
      <tr class="notification">
        <td colspan="4">
          <intl-message label="ui:mainframe:processes:emptyListNotification">
            You don't have any processes
          </intl-message>
        </td>
      </tr>
    `;
  };

  private renderListItem = (programName: ProgramName) => {
    return html` <ca-processes-list-item draggable="true" program-name=${programName}> </ca-processes-list-item> `;
  };

  private checkSomeProcessesActive(): boolean {
    const programNames = this._processesListController.listProcesses();

    return programNames.some(
      (programName) => this._processesListController.getProcessByProgramName(programName)!.isActive,
    );
  }

  private handleToggleAllProcesses = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    const processesActive = this.checkSomeProcessesActive();

    this._processesListController.toggleAllProcesses(!processesActive);
  };

  private handleOpenDeleteAllProcessesDialog = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    this.dispatchEvent(new ConfirmationAlertOpenEvent(ProgramAlert.deleteAllProcesses, ''));
  };

  private handleConfirmAllDeleteProcessesDialog = (event: Event) => {
    const convertedEvent = event as ConfirmationAlertSubmitEvent;

    if (convertedEvent.gameAlert !== ProgramAlert.deleteAllProcesses) {
      return;
    }

    this._processesListController.deleteAllProcesses();
  };
}
