# OperAID Dev Challenge – Real-Time Data Task - Solution

## Launch Instructions

Clone the repository, open the folder in a terminal and run:
```bash
cd backend && npm install && npm start
```
to start the backend server.

In a separate terminal, run:
```bash
cd frontend && npm install && ng serve
```
to start the frontend.

Go to `http://localhost:4200/` in your browser to view the visualization.

## Backend
On launch, the backend will attempt to connect to a local MQTT broker.
Broker host, port, and topic can be configured via the backend `.env` file, along with the port the WebSocket server will be made available on.

If no connection to the message broker can be established, the backend will continuously generate mock messages. Mock data is generated at a configurable interval (see `.env`) with random machine IDs (A1-A3, B1-B2), scrap indices (1-4), and values (1-10).

Independent of the data source, the backend will broadcast the aggregated values to connected frontend clients.

## Frontend
On opening the frontend, the visualization will appear and update itself for as long as the backend is running.
Upon losing connection to the backend or the backend not sending any data for more than 60 seconds, a notification will appear.

### Visualization
The per `machineId` and `scrapIndex` total and average values are visualized as grouped and layered bar charts using D3.js.

Each machine is represented as a group of layered bars. The smaller, darker bars represent the average values, the larger, lighter bars represent the total values over the last 60 seconds.

#### Hover Tooltips
Hovering over a bar displays a tooltip showing the total value or average value (rounded to two decimal places) for that machine and scrap index.

#### Filtering Machines
Using the checkboxes above the chart, individual machine visibility can be toggled on and off.