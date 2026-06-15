import { Component, signal } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Topbar } from '../topbar/topbar';

interface NavModule {
  key: string;
  name: string;
  active: boolean;
}

const MODULES: NavModule[] = [
  { key: 'home',         name: 'Inicio',      active: false },
  { key: 'documents',    name: 'Directorio',  active: true  },
  { key: 'organization', name: 'Organigrama', active: false },
  { key: 'performance',  name: 'Desempeño',   active: false },
  { key: 'social',       name: 'Social',      active: false },
];

@Component({
  selector: 'app-navbar',
  imports: [NgClass, NgStyle, NzTooltipModule, Topbar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected expanded = signal(false);
  protected modules = MODULES;

  toggleExpand(): void {
    this.expanded.set(!this.expanded());
  }

  moduleClick(module: NavModule): void {
    this.modules = this.modules.map(m => ({ ...m, active: m.key === module.key }));
  }
}
