import { AppStateValue } from '../types';
import { IGeneralSerializedState } from './general-serialized-state';

export interface IGeneralState {
  currentState: AppStateValue;
  randomSeed: number;
  startLoadingGame(): void;
  startRunningGame(): void;
  startNewState(): void;
  deserialize(serializedState: IGeneralSerializedState): void;
  serialize(): IGeneralSerializedState;
}