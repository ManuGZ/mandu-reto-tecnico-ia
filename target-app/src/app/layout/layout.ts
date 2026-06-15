import { Component } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Directory } from '../pages/directory/directory';

@Component({
  selector: 'app-layout',
  imports: [Navbar, Directory],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
