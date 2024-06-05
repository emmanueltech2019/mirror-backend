const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (replace 'User' with the actual name of your User model)
        required: true,
      },
  coin: String,
  symbol: String,
  address: String,
});

module.exports = mongoose.model('Wallet', walletSchema);