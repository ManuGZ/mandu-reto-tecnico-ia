import { Component } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-topbar',
  imports: [NzDropDownModule, NzMenuModule, NzDividerModule, NgClass],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  protected moduleName = 'Directorio';

  protected user = {
    name: 'Diego Castro',
    email: 'diego.castro@empresa.com',
    initials: 'DC',
  };

  protected notificationCount = 3;
  protected profileOpen = false;

  onProfileVisibleChange(visible: boolean): void {
    this.profileOpen = visible;
  }
}
