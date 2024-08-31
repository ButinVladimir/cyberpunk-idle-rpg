import { IProgram } from '@state/progam-factory/interfaces/program';
import { ISerializedProcess } from './serialized-process';

export interface IProcess {
  program: IProgram;
  isActive: boolean;
  threads: number;
  currentCompletionPoints: number;
  maxCompletionPoints: number;
  totalRam: number;
  toggleActive(active: boolean): void;
  increaseCompletion(usedCores: number): void;
  resetCompletion(): void;
  serialize(): ISerializedProcess;
}
