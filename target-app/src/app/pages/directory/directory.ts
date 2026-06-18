import { Component, computed, inject, signal } from '@angular/core';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PeopleService } from '../../services/people.service';
import { Person } from '../../models/person.model';
import { PersonDetail } from './person-detail/person-detail';
import { PeopleTable } from './people-table/people-table';
import { areaColor } from './area-colors';

@Component({
  selector: 'app-directory',
  imports: [NzDrawerModule, NzTabsModule, NzTypographyModule, PersonDetail, PeopleTable],
  templateUrl: './directory.html',
  styleUrl: './directory.scss',
})
export class Directory {
  private peopleService = inject(PeopleService);
  protected allPeople = this.peopleService.getAll();

  protected managers = computed(() => {
    const managerNames = new Set(
      this.allPeople.filter((person) => person.manager).map((person) => person.manager),
    );
    return this.allPeople.filter((person) => managerNames.has(person.name));
  });

  protected selectedPerson = signal<Person | null>(null);

  protected readonly areaColor = areaColor;

  protected selectPerson(person: Person) {
    this.selectedPerson.set(person);
  }

  protected closeDetail() {
    this.selectedPerson.set(null);
  }
}
