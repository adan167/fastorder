import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado';
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  image: string;
}
interface AdminOrder {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: string;
}
type ProductDraft = Omit<Product, 'id'>;
interface DemoAccount {
  email: string;
  password: string;
  name: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isAuthenticated = false;
  darkMode = this.readBoolean('fastorder-admin-dark');
  authEmail = '';
  authPassword = '';
  authError = '';
  accountName = 'Administrador';
  readonly statuses: OrderStatus[] = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
  readonly sales = [
    { day: 'Lun', value: 48 },
    { day: 'Mar', value: 67 },
    { day: 'Mié', value: 54 },
    { day: 'Jue', value: 82 },
    { day: 'Vie', value: 72 },
    { day: 'Sáb', value: 96 },
    { day: 'Dom', value: 62 },
  ];
  orders: AdminOrder[] = [
    {
      id: 'FO-84216',
      customer: 'Valeria Rojas',
      date: 'Hoy, 12:42',
      total: 54.3,
      status: 'Pendiente',
      items: '2 × La Clásica, 1 × Papas cheddar',
    },
    {
      id: 'FO-84215',
      customer: 'Diego Morales',
      date: 'Hoy, 12:38',
      total: 40.5,
      status: 'En preparación',
      items: '1 × Doble Fast, 2 × Limonada',
    },
    {
      id: 'FO-84214',
      customer: 'Camila García',
      date: 'Hoy, 12:34',
      total: 36.5,
      status: 'Entregado',
      items: '1 × Pollo Crunch, 1 × Papas clásicas',
    },
    {
      id: 'FO-84213',
      customer: 'Andrés Pérez',
      date: 'Hoy, 12:29',
      total: 32.4,
      status: 'Listo',
      items: '1 × La Clásica, 1 × Milkshake',
    },
    {
      id: 'FO-84212',
      customer: 'Lucía Castro',
      date: 'Hoy, 12:21',
      total: 53,
      status: 'Entregado',
      items: '2 × Doble Fast',
    },
    {
      id: 'FO-84211',
      customer: 'Martín Salas',
      date: 'Hoy, 12:18',
      total: 31.9,
      status: 'En preparación',
      items: '1 × La Clásica, 1 × Brownie tibio',
    },
  ];
  products: Product[] = this.loadProducts();
  activeTab: 'dashboard' | 'products' | 'orders' | 'reports' = 'dashboard';
  search = '';
  orderSearch = '';
  selectedOrder: AdminOrder | null = null;
  editingId: number | null = null;
  formOpen = false;
  notice = '';
  draft: ProductDraft = this.blankProduct();

  constructor() {
    this.restoreSession();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('fastorder-admin-dark', String(this.darkMode));
  }

  useDemoAccount(): void {
    this.authEmail = 'admin@fastorder.demo';
    this.authPassword = 'admin123';
    this.authError = '';
  }

