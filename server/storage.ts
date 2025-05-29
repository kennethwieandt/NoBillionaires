import { 
  users, products, cartItems, orders, orderItems, subscriptions,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Subscription, type InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart methods
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Subscription methods
  subscribe(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(email: string): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private subscriptions: Map<number, Subscription>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentSubscriptionId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.subscriptions = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentSubscriptionId = 1;
    
    this.initializeProducts();
  }

  private initializeProducts() {
    const initialProducts = [
      {
        name: "Trump Pride Rainbow Tee",
        description: "Bold rainbow design celebrating both pride and political resistance. Made in Olympia, WA with sustainable materials. Fight the establishment while showing your colors!",
        price: "24.99",
        imageUrl: "/api/placeholder/400/400",
        category: "T-Shirts",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Rainbow", "Black", "White"],
        inventory: 50,
        featured: true,
        tags: ["pride", "political", "resistance", "olympia", "sustainable"]
      },
      {
        name: "Anti-Corporate Hoodie",
        description: "Cozy hoodie with bold anti-establishment messaging. Perfect for protests or daily wear. Locally sourced in Olympia, WA. Comfort meets rebellion!",
        price: "45.99",
        imageUrl: "/api/placeholder/400/400",
        category: "Hoodies",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Gray", "Navy"],
        inventory: 30,
        featured: true,
        tags: ["anti-corporate", "protest", "comfortable", "olympia", "rebellion"]
      },
      {
        name: "Resistance Tank Top",
        description: "Lightweight tank perfect for summer activism. Breathable fabric for those long protest days. Made with care in Olympia, WA. Stay cool while fighting the system!",
        price: "19.99",
        imageUrl: "/api/placeholder/400/400",
        category: "Tank Tops",
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Black", "Red"],
        inventory: 40,
        featured: false,
        tags: ["summer", "activism", "lightweight", "olympia", "protest"]
      }
    ];

    initialProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    })).filter(item => item.product);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const item: CartItem = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
    }
    return item;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    for (const [id, item] of this.cartItems.entries()) {
      if (item.sessionId === sessionId) {
        this.cartItems.delete(id);
      }
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
    }
    return order;
  }

  async subscribe(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const subscription: Subscription = { 
      ...insertSubscription, 
      id,
      createdAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async getSubscription(email: string): Promise<Subscription | undefined> {
    for (const sub of this.subscriptions.values()) {
      if (sub.email === email) return sub;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
