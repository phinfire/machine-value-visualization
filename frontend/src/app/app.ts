import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Visualization } from './visualization/visualization';

@Component({
  selector: 'app-root',
  imports: [Visualization],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'machine-value-visualization';
}