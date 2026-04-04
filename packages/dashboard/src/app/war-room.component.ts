import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { DashboardStore } from './dashboard.store';

@Component({
  selector: 'pm-war-room',
  standalone: true,
  imports: [NgIf, NgClass, NgFor],
  template: `
    <div class="war-room animate-fade">
      <div class="status-panel glass" [ngClass]="{ 'active': store.agentStatus()?.active }">
        <div class="status-indicator">
          <div class="pulse" *ngIf="store.agentStatus()?.active"></div>
          <span class="status-text">{{ store.agentStatus()?.active ? 'Agent Active' : 'Agent Idle' }}</span>
        </div>
        <div class="status-details">
          <div class="action">{{ store.agentStatus()?.lastAction || 'Waiting for task...' }}</div>
          <div class="reasoning" *ngIf="store.agentStatus()?.lastReasoning">
            "{{ store.agentStatus()?.lastReasoning }}"
          </div>
        </div>
      </div>

      <div class="context-map glass">
        <div class="map-header">
          <h3>Context Relationship Map</h3>
          <p>Real-time knowledge graph of your project nodes.</p>
        </div>
        <div class="map-canvas">
          <div class="node" *ngFor="let node of store.contextMap()?.nodes" 
               [style.width.px]="node.size * 5" 
               [style.height.px]="node.size * 5"
               [ngClass]="node.type">
            <span class="node-label">{{ node.label }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .war-room {
      display: grid;
      gap: 24px;
    }
    .status-panel {
      padding: 24px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      transition: var(--transition-smooth);
    }
    .status-panel.active {
      border-color: var(--accent-primary);
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);
    }
    .status-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-width: 100px;
    }
    .pulse {
      width: 20px;
      height: 20px;
      background: var(--accent-primary);
      border-radius: 50%;
      animation: pulse-glow 2s infinite;
    }
    .status-text {
      font-weight: 700;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .status-details {
      flex: 1;
    }
    .action {
      font-family: var(--font-display);
      font-size: 1.25rem;
      margin-bottom: 8px;
    }
    .reasoning {
      font-style: italic;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .context-map {
      padding: 24px;
      border-radius: 24px;
      min-height: 400px;
    }
    .map-header h3 {
      margin: 0;
      font-family: var(--font-display);
    }
    .map-header p {
      margin: 4px 0 24px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .map-canvas {
      position: relative;
      width: 100%;
      height: 300px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
      align-items: center;
    }
    .node {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      transition: var(--transition-smooth);
    }
    .node:hover {
      transform: scale(1.1);
      border-color: var(--accent-secondary);
    }
    .node-label {
      font-size: 0.75rem;
      font-weight: 600;
    }
    .node.module { background: rgba(99, 102, 241, 0.2); border-color: var(--accent-primary); }
    .node.file { background: rgba(6, 182, 212, 0.2); border-color: var(--accent-secondary); }
    
    .glass {
      background: var(--bg-surface);
      backdrop-filter: var(--blur-md);
      border: 1px solid var(--glass-border);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarRoomComponent {
  readonly store = inject(DashboardStore);
}
