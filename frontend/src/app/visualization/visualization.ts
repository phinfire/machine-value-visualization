import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LiveMachineDataService } from '../live-machine-data-service';
import { PlotterService } from '../plotter-service';
import { WebSocketMessagePayload } from '../types';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-visualization',
    imports: [MatCheckboxModule, FormsModule, MatProgressSpinnerModule, MatIconModule],
    templateUrl: './visualization.html',
    styleUrl: './visualization.css',
})
export class Visualization implements OnInit {

    @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

    private socketService = inject(LiveMachineDataService);
    private plotterService = inject(PlotterService);

    protected knownMachines: Array<{ id: string, isVisible: boolean }> = [];
    protected dataIsOutdated: boolean = false;
    protected connectionIsActive: boolean = false;
    private previouslySeenMachineIdAndScrapIndexPairs: { machineId: string, scrapIndex: number }[] = [];
    private maxTotalValueSeen: number = 0;
    private currentSnapshots: WebSocketMessagePayload[] = [];

    ngOnInit() {
        this.socketService.isOutdated$.subscribe(isOutdated => {
            this.dataIsOutdated = isOutdated;
        });
        this.socketService.data$.subscribe(data => {
            if (data.snapshots) {
                const snapshots = data.snapshots;
                const machineAndScrapPairs: Set<{ machineId: string, scrapIndex: number }> = new Set(snapshots
                    .map((snapshot: WebSocketMessagePayload) => ({
                        machineId: snapshot.machineId,
                        scrapIndex: snapshot.scrapIndex
                    })));
                const newMachineIds = Array.from(machineAndScrapPairs).map(pair => pair.machineId).filter(machineId =>
                    !this.knownMachines.some(m => m.id === machineId));
                newMachineIds.forEach(machineId => {
                    if (!this.knownMachines.some(m => m.id === machineId)) {
                        this.knownMachines.push({ id: machineId, isVisible: true });
                    }
                });
                snapshots.push(...this.addEmptySnapshotsForMissingMachineAndScrapIndexPairs(machineAndScrapPairs));
                snapshots.sort((a: WebSocketMessagePayload, b: WebSocketMessagePayload) => {
                    if (a.machineId === b.machineId) {
                        return a.scrapIndex - b.scrapIndex;
                    }
                    return a.machineId.localeCompare(b.machineId);
                });
                this.maxTotalValueSeen = Math.max(this.maxTotalValueSeen, ...snapshots.map((s: WebSocketMessagePayload) => s.sixtySecondTotal));
                this.currentSnapshots = snapshots;
                this.updateChart();
            }
        });
    }

    private addEmptySnapshotsForMissingMachineAndScrapIndexPairs(machineAndScrapPairs: Set<{ machineId: string, scrapIndex: number }>) {
        const snapshots: WebSocketMessagePayload[] = [];
        for (const previousPair of this.previouslySeenMachineIdAndScrapIndexPairs) {
            if (!machineAndScrapPairs.has(previousPair)) {
                snapshots.push({
                    timestamp: new Date(),
                    machineId: previousPair.machineId,
                    scrapIndex: previousPair.scrapIndex,
                    sixtySecondTotal: 0,
                    sixtySecondAvg: 0
                });
            }
        }
        return snapshots;
    }

    onMachineVisibilityChange(): void {
        this.updateChart();
    }

    private updateChart(): void {
        const filteredSnapshots = this.currentSnapshots.filter(snapshot =>
            this.knownMachines.find(m => m.id === snapshot.machineId)?.isVisible ?? false
        );
        this.plotterService.drawMachineValueBarChart(this.chartContainer.nativeElement, filteredSnapshots, this.maxTotalValueSeen);
    }

}