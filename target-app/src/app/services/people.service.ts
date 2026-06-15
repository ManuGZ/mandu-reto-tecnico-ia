import { Injectable } from '@angular/core';
import { PEOPLE } from '../data/people.data';
import { Person } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  getAll(): Person[] {
    return PEOPLE;
  }
}
