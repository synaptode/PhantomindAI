import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DashboardStore } from './dashboard.store';

@Component({
  selector: 'pm-explorer',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="explorer animate-fade">
      <div class="search-box glass">
        <input 
          #searchInput
          type="text" 
          placeholder="Search codebase semantically... (e.g. 'how is auth handled?')"
          (keyup.enter)="onSearch(searchInput.value)"
        />
        <button (click)="onSearch(searchInput.value)">Search</button>
      </div>

      <div class="results" *ngIf="store.searchResults().length; else empty">
        <div class="result-card glass" *ngFor="let result of store.searchResults()">
          <div class="result-header">
            <span class="path">{{ result.path }}</span>
            <span class="score">{{ (result.score * 100).toFixed(0) }}% match</span>
          </div>
          <pre class="snippet"><code>{{ result.snippet }}</code></pre>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          <p>Enter a query to explore your project's context.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .explorer {
      display: grid;
      gap: 24px;
    }
    .search-box {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
    }
    input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--text-main);
      font-family: var(--font-body);
      outline: none;
    }
    button {
      background: var(--accent-primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
    }
    .results {
      display: grid;
      gap: 16px;
    }
    .result-card {
      padding: 20px;
      border-radius: 20px;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .path {
      font-family: monospace;
      color: var(--accent-secondary);
    }
    .score {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .snippet {
      margin: 0;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      font-size: 0.85rem;
      overflow-x: auto;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--text-muted);
    }
    .glass {
      background: var(--bg-surface);
      backdrop-filter: var(--blur-md);
      border: 1px solid var(--glass-border);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent {
  readonly store = inject(DashboardStore);

  onSearch(query: string): void {
    void this.store.search(query);
  }
}