  submitAuth(): void {
    const email = this.authEmail.trim().toLocaleLowerCase('es');
    if (!email || this.authPassword.length < 6) {
      this.authError = 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.';
      return;
    }
    const accounts = this.loadAccounts();
    const account = accounts.find(
      (candidate) => candidate.email === email && candidate.password === this.authPassword,
    );
    if (!account) {
      this.authError = 'Correo o contraseña incorrectos.';
      return;
    }
    this.accountName = account.name;
    this.isAuthenticated = true;
    this.authError = '';
    localStorage.setItem(
      'fastorder-admin-session',
      JSON.stringify({ email: account.email, name: account.name }),
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    this.authPassword = '';
    localStorage.removeItem('fastorder-admin-session');
  }

  get revenue(): number {
    return this.orders.reduce((sum, order) => sum + order.total, 0);
  }

  get averageTicket(): number {
    return this.orders.length ? this.revenue / this.orders.length : 0;
  }

  get completedOrders(): number {
    return this.orders.filter((order) => order.status === 'Entregado').length;
  }

  get activeProductRatio(): number {
    return this.products.length
      ? (this.products.filter((product) => product.active).length / this.products.length) * 100
      : 0;
  }

  get visibleProducts(): Product[] {
    const term = this.search.trim().toLocaleLowerCase('es');
    return this.products.filter((product) =>
      `${product.name} ${product.category}`.toLocaleLowerCase('es').includes(term),
    );
  }

  get visibleOrders(): AdminOrder[] {
    const term = this.orderSearch.trim().toLocaleLowerCase('es');
    return this.orders.filter((order) =>
      `${order.id} ${order.customer} ${order.status}`.toLocaleLowerCase('es').includes(term),
    );
  }

  blankProduct(): ProductDraft {
    return {
      name: '',
      category: 'Hamburguesas',
      price: 0,
      stock: 0,
      active: true,
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    };
  }

  openNewProduct(): void {
    this.editingId = null;
    this.draft = this.blankProduct();
    this.formOpen = true;
  }

  editProduct(product: Product): void {
    this.editingId = product.id;
    this.draft = { ...product };
    this.formOpen = true;
  }

  saveProduct(): void {
    if (
      !this.draft.name.trim() ||
      !this.draft.category ||
      this.draft.price <= 0 ||
      this.draft.stock < 0
    ) {
      this.notice = 'Revisa el nombre, categoría, precio y stock del producto.';
      return;
    }
    if (this.editingId === null) {
      this.products = [...this.products, { ...this.draft, id: Date.now() }];
      this.notice = 'Producto creado correctamente.';
    } else {
      this.products = this.products.map((product) =>
        product.id === this.editingId ? { ...this.draft, id: product.id } : product,
      );
      this.notice = 'Producto actualizado correctamente.';
    }
    this.persistProducts();
    this.formOpen = false;
  }

  deleteProduct(product: Product): void {
    if (!confirm(`¿Eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`))
      return;
    this.products = this.products.filter((item) => item.id !== product.id);
    this.persistProducts();
    this.notice = `${product.name} fue eliminado.`;
  }

  setOrderStatus(order: AdminOrder, status: string): void {
    if (!this.statuses.includes(status as OrderStatus)) return;
    order.status = status as OrderStatus;
    this.notice = `El pedido ${order.id} ahora está ${status.toLowerCase()}.`;
  }

  exportReport(): void {
    const rows = [
      ['Pedido', 'Cliente', 'Fecha', 'Estado', 'Total (PEN)'],
      ...this.orders.map((order) => [
        order.id,
        order.customer,
        order.date,
        order.status,
        order.total.toFixed(2),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fastorder-reporte-demo.csv';
    link.click();
    URL.revokeObjectURL(url);
    this.notice = 'Reporte CSV de demostración descargado.';
  }

  imageFallback(event: Event): void {
    (event.target as HTMLImageElement).src = '/placeholder.svg';
  }

  dismissNotice(): void {
    this.notice = '';
  }

  private loadProducts(): Product[] {
    const seed: Product[] = [
      {
        id: 1,
        name: 'La Clásica',
        category: 'Hamburguesas',
        price: 19.9,
        stock: 24,
        active: true,
        image:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 2,
        name: 'Doble Fast',
        category: 'Hamburguesas',
        price: 26.5,
        stock: 18,
        active: true,
        image:
          'https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 3,
        name: 'Pollo Crunch',
        category: 'Hamburguesas',
        price: 22,
        stock: 12,
        active: true,
        image:
          'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 4,
        name: 'Papas clásicas',
        category: 'Papas',
        price: 9.5,
        stock: 30,
        active: true,
        image:
          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 5,
        name: 'Limonada',
        category: 'Bebidas',
        price: 7,
        stock: 2,
        active: false,
        image:
          'https://images.unsplash.com/photo-1513558161293-cafa765edfd7?auto=format&fit=crop&w=500&q=80',
      },
    ];
    try {
      const raw = localStorage.getItem('fastorder-admin-products');
      return raw ? (JSON.parse(raw) as Product[]) : seed;
    } catch (error) {
      console.error(
        'No se pudo leer el catálogo local; se utilizarán los productos demostrativos.',
        error,
      );
      return seed;
    }
  }

  private persistProducts(): void {
    try {
      localStorage.setItem('fastorder-admin-products', JSON.stringify(this.products));
    } catch (error) {
      console.error('No se pudo guardar el catálogo local.', error);
      this.notice =
        'El cambio está aplicado en esta sesión, pero no se pudo guardar en este dispositivo.';
    }
  }

  private loadAccounts(): DemoAccount[] {
    try {
      const raw = localStorage.getItem('fastorder-admin-accounts');
      const accounts = raw ? (JSON.parse(raw) as DemoAccount[]) : [];
      if (!accounts.some((account) => account.email === 'admin@fastorder.demo')) {
        accounts.push({
          email: 'admin@fastorder.demo',
          password: 'admin123',
          name: 'Admin FastOrder',
        });
      }
      return accounts;
    } catch (error) {
      console.error('No se pudieron leer las cuentas locales.', error);
      return [{ email: 'admin@fastorder.demo', password: 'admin123', name: 'Admin FastOrder' }];
    }
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem('fastorder-admin-session');
      if (!raw) return;
      const session = JSON.parse(raw) as { email: string; name: string };
      const account = this.loadAccounts().find((candidate) => candidate.email === session.email);
      if (account) {
        this.accountName = session.name;
        this.isAuthenticated = true;
      } else {
        localStorage.removeItem('fastorder-admin-session');
      }
    } catch (error) {
      console.error('No se pudo recuperar la sesión local.', error);
      localStorage.removeItem('fastorder-admin-session');
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
}
