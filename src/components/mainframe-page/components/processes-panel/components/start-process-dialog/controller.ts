import { MAINFRAME_OWNED_PROGRAMES_STATE_UI_EVENTS } from '@state/mainframe-owned-programs-state/constants';
import { MAINFRAME_HARDWARE_STATE_UI_EVENTS } from '@state/mainframe-hardware-state/constants';
import { BaseController } from '@shared/base-controller';
import { IProgram } from '@state/progam-factory/interfaces/program';
import { ProgramName } from '@state/progam-factory/types';

export class StartProcessDialogController extends BaseController {
  hostConnected() {
    this.mainframeOwnedProgramState.addUiEventListener(
      MAINFRAME_OWNED_PROGRAMES_STATE_UI_EVENTS.OWNED_PROGRAMS_UPDATED,
      this.handleRefreshUI,
    );
    this.mainframeHardwareState.addUiEventListener(MAINFRAME_HARDWARE_STATE_UI_EVENTS.HARDWARE_UPDATED, this.handleRefreshUI);
  }

  hostDisconnected() {
    this.mainframeOwnedProgramState.removeUiEventListener(
      MAINFRAME_OWNED_PROGRAMES_STATE_UI_EVENTS.OWNED_PROGRAMS_UPDATED,
      this.handleRefreshUI,
    );
    this.mainframeHardwareState.removeUiEventListener(MAINFRAME_HARDWARE_STATE_UI_EVENTS.HARDWARE_UPDATED, this.handleRefreshUI);
  }

  get ram(): number {
    return this.mainframeHardwareState.ram;
  }

  get cores(): number {
    return this.mainframeHardwareState.cores;
  }

  listPrograms(): IProgram[] {
    return this.mainframeOwnedProgramState.listOwnedPrograms();
  }

  getProgram(name: ProgramName): IProgram | undefined {
    return this.mainframeOwnedProgramState.getOwnedProgramByName(name)!;
  }

  startProcess(name: ProgramName, threads: number): boolean {
    return this.mainframeProcessesState.addProcess(name, threads);
  }

  handleRefreshUI = () => {
    this.host.requestUpdate();
  };
}
