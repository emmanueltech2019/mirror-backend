const mongoose = require("mongoose");


const messageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reason: { type: String, required: true },
  message: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const Message = mongoose.model("Message", messageSchema);

module.exports= Message;
