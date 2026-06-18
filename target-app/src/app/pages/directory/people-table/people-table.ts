import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Area, Person } from '../../../models/person.model';
import { AREAS, areaColor } from '../area-colors';

@Component({
  selector: 'app-people-table',
  imports: [
    FormsModule,
    NzEmptyModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './people-table.html',
  styleUrl: './people-table.scss',
})
export class PeopleTable {
  people = input.required<Person[]>();
  selectedId = input<number | null>(null);
  emptyText = input<string>('No hay información disponible');

  personSelected = output<Person>();

  protected readonly areas = AREAS;
  protected readonly areaColor = areaColor;

  protected selectedArea = signal<Area | 'Todas'>('Todas');
  protected searchTerm = signal('');

  protected displayPeople = computed(() => {
    const area = this.selectedArea();
    const term = this.searchTerm().trim().toLowerCase();
    return this.people().filter((person) => {
      const matchesArea = area === 'Todas' || person.area === area;
      const matchesName = term === '' || person.name.toLowerCase().includes(term);
      return matchesArea && matchesName;
    });
  });

  protected readonly sortByName = (a: Person, b: Person) => a.name.localeCompare(b.name);
  protected readonly sortByArea = (a: Person, b: Person) => a.area.localeCompare(b.area);
  protected readonly sortByRole = (a: Person, b: Person) => a.role.localeCompare(b.role);
  protected readonly sortByManager = (a: Person, b: Person) => a.manager.localeCompare(b.manager);

  protected select(person: Person) {
    this.personSelected.emit(person);
  }
}
