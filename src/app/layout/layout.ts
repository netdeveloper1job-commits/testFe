import { Component, effect, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
 /* 🔥 Parent owns sidebar state */
  isSidebarCollapsed = false;

  /* Loader signal */
  isLoading = signal(false);

  constructor() {
    
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
