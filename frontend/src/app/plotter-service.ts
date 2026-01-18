import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { WebSocketMessagePayload } from './types';

@Injectable({
    providedIn: 'root',
})
export class PlotterService {

    public drawMachineValueBarChart(element: HTMLElement, data: WebSocketMessagePayload[], maxTotalValueSeen: number): void {
        d3.select(element).select('svg').remove();
        d3.select(element).selectAll('div').remove();
        const styles = getComputedStyle(element);

        const lightColor = styles.getPropertyValue('--light-color');
        const darkerColor = styles.getPropertyValue('--darker-color');
        const backgroundColor = styles.getPropertyValue('--background-color');

        const textSizeInPx = 20;
        const margin = { top: 20, right: 20, bottom: 80, left: 60 };
        const width = element.offsetWidth - margin.left - margin.right;
        const height = element.offsetHeight - margin.top - margin.bottom;

        const groupedData = d3.group(data, d => d.machineId);
        const machineIds = Array.from(groupedData.keys());

        const x0 = d3.scaleBand()
            .domain(machineIds)
            .range([0, width])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(data.map(d => `${d.scrapIndex}`))
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, maxTotalValueSeen])
            .nice()
            .range([height, 0]);

        const svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xAxis0 = svg.append('g')
            .attr('class', 'x-axis-primary')
            .attr('transform', `translate(0,${height})`);

        xAxis0.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', 'black')
            .style('stroke-width', '1px');

        xAxis0.selectAll('.machine-label')
            .data(machineIds)
            .enter()
            .append('text')
            .attr('class', 'machine-label')
            .attr('x', d => {
                const groupData = groupedData.get(d)!;
                const scrapIndices = groupData.map(item => item.scrapIndex).sort((a, b) => a - b);
                const minIndex = scrapIndices[0];
                const maxIndex = scrapIndices[scrapIndices.length - 1];
                const minPos = x1(`${minIndex}`)!;
                const maxPos = x1(`${maxIndex}`)! + x1.bandwidth();
                return x0(d)! + (minPos + maxPos) / 2;
            })
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .style("font-size", `${textSizeInPx}px`)
            .style("font-weight", "bold")
            .style("font-family", "'Inconsolata', monospace")
            .text(d => d);

        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).ticks(15))
            .selectAll("text")
            .style("font-size", `${textSizeInPx}px`)
            .style("font-family", "'Inconsolata', monospace");

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', `${textSizeInPx}px`)
            .style('font-family', "'Inconsolata', monospace")
            .text('Values');

        const tooltip = d3.select(element)
            .append('div')
            .style('position', 'absolute')
            .style('background', backgroundColor)
            .style('box-shadow', '0px 0px 6px #000')
            .style('border-radius', '0.25rem')
            .style('padding', '0.25rem')
            .style('opacity', '0');

        const thisService = this;
        machineIds.forEach(machineId => {
            const machineGroup = svg.append('g')
                .attr('transform', `translate(${x0(machineId)},0)`);

            machineGroup.selectAll('.bar')
                .data(groupedData.get(machineId)!)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x1(`${d.scrapIndex}`)!)
                .attr('y', d => y(d.sixtySecondTotal))
                .attr('width', x1.bandwidth())
                .attr('height', d => height - y(d.sixtySecondTotal))
                .attr('fill', lightColor)
                .on('mouseover', (event, d: WebSocketMessagePayload) => thisService.showSixtyTotalTooltipAtCursor(tooltip, event, d))
                .on('mousemove', (event, d: WebSocketMessagePayload) => thisService.showSixtyTotalTooltipAtCursor(tooltip, event, d))
                .on('mouseout', () => tooltip.style('opacity', 0));

            machineGroup.selectAll('.avg-bar')
                .data(groupedData.get(machineId)!)
                .enter()
                .append('rect')
                .attr('class', 'avg-bar')
                .attr('x', d => x1(`${d.scrapIndex}`)!)
                .attr('y', d => y(d.sixtySecondAvg))
                .attr('width', x1.bandwidth())
                .attr('height', d => height - y(d.sixtySecondAvg))
                .attr('fill', darkerColor)
                .on('mouseover', (event, d: WebSocketMessagePayload) => thisService.showSixtyAverageTooltipAtCursor(tooltip, event, d))
                .on('mousemove', (event, d: WebSocketMessagePayload) => thisService.showSixtyAverageTooltipAtCursor(tooltip, event, d))
                .on('mouseout', () => tooltip.style('opacity', 0));

            machineGroup.selectAll('.scrap-label')
                .data(groupedData.get(machineId)!)
                .enter()
                .append('text')
                .attr('class', 'scrap-label')
                .attr('x', d => x1(`${d.scrapIndex}`)! + x1.bandwidth() / 2)
                .attr('y', height + textSizeInPx)
                .attr('text-anchor', 'middle')
                .style('font-size', `${textSizeInPx}px`)
                .style('font-family', "'Inconsolata', monospace")
                .text(d => d.scrapIndex);
        });
    }

    private showSixtyTotalTooltipAtCursor(tooltip: any, event: MouseEvent, hoveredPayload: WebSocketMessagePayload) {
        this.showTooltipAtPosition(
            tooltip,
            event.pageX,
            event.pageY,
            `Total: ${hoveredPayload.sixtySecondTotal}`
        );
    }

    private showSixtyAverageTooltipAtCursor(tooltip: any, event: MouseEvent, hoveredPayload: WebSocketMessagePayload) {
        this.showTooltipAtPosition(
            tooltip,
            event.pageX,
            event.pageY,
            `Average: ${hoveredPayload.sixtySecondAvg.toFixed(2)}`
        );
    }

    private showTooltipAtPosition(tooltip: any, x: number, y: number, content: string) {
        tooltip
            .style('left', (x + 15) + 'px')
            .style('top', (y + 15) + 'px')
            .html(content)
            .style('opacity', 1);
    }
}
