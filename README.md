# 🚀 HostelExpress - Campus Store & Food Delivery Platform

A production-grade, real-time campus delivery platform built with **Firebase Cloud Firestore**, modern **React/Vite (Dual Live Simulator)**, and modular **Flutter (Dart)** mobile architecture.

---

## 🔑 Authentication & Phone OTP Verification Flow

Both the **Student Application** and the **Store Owner Application** start directly from the **Mobile Number & OTP Login Screen**:

### 1. Student User App Login:
- **Phone Input:** Enter a 10-digit mobile number with `+91` country code.
- **OTP Dispatch:** Click *"Send Verification OTP"* ➔ A simulated SMS banner displays the 6-digit OTP code (e.g. `784210`).
- **OTP Verification:** Enter the 6-digit OTP to verify and sign in.
- **⚡ 1-Click Demo Shortcut:** A one-click button allows instantaneous sign-in as **Thejas Gowda (Hostel Block B, Room 204)**.
- **Log Out:** The student can log out via the top profile icon at any time to re-test the login flow.

### 2. Store Owner App Login:
- **Phone Input:** Enter the registered merchant mobile number (e.g. `98111 22334`).
- **Store Selection:** Select the campus store (*Campus Stationery Store*, *Night Canteen*, etc.).
- **OTP Verification:** Enter the 6-digit OTP to open the merchant terminal.
- **⚡ 1-Click Demo Shortcut:** A one-click button allows instantaneous sign-in as **Ramesh (Campus Stationery Store)**.
- **Sign Out:** A *"Sign Out"* button in the terminal header lets the owner return to the login screen anytime.

---

## 🛠️ Store Owner Item Management (Add & Edit Items)

Store Owners have complete real-time control over their store inventory directly from the **Store Owner Dashboard ➔ Inventory Tab**:

1. **Add New Items:**
   - Click the **`+ Add New Item`** button.
   - Enter **Item Name / Title**, **Price (₹)**, **Category** (*Stationery*, *Food/Hotels*, *Groceries*, *Bakeries*, *General Stores*), and **Description**.
   - Select a high-res thumbnail preset or input a custom image URL.
   - Toggle initial stock status (*Available* vs *Out of Stock*).
   - Once published, it writes directly to Cloud Firestore and appears **instantly on the Student App**!

2. **Full Item Editing:**
   - Click the **`✏️ Edit Item`** button on any inventory row.
   - Modify the **Product Name**, **Price**, **Category**, **Description**, or **Thumbnail**.
   - Switch real-time stock between **Available** and **Out of Stock**.
   - Click **`Save Changes ✓`** ➔ Updates Firestore immediately with app-to-app real-time synchronization.

3. **Real-Time Stock Toggle:**
   - The interactive switch button in the inventory table allows switching any product between *Available* and *Out of Stock* with a single click.

---

## 🌟 Demonstration Workflow (Quick Test Guide)

This exact test flow is supported end-to-end and pre-configured out-of-the-box:

1. **Student Logs in & Places Order:**
   - On the left student phone, log in (Thejas Gowda), select **"Block B"** from the top hostel picker.
   - Open **"Campus Stationery Store"** from the store discovery feed.
   - Add **"Record Book (₹80)"** and **"Pen (₹10)"** to the cart.
   - Notice that out-of-stock items (such as the fx-991EX Calculator) automatically disable their *Add to Cart* button.
   - Click **"Place Order"** (Total: **₹90** with Cash on Delivery / Pay at Gate toggle).

2. **Store Owner Receives Instant Alert:**
   - Store Owner Dashboard immediately plays a crisp **audio chime notification**.
   - **Order #1001 for ₹90** appears in the live order stream with itemized products and hostel room details.

3. **Status Transitions:**
   - Store Owner clicks **[Accept Order]** ➔ status updates to **"Preparing"** ➔ **"Ready"** ➔ **"Out for Delivery"** ➔ **"Delivered"**.

4. **Real-Time Student Screen Sync:**
   - Without refreshing the browser or screen, the student's **Order Tracking Screen** updates immediately across all states.
   - The interactive **Campus GPS Map** shows live coordinate tracking and telemetry as the rider moves from the SAC Stationery Store to Hostel Block B!

---

## 🏗️ Architecture & Technical Stack

- **Interactive Web Platform & Dual Simulator:** React 19, Vite, Vanilla CSS Design System, Lucide Icons, Web Audio API procedural chime synthesizer, Canvas Confetti.
- **Mobile Application:** Complete Flutter 3.x (Dart) modular codebase in `flutter_app/`.
- **Database:** Firebase Cloud Firestore with real-time snapshot listeners (`onSnapshot` / `snapshots()`).
- **Authentication:** Firebase Authentication (Email/Password & Phone OTP schema).
- **Navigation & Telemetry:** Simulated Google Maps GPS component with continuous coordinate interpolation, ETA countdown, and telemetry HUD.

---

## 🗄️ Cloud Firestore Database Schema

### 1. `users` Collection
```json
{
  "userId": "user_thejas_01",
  "name": "Thejas Gowda",
  "phone": "+91 98765 43210",
  "hostelBlock": "Block B",
  "roomNumber": "204"
}
```

### 2. `stores` Collection
```json
{
  "storeId": "store_stationery_01",
  "storeName": "Campus Stationery Store",
  "category": "Stationery",
  "location": "Student Activity Center (SAC) Ground Floor",
  "ownerId": "owner_ramesh_stationery",
  "isOpen": true
}
```

### 3. `products` Collection
```json
{
  "productId": "prod_record_book",
  "storeId": "store_stationery_01",
  "name": "Record Book (₹80)",
  "price": 80,
  "isAvailable": true,
  "category": "Stationery"
}
```

### 4. `orders` Collection
```json
{
  "orderId": "ORDER_1001",
  "userId": "user_thejas_01",
  "storeId": "store_stationery_01",
  "items": [
    { "productId": "prod_record_book", "name": "Record Book (₹80)", "price": 80, "qty": 1 },
    { "productId": "prod_pen_blue", "name": "Pen (₹10)", "price": 10, "qty": 1 }
  ],
  "totalAmount": 90,
  "status": "Placed",
  "paymentMethod": "COD",
  "timestamp": "2026-10-19T09:30:00.000Z"
}
```

---

## 💻 Running the Applications

### 1. Interactive Live Web Simulator
The application is running live locally on:
```bash
http://localhost:5173/
```

To run manually or restart:
```bash
npm install
npm run dev
```

### 2. Flutter (Dart) Mobile Code
The complete Flutter codebase is in `flutter_app/`:
```bash
cd flutter_app
flutter pub get
flutter run
```
