

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  resetPasswordCode:{
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  name: {
    type: String,
    trim: true
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return !this.walletAddress; }, // Required if no wallet
    minlength: 6 
  },
  // Added: To store the wallet from your 'Ethereum wallet address' field
  walletAddress: {
    type: String,
    sparse: true // Allows multiple users to have 'null' if they haven't linked a wallet yet
  },
  UserId: {
    type: String,
    required: true,
    unique: true 
  },
  balance: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  deposited: { type: Number, default: 0 },
  wallets: {
    type: Array,
    default: [
      { wallet: "", coin: "Bitcoin", index: 0, symbol: 'BTC' },
      { wallet: "", coin: "Ethereum", index: 1, symbol: 'ETH' },
      { wallet: "", coin: "Tether", index: 2, symbol: 'USDT' },
      { wallet: "", coin: "Litecoin", index: 3, symbol: 'LTC' },
      { wallet: "", coin: "Metis", index: 4, symbol: 'METIS' }
    ]
  },
  verified: { type: String, default: "unverified" },
  withdrawStatus: { type: Boolean, default: true },
  balanceHistory: [{
    oldBalance: Number,
    newBalance: Number,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// --- MIDDLEWARE & METHODS ---

// 1. Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  
  // Auto-generate name from first/last if missing
  if (this.firstName && this.lastName && !this.name) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  next();
});

// 2. Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 3. Method to generate JWT
userSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;