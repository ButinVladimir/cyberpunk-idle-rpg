import { Scenario } from '@shared/types';
import { ICitySerializedState } from './city-serialized-state';
import { IDistrictInfo } from './district-info';

export interface ICityState {
  scenario: Scenario;
  getMap(): number[][];
  getDistrictInfo(num: number): IDistrictInfo;
  startNewState(): Promise<void>;
  deserialize(serializedState: ICitySerializedState): void;
  serialize(): ICitySerializedState;
}
