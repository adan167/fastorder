import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
  extras: string[];
}

interface CartLine {
  product: Product;
  quantity: number;
  extras: string[];
}

interface DemoOrder {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  items: string;
  delivery?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  darkMode = this.readBoolean('fastorder-client-dark');
  installPrompt: BeforeInstallPromptEvent | null = null;
  appInstalled = false;
  installHelp = '';
  readonly categories = ['Todos', 'Hamburguesas', 'Papas', 'Bebidas', 'Postres'];
  readonly products: Product[] = [
    {
      id: 1,
      name: 'La Clásica',
      description: 'Carne a la parrilla, queso cheddar, lechuga y nuestra salsa secreta.',
      category: 'Hamburguesas',
      price: 19.9,
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=720&q=85',
      badge: 'Más pedida',
      extras: ['Queso extra', 'Tocino'],
    },
    {
      id: 2,
      name: 'Doble Fast',
      description: 'Doble carne, doble cheddar y cebolla caramelizada.',
      category: 'Hamburguesas',
      price: 26.5,
      image:
        'https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=720&q=85',
      extras: ['Queso extra', 'Tocino'],
    },
    {
      id: 3,
      name: 'Pollo Crunch',
      description: 'Pollo crocante, coleslaw fresco y mayo de la casa.',
      category: 'Hamburguesas',
      price: 22,
      image:
        'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=720&q=85',
      badge: 'Nuevo',
      extras: ['Queso extra', 'Tocino'],
    },
    {
      id: 4,
      name: 'Papas clásicas',
      description: 'Papas doradas, crujientes y recién hechas.',
      category: 'Papas',
      price: 9.5,
      image:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=720&q=85',
      extras: ['Queso cheddar', 'Tocino'],
    },
    {
      id: 5,
      name: 'Papas cheddar',
      description: 'Papas crocantes con salsa cheddar y tocino.',
      category: 'Papas',
      price: 14.5,
      image:
        'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=720&q=85',
      extras: ['Extra cheddar', 'Extra tocino'],
    },
    {
      id: 6,
      name: 'Limonada',
      description: 'Limón recién exprimido, hierbabuena y hielo.',
      category: 'Bebidas',
      price: 7,
      image:
        'https://images.unsplash.com/photo-1513558161293-cafa765edfd7?auto=format&fit=crop&w=720&q=85',
      extras: ['Extra limón', 'Hierbabuena extra'],
    },
    {
      id: 7,
      name: 'Milkshake',
      description: 'Helado de vainilla batido. Elige tu momento feliz.',
      category: 'Bebidas',
      price: 12.5,
      image:
        'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=720&q=85',
      extras: ['Galleta Oreo', 'Crema chantilly'],
    },
    {
      id: 8,
      name: 'Brownie tibio',
      description: 'Chocolate intenso con centro suave.',
      category: 'Postres',
      price: 8,
      image:
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=720&q=85',
      extras: ['Helado de vainilla', 'Salsa de chocolate'],
    },
    {
      id: 9,
      name: 'Torta de chocolate',
      description: 'Bizcocho húmedo de chocolate cubierto con ganache.',
      category: 'Postres',
      price: 8,
      image:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=720&q=85',
      extras: ['Crema chantilly', 'Salsa de chocolate'],
    },
  ];
  readonly extras = [
    { name: 'Queso extra', price: 3 },
    { name: 'Tocino', price: 4 },
    { name: 'Queso cheddar', price: 3 },
    { name: 'Extra cheddar', price: 3 },
    { name: 'Extra tocino', price: 4 },
    { name: 'Extra limón', price: 1.5 },
    { name: 'Hierbabuena extra', price: 1.5 },
    { name: 'Galleta Oreo', price: 2.5 },
    { name: 'Crema chantilly', price: 2 },
    { name: 'Helado de vainilla', price: 3.5 },
    { name: 'Salsa de chocolate', price: 2 },
    { name: 'Oreo extra', price: 2.5 },
  ];
  query = '';
  category = 'Todos';
  view: 'menu' | 'checkout' | 'history' | 'tracking' = 'menu';
  cart: CartLine[] = [];
  selected: Product | null = null;
  selectedExtras: string[] = [];
  delivery = 'Recojo en tienda';
  customerName = '';
  customerPhone = '';
  address = '';
  notice = '';
  noticeError = false;
  orders: DemoOrder[] = this.loadOrders();
  activeOrder: DemoOrder | null = null;

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.installPrompt = event as BeforeInstallPromptEvent;
    });
    window.addEventListener('appinstalled', () => {
      this.appInstalled = true;
      this.installPrompt = null;
      this.installHelp = 'FastOrder quedó instalada en este dispositivo.';
    });
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('fastorder-client-dark', String(this.darkMode));
  }

  async installApp(): Promise<void> {
    if (this.installPrompt) {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      this.installHelp =
        choice.outcome === 'accepted'
          ? 'Instalación aceptada. Sigue las indicaciones del navegador.'
          : 'La instalación se canceló. Puedes intentarlo de nuevo desde el botón.';
      this.installPrompt = null;
      return;
    }
    this.installHelp = this.appInstalled
      ? 'FastOrder ya está instalada en este dispositivo.'
      : 'Para instalarla, usa “Instalar aplicación” o “Añadir a pantalla de inicio” en el menú del navegador.';
  }

  get filteredProducts(): Product[] {
    const term = this.query.trim().toLocaleLowerCase('es');
    return this.products.filter(
      (product) =>
        (this.category === 'Todos' || product.category === this.category) &&
        (!term ||
          `${product.name} ${product.description} ${product.category}`
            .toLocaleLowerCase('es')
            .includes(term)),
    );
  }

  get itemCount(): number {
    return this.cart.reduce((sum, line) => sum + line.quantity, 0);
  }

  get subtotal(): number {
    return this.cart.reduce(
      (sum, line) =>
        sum +
        line.quantity *
          (line.product.price +
            line.extras.reduce(
              (extraTotal, name) =>
                extraTotal + (this.extras.find((extra) => extra.name === name)?.price ?? 0),
              0,
            )),
      0,
    );
  }

  get total(): number {
    return this.subtotal + (this.delivery === 'Delivery' && this.cart.length ? 5 : 0);
  }

  get availableExtras(): { name: string; price: number }[] {
    return this.extras.filter((extra) => this.selected?.extras.includes(extra.name));
  }

  openProduct(product: Product): void {
    this.selected = product;
    this.selectedExtras = [];
  }

  toggleExtra(name: string): void {
    this.selectedExtras = this.selectedExtras.includes(name)
      ? this.selectedExtras.filter((extra) => extra !== name)
      : [...this.selectedExtras, name];
  }

  addSelected(): void {
    if (!this.selected) return;
    this.cart.push({ product: this.selected, quantity: 1, extras: [...this.selectedExtras] });
    this.selected = null;
    this.notice = '¡Agregado a tu pedido!';
    this.noticeError = false;
  }

  changeQuantity(index: number, delta: number): void {
    const line = this.cart[index];
    if (!line) return;
    if (line.quantity + delta <= 0) this.removeLine(index);
    else line.quantity += delta;
  }

  removeLine(index: number): void {
    this.cart.splice(index, 1);
  }

  goCheckout(): void {
    if (!this.cart.length) {
      this.notice = 'Agrega algo rico antes de continuar.';
      this.noticeError = true;
      return;
    }
    this.notice = '';
    this.view = 'checkout';
  }

  submitOrder(): void {
    if (
      !this.customerName.trim() ||
      !/^[0-9+\s-]{7,15}$/.test(this.customerPhone.trim()) ||
      (this.delivery === 'Delivery' && !this.address.trim())
    ) {
      this.notice = 'Completa tu nombre, un teléfono válido y la dirección si elegiste delivery.';
      this.noticeError = true;
      return;
    }
    const order: DemoOrder = {
      id: `FO-${Date.now().toString().slice(-6)}`,
      customer: this.customerName.trim(),
      date: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
      total: this.total,
      status: 'Pendiente',
      items: this.cart
        .map(
          (line) =>
            `${line.quantity} × ${line.product.name}${line.extras.length ? ` (+ ${line.extras.join(', ')})` : ''}`,
        )
        .join(', '),
      delivery: this.delivery,
    };
    this.orders = [order, ...this.orders];
    this.saveOrders();
    this.activeOrder = order;
    this.cart = [];
    this.view = 'tracking';
    this.notice = '';
  }

  advanceTracking(): void {
    if (!this.activeOrder) return;
    const statuses = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
    const nextIndex = statuses.indexOf(this.activeOrder.status) + 1;
    const nextStatus = statuses[nextIndex];
    if (!nextStatus) return;
    this.activeOrder.status = nextStatus;
    this.orders = this.orders.map((order) =>
      order.id === this.activeOrder?.id ? this.activeOrder : order,
    );
    this.saveOrders();
    this.notice = `Seguimiento de demostración: ${nextStatus}.`;
    this.noticeError = false;
  }

  show(view: 'menu' | 'checkout' | 'history' | 'tracking'): void {
    this.view = view;
    this.notice = '';
  }

  imageFallback(event: Event): void {
    (event.target as HTMLImageElement).src = '/placeholder.svg';
  }

  private loadOrders(): DemoOrder[] {
    try {
      const raw = localStorage.getItem('fastorder-client-orders');
      return raw ? (JSON.parse(raw) as DemoOrder[]) : [];
    } catch (error) {
      console.error('No se pudo leer el historial local de pedidos.', error);
      return [];
    }
  }

  private readBoolean(key: string): boolean {
    try {
      return localStorage.getItem(key) === 'true';
    } catch (error) {
      console.error('No se pudo leer la preferencia de tema.', error);
      return false;
    }
  }

  private saveOrders(): void {
    try {
      localStorage.setItem('fastorder-client-orders', JSON.stringify(this.orders));
    } catch (error) {
      console.error('No se pudo guardar el historial local de pedidos.', error);
      this.notice =
        'El pedido está creado, pero no se pudo guardar el historial en este dispositivo.';
      this.noticeError = true;
    }
  }
}
