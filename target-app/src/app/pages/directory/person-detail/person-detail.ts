import { Component, computed, input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-person-detail',
  imports: [NzTagModule],
  templateUrl: './person-detail.html',
  styleUrl: './person-detail.scss',
})
export class PersonDetail {
  person = input.required<Person>();
  areaColor = input<string>('default');

  protected initials = computed(() => {
    const words = this.person()
      .name.trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    return words
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  });

  protected hireDateLabel = computed(() => {
    const [year, month, day] = this.person()
      .hireDate.split('-')
      .map((n) => Number(n));
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  });
}
