// src/App.js
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import FirebaseAuthForm from "./Components/FirebaseAuthForm"; // note exact folder name (case-sensitive)

// === Helper Functions and Mock Data ===
const getProducts = () => {
  const products = [
    { id: '1', name: 'Vintage Camera', price: 250.00, category: 'electronics', image: '/assets/camera.jpg' },
    { id: '2', name: 'Leather Satchel', price: 120.00, category: 'bags', image: '/assets/satchel.jpeg' },
    { id: '3', name: 'Espresso Machine', price: 350.00, category: 'home', image: '/assets/espresso.jpeg' },
    { id: '4', name: 'Noise-Cancelling Headphones', price: 299.99, category: 'electronics', image: '/assets/headphones.jpeg' },
    { id: '5', name: 'Handcrafted Mug', price: 25.00, category: 'home', image: '/assets/mug.jpg' },
    { id: '6', name: 'Travel Backpack', price: 95.00, category: 'bags', image: '/assets/bag.jpeg' },
    { id: '7', name: 'Smart Watch', price: 180.00, category: 'electronics', image: '/assets/watch.jpeg' },
    { id: '8', name: 'Throw Blanket', price: 50.00, category: 'home', image: '/assets/blanket.jpeg' },
  ];
  return products;
};

// === Cart persistence (localStorage) keyed by firebase uid ===
const cartStore = {
  _readAll() {
    try {
      return JSON.parse(localStorage.getItem("carts") || "{}");
    } catch {
      return {};
    }
  },
  _writeAll(all) {
    localStorage.setItem("carts", JSON.stringify(all));
  },
  getCart(uid) {
    if (!uid) return [];
    const all = this._readAll();
    return all[uid] || [];
  },
  saveCart(uid, cart) {
    if (!uid) return;
    const all = this._readAll();
    all[uid] = cart;
    this._writeAll(all);
  },
  removeCart(uid) {
    const all = this._readAll();
    delete all[uid];
    this._writeAll(all);
  }
};

// === cartService adapted to use Firebase uid ===
const cartService = {
  getCart: () => {
    const user = auth.currentUser;
    if (!user) return [];
    return cartStore.getCart(user.uid);
  },
  addItem: (product) => {
    const user = auth.currentUser;
    if (!user) return;
    let cart = cartStore.getCart(user.uid);
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    cartStore.saveCart(user.uid, cart);
  },
  removeItem: (productId) => {
    const user = auth.currentUser;
    if (!user) return;
    let cart = cartStore.getCart(user.uid).filter(i => i.id !== productId);
    cartStore.saveCart(user.uid, cart);
  },
  adjustQuantity: (productId, delta) => {
    const user = auth.currentUser;
    if (!user) return;
    let cart = cartStore.getCart(user.uid);
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
      }
      cartStore.saveCart(user.uid, cart);
    }
  }
};

// === Header component ===
const Header = ({ onLogout, onNavigate, currentUser, cartCount }) => (
  <header className="bg-white shadow-sm sticky top-0 z-50">
    <div className="container mx-auto p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => onNavigate('products')}>
        Shopify
      </h1>
      <nav className="flex items-center space-x-4">
        {currentUser && (
          <span className="text-gray-600">Welcome, {currentUser.email}</span>
        )}
        {currentUser ? (
          <>
            <button onClick={() => onNavigate('cart')} className="relative p-2 rounded-full text-gray-600 hover:text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H3m4 8a2 2 0 100 4" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('login')} className="px-4 py-2 text-gray-800 hover:text-gray-600 transition duration-300">Login</button>
            <button onClick={() => onNavigate('signup')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">Signup</button>
          </>
        )}
      </nav>
    </div>
  </header>
);

// === ProductList (inline) ===
const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState(getProducts());
  const [filters, setFilters] = useState({ price: '', category: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const allCategories = [...new Set(getProducts().map(p => p.category))];

  useEffect(() => {
    let filteredProducts = getProducts();

    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters.price) {
      const [min, max] = filters.price.split('-').map(Number);
      filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= (max || Infinity));
    }

    if (searchTerm) {
      filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setProducts(filteredProducts);
  }, [filters, searchTerm]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Filters</h3>

            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input id="search" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200" placeholder="Search products..." />
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select id="category" name="category" value={filters.category} onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">All Categories</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select name="price" value={filters.price} onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">All Prices</option>
                <option value="0-50">$0 - $50</option>
                <option value="51-150">$51 - $150</option>
                <option value="151-300">$151 - $300</option>
                <option value="301-999">$301+</option>
              </select>
            </div>
          </aside>

          <main className="w-full md:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-xl font-bold text-gray-900 mt-1">${product.price.toFixed(2)}</p>
                  <button onClick={() => onAddToCart(product)} className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {products.length === 0 && <div className="text-center py-10 text-gray-500">No products found matching your filters.</div>}
          </main>
        </div>
      </div>
    </div>
  );
};

// === CartPage (inline) ===
const CartPage = ({ onUpdateCart }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(cartService.getCart());
  }, [onUpdateCart]);

  const handleRemoveItem = (id) => {
    cartService.removeItem(id);
    onUpdateCart();
    setCartItems(cartService.getCart());
  };

  const handleQuantityChange = (id, delta) => {
    cartService.adjustQuantity(id, delta);
    onUpdateCart();
    setCartItems(cartService.getCart());
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Your Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="divide-y divide-gray-200">
              {cartItems.map(item => (
                <li key={item.id} className="flex flex-col md:flex-row items-center py-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md mr-4" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700">-</button>
                    <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700">+</button>
                    <button onClick={() => handleRemoveItem(item.id)} className="ml-4 text-red-500 hover:text-red-700 transition duration-300">Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-right">
              <p className="text-2xl font-bold text-gray-800">Total: ${total.toFixed(2)}</p>
              <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-300">Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// === Main App Component ===
const App = () => {
  const [currentUser, setCurrentUser] = useState(null); // firebase user object or null
  const [page, setPage] = useState('login');
  const [cartCount, setCartCount] = useState(0);

  // Listen to Firebase auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setPage('products');
        updateCartCount();
      } else {
        setPage('login');
        setCartCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // called after FirebaseAuthForm reports success OR if auth state changes
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setPage('products');
    updateCartCount();
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setPage('login');
    setCartCount(0);
  };

  const handleNavigate = (pageName) => {
    setPage(pageName);
  };

  const handleAddToCart = (product) => {
    cartService.addItem(product);
    updateCartCount();
  };

  const updateCartCount = () => {
    const cart = cartService.getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <FirebaseAuthForm type="login" onAuthSuccess={handleAuthSuccess} onNavigate={setPage} />;
      case 'signup':
        return <FirebaseAuthForm type="signup" onAuthSuccess={handleAuthSuccess} onNavigate={setPage} />;
      case 'products':
        return <ProductList onAddToCart={handleAddToCart} />;
      case 'cart':
        return <CartPage onUpdateCart={updateCartCount} />;
      default:
        return <FirebaseAuthForm type="login" onAuthSuccess={handleAuthSuccess} onNavigate={setPage} />;
    }
  };

  return (
    <div className="font-sans">
      <Header onLogout={handleLogout} onNavigate={handleNavigate} currentUser={currentUser} cartCount={cartCount} />
      {renderPage()}
    </div>
  );
};

export default App;
