import { Component, inject } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PeopleService } from '../../services/people.service';
import { Area } from '../../models/person.model';

const AREA_COLORS: Record<Area, string> = {
  'Tecnología': 'blue',
  'Producto':   'purple',
  'Personas':   'green',
  'Comercial':  'orange',
  'Finanzas':   'cyan',
};

@Component({
  selector: 'app-directory',
  imports: [NzTableModule, NzTagModule, NzTypographyModule],
  templateUrl: './directory.html',
  styleUrl: './directory.scss',
})
export class Directory {
  private peopleService = inject(PeopleService);
  protected people = this.peopleService.getAll();

  protected areaColor(area: Area): string {
    return AREA_COLORS[area] ?? 'default';
  }
}
