import { Injectable } from '@angular/core';
import { Observable, interval, combineLatest } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { retry, map, shareReplay, startWith } from 'rxjs/operators';
import { WebSocketMessage } from './types';

@Injectable({
    providedIn: 'root',
})
export class LiveMachineDataService {

    private readonly websocketUrl = 'ws://localhost:8080';
    private readonly retryDelayMs = 1000;
    private readonly dataIsOutdatedAfterMs = 5000;
    readonly data$: Observable<WebSocketMessage>;
    readonly isOutdated$: Observable<boolean>;

    constructor() {
        this.data$ = webSocket<WebSocketMessage>(this.websocketUrl).pipe(
            retry({ delay: this.retryDelayMs }),
            shareReplay(1)
        );
        const lastReceivedAt$ = this.data$.pipe(
            map(() => Date.now()),
            startWith(0),
            shareReplay(1)
        );
        const now$ = interval(1000).pipe(
            startWith(0),
            map(() => Date.now())
        );
        this.isOutdated$ = combineLatest([now$, lastReceivedAt$]).pipe(
            map(([now, lastReceived]) =>
                lastReceived === 0
                    ? true
                    : now - lastReceived > this.dataIsOutdatedAfterMs
            ),
            shareReplay(1)
        );
    }
}