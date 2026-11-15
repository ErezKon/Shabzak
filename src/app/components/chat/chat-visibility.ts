import { select, Store } from '@ngrx/store';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { selectUrl } from '../../state-management/selectors/router.selector';
import { selectUser } from '../../state-management/selectors/user.selector';
import { AppState } from '../../state-management/states/app.state';

export function isChatVisible(user: User | undefined, url: string | undefined): boolean {
  return !!user && user.enabled && user.activated && !!url && !url.startsWith('/login');
}

export function chatVisible$(store: Store<AppState>): Observable<boolean> {
  return combineLatest([store.pipe(select(selectUser)), store.pipe(select(selectUrl))]).pipe(
    map(([user, url]) => isChatVisible(user, url)),
    distinctUntilChanged()
  );
}
