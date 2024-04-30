import { Component, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-base',
    standalone: true,
    imports: [],
    templateUrl: './base-component.component.html',
    styleUrl: './base-component.component.scss'
  })
export class BaseComponent implements OnDestroy {
    private subscriptions = new Array<Subscription>;

    ngOnDestroy(): void {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }

    addSub(sub: Subscription) {
        this.subscriptions.push(sub);
    }
}