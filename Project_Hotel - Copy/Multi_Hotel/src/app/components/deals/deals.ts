
// deals.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-deals',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './deals.html',

  styleUrls: ['./deals.css']
})

export class Deals {

  deals = [

    {
      title: 'Summer Luxury Escape',
      discount: '40% OFF',
      location: "Cox's Bazar",
      desc: 'Stay 3 nights and enjoy complimentary breakfast & sea view.',
      code: 'SUMMER40',
      emoji: '🏖',
      price: 12000
    },

    {
      title: 'Tea Garden Retreat',
      discount: '25% OFF',
      location: 'Sylhet',
      desc: 'Relax in nature with premium tea resort packages.',
      code: 'TEA25',
      emoji: '🍃',
      price: 8500
    },

    {
      title: 'City Business Deal',
      discount: '30% OFF',
      location: 'Dhaka',
      desc: 'Perfect for business travelers with airport pickup included.',
      code: 'CITY30',
      emoji: '🏙',
      price: 9500
    },

    {
      title: 'Family Holiday Package',
      discount: '50% OFF',
      location: 'Chittagong',
      desc: 'Book family suites with kids activities included.',
      code: 'FAMILY50',
      emoji: '👨‍👩‍👧‍👦',
      price: 15000
    }

  ];
}
