import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PeopleService } from '../../services/people.service';
import { Area, Person } from '../../models/person.model';
import { PersonDetail } from './person-detail/person-detail';

const AREA_COLORS: Record<Area, string> = {
  'Tecnología': 'blue',
  'Producto':   'purple',
  'Personas':   'green',
  'Comercial':  'orange',
  'Finanzas':   'cyan',
};

@Component({
  selector: 'app-directory',
  imports: [
    FormsModule,
    NzDrawerModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
    PersonDetail,
  ],
  templateUrl: './directory.html',
  styleUrl: './directory.scss',
})
export class Directory {
  private peopleService = inject(PeopleService);
  private allPeople = this.peopleService.getAll();

  protected readonly areas = Object.keys(AREA_COLORS) as Area[];
  protected selectedArea = signal<Area | 'Todas'>('Todas');
  protected filteredPeople = computed(() => {
    const area = this.selectedArea();
    return area === 'Todas' ? this.allPeople : this.allPeople.filter((p) => p.area === area);
  });

  protected selectedPerson = signal<Person | null>(null);

  protected areaColor(area: Area): string {
    return AREA_COLORS[area] ?? 'default';
  }

  protected selectPerson(person: Person) {
    this.selectedPerson.set(person);
  }

  protected closeDetail() {
    this.selectedPerson.set(null);
  }
}
