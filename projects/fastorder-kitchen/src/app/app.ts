import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado';
interface KitchenOrder {
  id: string;
  customer: string;
  time: string;
  status: OrderStatus;
  items: { name: string; quantity: number; note?: string }[];
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  darkMode = this.readBoolean('fastorder-kitchen-dark');
  accountName = 'Equipo de cocina';
  readonly now = new Date();
  readonly statuses: OrderStatus[] = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
  readonly orders: KitchenOrder[] = [
    {
      id: 'FO-84216',
      customer: 'Valeria R.',
      time: '12:42',
      status: 'Pendiente',
      items: [
        { name: 'La Clásica', quantity: 2, note: 'Una sin cebolla' },
        { name: 'Papas cheddar', quantity: 1 },
      ],
    },
    {
      id: 'FO-84215',
      customer: 'Diego M.',
      time: '12:38',
      status: 'En preparación',
      items: [
        { name: 'Doble Fast', quantity: 1 },
        { name: 'Limonada', quantity: 2, note: 'Sin azúcar' },
      ],
    },
    {
      id: 'FO-84214',
      customer: 'Camila G.',
      time: '12:34',
      status: 'Pendiente',
      items: [
        { name: 'Pollo Crunch', quantity: 1 },
        { name: 'Papas clásicas', quantity: 1 },
      ],
    },
    {
      id: 'FO-84213',
      customer: 'Andrés P.',
      time: '12:29',
      status: 'Listo',
      items: [
        { name: 'La Clásica', quantity: 1 },
        { name: 'Milkshake', quantity: 1 },
      ],
    },
    {
      id: 'FO-84212',
      customer: 'Lucía C.',
      time: '12:21',
      status: 'Entregado',
      items: [{ name: 'Doble Fast', quantity: 2 }],
    },
    {
      id: 'FO-84211',
      customer: 'Martín S.',
      time: '12:18',
      status: 'En preparación',
      items: [
        { name: 'La Clásica', quantity: 1, note: 'Extra queso' },
        { name: 'Brownie tibio', quantity: 1 },
      ],
    },
  ];
  search = '';
  filter = 'Todos';
  notice = '';

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('fastorder-kitchen-dark', String(this.darkMode));
  }

  get visibleOrders(): KitchenOrder[] {
    const term = this.search.trim().toLocaleLowerCase('es');
    return this.orders.filter(
      (order) =>
        (this.filter === 'Todos' || order.status === this.filter) &&
        (!term ||
          `${order.id} ${order.customer} ${order.items.map((item) => item.name).join(' ')}`
            .toLocaleLowerCase('es')
            .includes(term)),
    );
  }

  count(status: OrderStatus): number {
    return this.orders.filter((order) => order.status === status).length;
  }

  nextStatus(order: KitchenOrder): void {
    const next = this.statuses[this.statuses.indexOf(order.status) + 1];
    if (!next) return;
    order.status = next;
    this.notice = `${order.id} actualizado a ${next}.`;
  }

  setStatus(order: KitchenOrder, status: string): void {
    if (this.statuses.includes(status as OrderStatus)) {
      order.status = status as OrderStatus;
      this.notice = `${order.id} actualizado a ${status}.`;
    }
  }

  clearNotice(): void {
    this.notice = '';
  }

  private readBoolean(key: string): boolean {
    try {
      return localStorage.getItem(key) === 'true';
    } catch (error) {
      console.error('No se pudo leer la preferencia de tema.', error);
      return false;
    }
  }
}
