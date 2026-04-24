import {select, Store} from '@ngrx/store';
import {AppState} from '../../state-management/states/app.state';
import {selectMissions} from '../../state-management/selectors/missions.selector';
import {Mission} from '../../models/mission.model';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {Injectable, OnDestroy} from '@angular/core';
import * as missionActions from '../../state-management/actions/missions.actions';

@Injectable({ providedIn: 'root' })
export class InstanceToMissionDic implements OnDestroy{
    private sub?: Subscription;
    private _instanceToMissionDic$ = new BehaviorSubject<Map<number, Mission>>(new Map<number, Mission>());
    get instanceToMissionDic$() {
        return this._instanceToMissionDic$.asObservable();
    }
    
    constructor(private store: Store<AppState>) {

    }

    loadDic(missions?: Observable<Array<Mission>>) {
        if(!missions) {
            this.store.dispatch(missionActions.getMissions());
            missions = this.store.pipe(select(selectMissions))
        }
        this.sub = missions.subscribe(missions => {
            if(missions?.length) {
                const instanceToMissionDic = new Map<number, Mission>();
                for (const mission of missions) {
                    for (const instance of mission.missionInstances ?? []) {
                        instanceToMissionDic.set(instance.id, mission);
                    }
                }
                this._instanceToMissionDic$.next(instanceToMissionDic);
            }
        });
    }
    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}