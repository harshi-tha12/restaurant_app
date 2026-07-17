import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories {

  categories = [

    {name:'Pizza',icon:'local_pizza'},

    {name:'Burger',icon:'lunch_dining'},

    {name:'Noodles',icon:'ramen_dining'},

    {name:'Rice Items',icon:'rice_bowl'},

    {name:'Drinks',icon:'local_bar'},

    {name:'Ice Cream',icon:'icecream'},

    {name:'Desserts',icon:'cake'},

    {name:'Coffee',icon:'coffee'}

  ];

}