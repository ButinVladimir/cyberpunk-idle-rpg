import { BaseController } from '@shared/base-controller';
import { IProcess } from '@state/mainframe/mainframe-processes-state/interfaces/process';
import { MAINFRAME_PROCESSES_STATE_UI_EVENTS } from '@state/mainframe/mainframe-processes-state/constants';
import { ProgramName } from '@state/progam-factory/types';

export class ProcessesListItemProgressController extends BaseController {
  private _process?: IProcess;

  hostConnected() {
    this.addProcessListeners();
  }

  hostDisconnected() {
    this.removeProcessListeners();
  }

  getProcess(programName: ProgramName) {
    if (this._process?.program.name !== programName) {
      this.removeProcessListeners();

      this._process = this.mainframeProcessesState.getProcessByName(programName);

      this.addProcessListeners();
    }

    return this._process;
  }

  private handleRefreshUI = () => {
    this.host.requestUpdate();
  };

  private addProcessListeners() {
    this._process?.addUiEventListener(MAINFRAME_PROCESSES_STATE_UI_EVENTS.PROCESS_UPDATED, this.handleRefreshUI);
    this._process?.addUiEventListener(
      MAINFRAME_PROCESSES_STATE_UI_EVENTS.PROCESS_PROGRESS_UPDATED,
      this.handleRefreshUI,
    );
  }

  private removeProcessListeners() {
    this._process?.removeUiEventListener(MAINFRAME_PROCESSES_STATE_UI_EVENTS.PROCESS_UPDATED, this.handleRefreshUI);
    this._process?.removeUiEventListener(
      MAINFRAME_PROCESSES_STATE_UI_EVENTS.PROCESS_PROGRESS_UPDATED,
      this.handleRefreshUI,
    );
  }
}