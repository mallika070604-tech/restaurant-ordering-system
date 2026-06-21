import 'dotenv/config';
import connectDB from './config/db.js';
import Table from './models/Table.js';
import MenuItem from './models/MenuItem.js';
import { generateTableQR } from './services/qrService.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const menuItems = [

// STARTERS
{
name: "Chicken 65",
description: "Spicy South Indian Chicken Starter",
price: 220,
category: "starters",
prepTimeMinutes: 15,
image: "/images/chicken65.jpg"
},
{
name: "Chilli Chicken",
description: "Hot & Spicy Chicken",
price: 240,
category: "starters",
prepTimeMinutes: 15,
image: "/images/chilli-chicken.jpg"
},
{
name: "Paneer Tikka",
description: "Grilled Paneer Cubes",
price: 210,
category: "starters",
prepTimeMinutes: 15,
image: "/images/paneer-tikka.jpg"
},

// BIRYANIS
{
name: "Chicken Biryani",
description: "Hyderabadi Dum Biryani",
price: 250,
category: "mains",
prepTimeMinutes: 20,
image: "/images/chicken-biryani.jpg"
},
{
name: "Chicken Fry Piece Biryani",
description: "Special Fry Piece Biryani",
price: 280,
category: "mains",
prepTimeMinutes: 25,
image: "/images/chicken-fry-piece-biryani.jpg"
},
{
name: "Mutton Biryani",
description: "Traditional Mutton Biryani",
price: 350,
category: "mains",
prepTimeMinutes: 25,
image: "/images/mutton-biryani.jpg"
},
{
name: "Veg Biryani",
description: "Vegetable Dum Biryani",
price: 180,
category: "mains",
prepTimeMinutes: 15,
image: "/images/veg-biryani.jpg"
},

// FRIED RICE
{
name: "Chicken Fried Rice",
description: "Chinese Style Fried Rice",
price: 220,
category: "mains",
prepTimeMinutes: 15,
image: "/images/chicken-fried-rice.jpg"
},
{
name: "Veg Fried Rice",
description: "Vegetable Fried Rice",
price: 180,
category: "mains",
prepTimeMinutes: 15,
image: "/images/veg-fried-rice.jpg"
},

// BEVERAGES
{
name: "Coke",
description: "Chilled Coca Cola",
price: 40,
category: "beverages",
prepTimeMinutes: 2,
image: "/images/coke.jpg"
},
{
name: "Sprite",
description: "Refreshing Sprite",
price: 40,
category: "beverages",
prepTimeMinutes: 2,
image: "/images/sprite.jpg"
},
{
name: "Fresh Lime Soda",
description: "Fresh Lime Drink",
price: 60,
category: "beverages",
prepTimeMinutes: 5,
image: "/images/fresh-lime-soda.jpg"
},

// DESSERTS
{
name: "Gulab Jamun",
description: "Indian Sweet Dessert",
price: 80,
category: "desserts",
prepTimeMinutes: 5,
image: "/images/gulab-jamun.jpg"
},
{
name: "Chocolate Brownie",
description: "Hot Chocolate Brownie",
price: 120,
category: "desserts",
prepTimeMinutes: 5,
image: "/images/chocolate-brownie.jpg"
},
{
name: "Vanilla Ice Cream",
description: "Classic Vanilla Ice Cream",
price: 100,
category: "desserts",
prepTimeMinutes: 2,
image: "/images/vanilla-ice-cream.jpg"
}

];


const seed = async () => {
  await connectDB();

  await MenuItem.deleteMany({});
  await Table.deleteMany({});

  await MenuItem.insertMany(menuItems);
  console.log(`Seeded ${menuItems.length} menu items`);

  for (let i = 1; i <= 8; i++) {
    const qrCode = await generateTableQR(i, clientUrl);
    await Table.create({ number: i, capacity: 4, qrCode });
    console.log(`Created table ${i}`);
  }

  console.log('Seed completed');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
