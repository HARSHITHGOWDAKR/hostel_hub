// Seed Data conforming exactly to the Firestore Database Schema:
// users: userId, name, phone, hostelBlock, roomNumber
// stores: storeId, storeName, category, location, ownerId, isOpen
// products: productId, storeId, name, price, isAvailable, category
// orders: orderId, userId, storeId, items, totalAmount, status, timestamp

export const INITIAL_USERS = [
  {
    userId: "user_thejas_01",
    name: "Thejas Gowda",
    phone: "+91 98765 43210",
    hostelBlock: "Block B",
    roomNumber: "204",
    email: "thejas.gowda@campus.edu",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  {
    userId: "user_ananya_02",
    name: "Ananya Sharma",
    phone: "+91 98450 11223",
    hostelBlock: "Girls Hostel Gate 1",
    roomNumber: "G-102",
    email: "ananya.s@campus.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  }
];

export const HOSTEL_LOCATIONS = [
  { id: "Block A", name: "Hostel Block A", tag: "Boys Wing (Senior)", coords: { x: 28, y: 72 } },
  { id: "Block B", name: "Hostel Block B", tag: "Boys Wing (Junior/Tech)", coords: { x: 78, y: 74 } },
  { id: "Girls Hostel Gate 1", name: "Girls Hostel Gate 1", tag: "North Campus Enclave", coords: { x: 30, y: 24 } },
  { id: "PG Hostel Block C", name: "PG Hostel Block C", tag: "Research Scholar Quad", coords: { x: 74, y: 28 } },
  { id: "Freshers Block D", name: "Freshers Block D", tag: "Campus West Wing", coords: { x: 15, y: 50 } }
];

export const INITIAL_STORES = [
  {
    storeId: "store_stationery_01",
    storeName: "Campus Stationery Store",
    category: "Stationery",
    location: "Student Activity Center (SAC) Ground Floor",
    ownerId: "owner_ramesh_stationery",
    isOpen: true,
    rating: 4.9,
    reviewsCount: 328,
    deliveryTime: "10-15 mins",
    minOrder: 20,
    banner: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
    tags: ["Stationery", "Record Books", "Engineering Tools", "Printing"],
    allowedHostels: ["Block A", "Block B", "Girls Hostel Gate 1", "PG Hostel Block C", "Freshers Block D"],
    coords: { x: 45, y: 48 }
  },
  {
    storeId: "store_food_02",
    storeName: "Night Canteen & Maggi Point",
    category: "Food/Hotels",
    location: "Near Hostel Block A Cafeteria",
    ownerId: "owner_suresh_canteen",
    isOpen: true,
    rating: 4.8,
    reviewsCount: 512,
    deliveryTime: "15-20 mins",
    minOrder: 40,
    banner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    tags: ["Hot Meals", "Maggi", "Cold Coffee", "Parathas"],
    allowedHostels: ["Block A", "Block B", "Girls Hostel Gate 1", "PG Hostel Block C", "Freshers Block D"],
    coords: { x: 22, y: 65 }
  },
  {
    storeId: "store_grocery_03",
    storeName: "Hostel Grocery Mart",
    category: "Groceries",
    location: "Central Campus Market Complex",
    ownerId: "owner_vijay_grocery",
    isOpen: true,
    rating: 4.7,
    reviewsCount: 240,
    deliveryTime: "12-18 mins",
    minOrder: 50,
    banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
    tags: ["Snacks", "Beverages", "Toiletries", "Dairy"],
    allowedHostels: ["Block A", "Block B", "Girls Hostel Gate 1", "PG Hostel Block C", "Freshers Block D"],
    coords: { x: 55, y: 35 }
  },
  {
    storeId: "store_bakery_04",
    storeName: "Campus Oven & Bakery",
    category: "Bakeries",
    location: "Library Annex Plaza",
    ownerId: "owner_meera_bakery",
    isOpen: true,
    rating: 4.9,
    reviewsCount: 189,
    deliveryTime: "10-15 mins",
    minOrder: 30,
    banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    tags: ["Puffs", "Cakes", "Cookies", "Breads"],
    allowedHostels: ["Block A", "Block B", "Girls Hostel Gate 1", "PG Hostel Block C", "Freshers Block D"],
    coords: { x: 68, y: 42 }
  },
  {
    storeId: "store_general_05",
    storeName: "Essential Needs General Store",
    category: "General Stores",
    location: "Campus Main Gate 2",
    ownerId: "owner_anand_general",
    isOpen: true,
    rating: 4.6,
    reviewsCount: 145,
    deliveryTime: "15-25 mins",
    minOrder: 50,
    banner: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80",
    tags: ["Electronics Accessories", "Medicines", "Hostel Locks", "Umbrellas"],
    allowedHostels: ["Block A", "Block B", "Girls Hostel Gate 1", "PG Hostel Block C", "Freshers Block D"],
    coords: { x: 82, y: 18 }
  }
];

export const INITIAL_PRODUCTS = [
  // Stationery Products (specifically for Demonstration flow: Record Book ₹80 & Pen ₹10)
  {
    productId: "prod_record_book",
    storeId: "store_stationery_01",
    name: "Record Book (₹80)",
    price: 80,
    isAvailable: true,
    category: "Stationery",
    description: "Standard 192-page ruled hardbound university laboratory record notebook.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_pen_blue",
    storeId: "store_stationery_01",
    name: "Pen (₹10)",
    price: 10,
    isAvailable: true,
    category: "Stationery",
    description: "Smooth 0.7mm blue rollerball pen with quick-dry ink for exams & notes.",
    image: "https://images.unsplash.com/photo-1585336261026-77cc7c458e39?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_drawing_sheet",
    storeId: "store_stationery_01",
    name: "Engineering Drawing Sheet (₹25)",
    price: 25,
    isAvailable: true,
    category: "Stationery",
    description: "A2 high-grade cartridge paper sheet for CAD & manual drafting.",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_geometry_box",
    storeId: "store_stationery_01",
    name: "Geometry Box (₹120)",
    price: 120,
    isAvailable: true,
    category: "Stationery",
    description: "Complete mathematical drawing instruments with steel compass & dividers.",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_calculator_out_of_stock",
    storeId: "store_stationery_01",
    name: "Scientific Calculator fx-991EX (₹850)",
    price: 850,
    isAvailable: false,
    category: "Stationery",
    description: "Advanced engineering scientific calculator with matrix & vector functions.",
    image: "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Out of Stock"
  },
  {
    productId: "prod_highlighter_set",
    storeId: "store_stationery_01",
    name: "Pastel Highlighters (Pack of 4)",
    price: 65,
    isAvailable: true,
    category: "Stationery",
    description: "Soft pastel chisel tip markers for textbook study and summary highlights.",
    image: "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },

  // Food / Hotels Products
  {
    productId: "prod_butter_maggi",
    storeId: "store_food_02",
    name: "Special Butter Masala Maggi",
    price: 55,
    isAvailable: true,
    category: "Food/Hotels",
    description: "Double Maggi noodles with crunchy veggies and Amul butter dollop.",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_cold_coffee",
    storeId: "store_food_02",
    name: "Iced Cold Coffee",
    price: 45,
    isAvailable: true,
    category: "Food/Hotels",
    description: "Frothy chilled espresso blended with full-cream milk and cocoa sprinkle.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_paneer_sandwich",
    storeId: "store_food_02",
    name: "Grilled Paneer Tikka Sandwich",
    price: 75,
    isAvailable: true,
    category: "Food/Hotels",
    description: "Crispy grilled bread packed with spiced cottage cheese and mint chutney.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },

  // Groceries Products
  {
    productId: "prod_biscuits",
    storeId: "store_grocery_03",
    name: "Dark Fantasy Choco Fills",
    price: 40,
    isAvailable: true,
    category: "Groceries",
    description: "Crispy dark cookies filled with molten Belgian chocolate.",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_milk_tetra",
    storeId: "store_grocery_03",
    name: "Amul Taaza Milk (500ml)",
    price: 36,
    isAvailable: true,
    category: "Groceries",
    description: "Homogenized toned fresh milk in sterile tetra pack.",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },

  // Bakery Products
  {
    productId: "prod_veg_puff",
    storeId: "store_bakery_04",
    name: "Hot Crispy Veg Puff",
    price: 25,
    isAvailable: true,
    category: "Bakeries",
    description: "Flaky golden puff pastry stuffed with spicy potato & green peas.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },
  {
    productId: "prod_choco_lava",
    storeId: "store_bakery_04",
    name: "Choco Lava Cake",
    price: 60,
    isAvailable: true,
    category: "Bakeries",
    description: "Warm gooey chocolate fondant cake with melted dark chocolate center.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  },

  // General Store Products
  {
    productId: "prod_cycle_lock",
    storeId: "store_general_05",
    name: "Hostel Door & Bicycle Lock",
    price: 180,
    isAvailable: true,
    category: "General Stores",
    description: "Heavy-duty brass padlock with 3 anti-pick keys for hostel room security.",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&auto=format&fit=crop&q=80",
    stockStatus: "Available"
  }
];

export const INITIAL_ORDERS = [
  {
    orderId: "ORDER_998",
    userId: "user_ananya_02",
    studentName: "Ananya Sharma",
    phone: "+91 98450 11223",
    hostelBlock: "Girls Hostel Gate 1",
    roomNumber: "G-102",
    storeId: "store_stationery_01",
    storeName: "Campus Stationery Store",
    items: [
      { productId: "prod_drawing_sheet", name: "Engineering Drawing Sheet (₹25)", price: 25, qty: 2 }
    ],
    totalAmount: 50,
    status: "Delivered",
    paymentMethod: "COD",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

export const ORDER_STATUS_FLOW = [
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered"
];
