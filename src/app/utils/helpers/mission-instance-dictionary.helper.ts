import {select, Store} from '@ngrx/store';
import {AppState} from '../../state-management/states/app.state';
import {selectMissions} from '../../state-management/selectors/missions.selector';
import {Mission} from '../../models/mission.model';
import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import * as missionActions from '../../state-management/actions/missions.actions';

@Injectable()
export class InstanceToMissionDic {
    private _instanceToMissionDic$ = new BehaviorSubject<Map<number, Mission>>(new Map<number, Mission>());
    get instanceToMissionDic$() {
        return this._instanceToMissionDic$.asObservable();
    }
    
    constructor(private store: Store<AppState>) {
        store.dispatch(missionActions.getMissions());
        this.store.pipe(select(selectMissions))
            .subscribe(missions => {
                if(missions?.length) {
                    const instanceToMissionDic = new Map<number, Mission>();
                    for (const mission of missions) {
                        for (const instance of mission.missionInstances ?? []) {
                            instanceToMissionDic.set(instance.id, mission);
                        }
                    }
                    this._instanceToMissionDic$.next(instanceToMissionDic);
                }
            })
    }
}