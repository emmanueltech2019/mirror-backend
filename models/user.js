const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6 
  },
  UserId: {
    type: String,
    required: true,
    minlength: 6,
    unique: true 
  },
  balance:{
    type: Number,
    default:0,
    required:true
  },
  profit:{
    type: Number,
    default:0,
    required:true
  },
  deposited:{
    type: Number,
    default:0,
    required:true
  },
  wallets:{
    type:Array,
    default:[
      {
        wallet:"xxxxxxxxxxxxxxxx",
        coin:"Bitcoin",
        index:0,
        symbol: 'BTC'
      },
      {
        wallet:"xxxxxxxxxxxxxxxx",
        coin:"Ethereum",
        index:0,
        symbol: 'ETH'
      },
      {
        wallet:"xxxxxxxxxxxxxxxx",
        coin:"Tether",
        index:0,
        symbol: 'USDT'
      },
      {
        wallet:"xxxxxxxxxxxxxxxx",
        coin:"Litecoin",
        index:0,
        symbol: 'LTC'
      }

    ]
  },
  kycVerification:{
    type:Object,
  },
  verified:{
    type:String,
    default:"unverified"
  },
  refferalEmail:{
    type:String,
  },
  phone:{
    type:String,
  },
  country:{
    type:String,
  },
  avatar:{
    type:String,
    default:""
  },
  gender:{
    type:String,
  },
  region:{
    type:String,
  },
  city:{
    type:String,
  },
  zip:{
    type:String,
  },
  address2:{
    type:String,
  },
  address1:{
    type:String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;