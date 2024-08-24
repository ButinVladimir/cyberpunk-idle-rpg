import { IProgram } from '@state/progam-factory/interfaces/program';
import constants from '@configs/programs.json';
import {
  IMainframeDevelopingProgramsState,
  IDevelopingProgram,
  IDevelopingProgramParameters,
  ISerializedDevelopingProgram,
} from './interfaces';

export class DevelopingProgram implements IDevelopingProgram {
  private _program: IProgram;
  private _isActive: boolean;
  private _currentDevelopmentPoints: number;
  private _mainframeDevelopingProgramsState: IMainframeDevelopingProgramsState;

  constructor(parameters: IDevelopingProgramParameters) {
    this._program = parameters.program;
    this._isActive = parameters.isActive;
    this._currentDevelopmentPoints = parameters.currentDevelopmentPoints;
    this._mainframeDevelopingProgramsState = parameters.mainframeDevelopingProgramsState;
  }

  get program() {
    return this._program;
  }

  get isActive() {
    return this._isActive;
  }

  get currentDevelopmentPoints() {
    return this._currentDevelopmentPoints;
  }

  get maxDevelopmentPoints() {
    return constants[this.program.name].developmentPoints;
  }

  toggleActive(active: boolean) {
    this._isActive = active;
    this._mainframeDevelopingProgramsState.fireUiEvents();
  }

  increaseDevelopment(delta: number): void {
    this._currentDevelopmentPoints += delta;

    const maxDevelopmentPoints = this.maxDevelopmentPoints;

    if (this._currentDevelopmentPoints > maxDevelopmentPoints) {
      this._currentDevelopmentPoints = maxDevelopmentPoints;
    }
  }

  serialize(): ISerializedDevelopingProgram {
    return {
      programName: this.program.name,
      level: this.program.level,
      quality: this.program.quality,
      isActive: this.isActive,
      currentDevelopmentPoints: this.currentDevelopmentPoints,
    };
  }
}
