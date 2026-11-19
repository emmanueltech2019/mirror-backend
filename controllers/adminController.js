const Admin = require("../models/admin")
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Deposit = require("../models/deposit");
const User = require("../models/user");
const Withdrawal = require("../models/withdraw");
const Messages = require("../models/message");
const Message = require("../models/message");
const nodemailer = require('nodemailer');

function generateSixDigitCode() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number

  // Generate a random number between min and max (inclusive)
  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the random number to a string with leading zeros (if required)
  const sixDigitCode = String(randomCode).padStart(6, '0');

  return sixDigitCode;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
// const transporter2 = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: 'finance.MirrorXTrade@gmail.com',
//     pass: 'gbpg dkyr lmbn ktrq'
//   }
// });
const transporter2 = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: 'tcxcashier@gmail.com',
    pass: 'xmyk zwzm vfrs jcrx'
  }
});
const emailTemplate = (subject, message) => `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #1E2329;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1E2329;
            padding: 20px;
            border-radius: 8px;
        }
        h1 {
            font-size: 24px;
            color: #fff;
        }
        p {
            font-size: 16px;
            color: #fff;
            line-height: 1.6;
        }
            .footer p {
             color: #ffffff
            }
        .footer {
            text-align: center;
            background-color: #202630;
            color: #ffffff;
            padding: 15px;
            font-size: 14px;
            border-radius: 0 0 8px 8px;
        }
             img {
            display: block;
            margin: 20px auto;
            
        }
    </style>
</head>
<body>
    <div class="email-container">
    <img src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1766362278/logo8_omkcxo.png" width="150"/>
    
        ${message}
        <div class="footer">
            <p>© Copyright 2025 | pixelxmint</p>
            <p>Need help with anything? <a href="mailto:admin@pixelxmint.com">Contact Us</a></p>
        </div>
    </div>
</body>
</html>

`;
const emailTemplate2 = (btcAmount, walletAddress, coinType, fiatEquivalent, transferFee, ) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Coinbase ${coinType} Received</title>
</head>

<body
    style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #d9e4f5;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d9e4f5; padding-top: 20px; padding-bottom: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #1e1e1e; border-radius: 10px; overflow: hidden;">
                    <tr>
                        <td align="center" style="background-color: #7479ff; padding: 20px;">
                            <img
                                src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1750923558/unnamed_1_ejs4if.png" />
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <div style="font-size: 50px; color: #00d084; margin-bottom: 10px;">&#10003;</div>
                            <h2 style="color: #ffffff; margin: 10px 0;">You just received</h2>
                            <p style="font-size: 24px; color: #ffffff; margin: 10px 0;"><strong>${btcAmount}
                                    ${coinType}</strong></p>
                            <p style="color: #cccccc; font-size: 16px;">via Coinbase network</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #333;">
                            <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6;">
                                You just received ${btcAmount} ${coinType} from an external ${coinType} account.<br>
                                It may take up to 6 network confirmations before your ${coinType} is available for
                                trade.
                                <a href="#" style="color: #3b82f6; text-decoration: none;">Learn more</a>
                            </p>
                            <div
        style="background-color: #cc0000; color: #fff; padding: 10px; margin: 20px auto; border-radius: 5px; width: 600; text-align: center;">
        <strong>Transfer fee:</strong> $${transferFee}<br />
       <strong>Wallet Address:</strong> <small>${walletAddress}</small>
    </div>

                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #d9e4f5; padding: 20px;">
                            <p style="font-size: 14px; color: #333;">Get the latest <strong>Coinbase</strong> App for
                                your phone</p>
                            <div style="margin: 10px 0;">
                                <a href="https://apps.apple.com/" style="margin-right: 10px;">
                                    <img src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1750924057/download-on-the-app-store_1_agimkh.png"
                                        height="40" alt="App Store" />
                                </a>
                                <a href="https://play.google.com/store">
                                    <img src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1750924049/Google_Play_Store_badge_EN_1_jk0kcr.png"
                                        height="40" alt="Google Play" />
                                </a>
                            </div>
                            <p style="font-size: 12px; color: #666; margin: 10px 0;">
                                To stop receiving these emails, unsubscribe from this list.
                            </p>
                            <p style="font-size: 12px; color: #666;">
                                <a href="#" style="color: #666;">Terms of Services</a><br>
                                &copy; Coinbase 2025 | Coinbase Europe Limited<br>
                                2 | DO2 R296 | Ireland
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>



`;
const emailTemplate3 = (subject, message ) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
 <title>${subject}</title>
</head>

<body
    style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #d9e4f5;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d9e4f5; padding-top: 20px; padding-bottom: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #1e1e1e; border-radius: 10px; overflow: hidden;">
                    <tr>
                        <td align="center" style="background-color: #7479ff; padding: 20px;">
                            <img
                                src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1750923558/unnamed_1_ejs4if.png" />
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 40px 20px; color: #ffffff;">
                            <p style="font-size: 15px; color: #fff !important;">${message}</p>

                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #d9e4f5; padding: 20px;">
                            <p style="font-size: 14px; color: #333;">Get the latest <strong>Coinbase</strong> App for
                                your phone</p>
                            <div style="margin: 10px 0;">
                                <a href="https://apps.apple.com/" style="margin-right: 10px;">
                                    <img src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1750924057/download-on-the-app-store_1_agimkh.png"
                                        height="40" alt="App Store" />
                                </a>
                                <a href="https://play.google.com/store">
                                    <img src="https://res.cloudinary.com/wise-solution-inc/image/upload/v1750924049/Google_Play_Store_badge_EN_1_jk0kcr.png"
                                        height="40" alt="Google Play" />
                                </a>
                            </div>
                            <p style="font-size: 12px; color: #666; margin: 10px 0;">
                                To stop receiving these emails, unsubscribe from this list.
                            </p>
                            <p style="font-size: 12px; color: #666;">
                                <a href="#" style="color: #666;">Terms of Services</a><br>
                                &copy; Coinbase 2025 | Coinbase Europe Limited<br>
                                2 | DO2 R296 | Ireland
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>



`;
const sendMail = async (email, subject, message) => {

  try {
    await transporter.sendMail({
      from: '"pixelxmint" <admin@pixelxmint.com>',
      to: email,
      subject,
      html: emailTemplate(subject, message),
    })
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
const sendCoinbaseMail = async (email, title, amount, wallet, coin, coinequivalent, transferFee) => {

  try {
    await transporter2.sendMail({ 
      from: `Coinbase: ${title} <tcxcashier@gmail.com>`,
      to: email,
      subject:title,
      html: emailTemplate2(amount, wallet, coin, coinequivalent, transferFee),
    })
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
const sendCoinbaseMail3 = async (email, subject, message) => {

  try {
    await transporter2.sendMail({ 
      from: `Coinbase: ${subject} <tcxcashier@gmail.com>`,
      to: email,
      subject:subject,
      html: emailTemplate3(subject, message),
    })
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
module.exports.sentEmailtoemail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    console.log("here")
    console.log(email, subject)
    await sendMail(email, subject, message);

    return res.status(200).json({ message: 'sent successfully', });
  } catch (error) {
    console.error('Error during user registration:', error);

    // Handle Mongoose ValidationError separately
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports.sentEmailtroCoinbase = async (req, res) => {
  try {
    const { email, amount, title, wallet, coin, coinequivalent, transferFee } = req.body;
    console.log("here")
    console.log(email, amount, title, wallet, coin, coinequivalent, transferFee);
    await sendCoinbaseMail(email, title, amount, wallet, coin, coinequivalent, transferFee);

    return res.status(200).json({ message: 'sent successfully', });
  } catch (error) {
    console.log("err here")
    console.error('Error during user registration:', error);

    // Handle Mongoose ValidationError separately
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports.sentEmailtroCoinbase3 = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    await sendCoinbaseMail3(email, subject, message);

    return res.status(200).json({ message: 'sent successfully', });
  } catch (error) {
    console.error('Error during user registration:', error);

    // Handle Mongoose ValidationError separately
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Register a new Admin
module.exports.registerAdmin = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the email is already registered
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Hash the password before saving to the database
      const AdminId =  generateSixDigitCode()
  
      // Create a new Admin object
      const newAdmin = new Admin({
        name,
        email,
        password,
        AdminId
      });
  
      // Save the new Admin to the database
      await newAdmin.save();
  
      return res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      console.error('Error during Admin registration:', error);
      // Check if the error is a Mongoose ValidationError
      if (error instanceof mongoose.Error.ValidationError) {
        // Extract the validation error messages
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ errors: validationErrors });
      }
  
      console.error('Error during Admin registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
      
    }
  };
  
  
  
  // Login Admin
  module.exports.loginAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the Admin with the provided email exists
      const newAdmin = await Admin.findOne({ email });
      if (!newAdmin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Check if the provided password matches the stored hashed password
      // const isPasswordValid = password, Admin.password
      if (password!==newAdmin.password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // If the password is valid, create a JSON Web Token (JWT) to authenticate the Admin
      const token = jwt.sign({ AdminId: newAdmin._id }, process.env.APP_SECRET);
  
      // You can set the token as an HTTP-only cookie to enhance security
      // res.cookie('token', token, { httpOnly: true });
  
      return res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
      console.error('Error during Admin login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  module.exports.getDeposits = async (req, res) => {
    try {
      // Fetch all deposits from the database
      const deposits = await Deposit.find({});
  
      return res.status(200).json(deposits);
    } catch (error) {
      console.error('Error while fetching deposits:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getWithdrawals = async (req, res) => {
    try {
      // Fetch all deposits from the database
      const withdraws = await Withdrawal.find({});
  
      return res.status(200).json(withdraws);
    } catch (error) {
      console.error('Error while fetching withdrawals:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getUsers = async (req, res) => {
    try {
      // Fetch all deposits from the database
      const users = await User.find({});
  
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error while fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getUserProfile = async (req, res) => {
    try {
      const {userId} =req.body
      // Fetch all deposits from the database
      const user = await User.findOne(userId);
      
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error while fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports.approveDeposit = async (req, res) => {
    try {
      const { userId, depositId } = req.body;
  
      // Check if the user exists in the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const newDeposit = await Deposit.findById(depositId);
      newDeposit.status = "approved"
      // Update the user's account balance
      user.balance += newDeposit.amount;
      user.deposited += newDeposit.amount;
      await user.save();
      await newDeposit.save();
  
      return res.status(201).json({ message: 'Deposit approved successful' });
  
    } catch (error) {
      console.error('Error during deposit:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.deleteDeposit = async (req, res) => {
    try {
      const { userId, depositId } = req.body;
  
      // Check if the user exists in the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the deposit exists
      const deposit = await Deposit.findById(depositId);
      if (!deposit) {
        return res.status(404).json({ message: 'Deposit not found' });
      }

  
      // Delete the deposit
      await Deposit.findByIdAndDelete(depositId);
  
      return res.status(200).json({ message: 'Deposit deleted successfully' });
    } catch (error) {
      console.error('Error deleting deposit:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.approveWithdrawal = async (req, res) => {
    try {
      const { withdrawalId } = req.body;
  
      // Check if the user exists in the database
      // const user = await User.findById(userId);
      // if (!user) {
      //   return res.status(404).json({ message: 'User not found' });
      // }
      const newWithdrawal = await Withdrawal.findById(withdrawalId);
      newWithdrawal.status = "completed"
      // Update the user's account balance
      // user.balance += newWithdrwal.amount;
      // user.deposited += newWithdrwal.amount;
      // await user.save();
      await newWithdrawal.save();
  
      return res.status(201).json({ message: 'Withdrawal approved successful' });
  
    } catch (error) {
      console.error('Error during withdrawal:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.deleteWithdrawal = async (req, res) => {
    try {
      const { userId, withdrawalId } = req.body;
  
      // Check if the user exists in the database
      // const user = await User.findById(userId);
      // if (!user) {
      //   return res.status(404).json({ message: 'User not found' });
      // }
  
      // Check if the deposit exists
      const withdrawal = await Withdrawal.findById(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal not found' });
      }
  
      // Delete the deposit
      await Withdrawal.findByIdAndDelete(withdrawalId);
  
      return res.status(200).json({ message: 'Withdrawal deleted successfully' });
    } catch (error) {
      console.error('Error deleting deposit:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getAdminProfile = async (req, res) => {
    try {
      const { AdminId } = req.user;
      console.log(req.user)
      // Fetch the user profile from the database
      const adminProfile = await Admin.findById(AdminId);
  
      if (!adminProfile) {
        return res.status(404).json({ message: 'Admin profile not found' });
      }
  
      // Remove sensitive information before sending the response (optional)
      // const { password, ...profileData } = adminProfile.toObject();
  
      return res.status(200).json(adminProfile);
    } catch (error) {
      console.error('Error while fetching user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports.updateAdminInfo = async (req, res) => {
    try {
      const AdminId = req.user.AdminId
      const { name, email, password } = req.body;
  
      // Check if the user exists in the database
      const admin = await Admin.findById(AdminId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Update the user's name and email
      admin.name = name;
      admin.email = email;
      admin.password = password;
      await admin.save();
  
      return res.status(200).json({ message: 'Admin information updated successfully', admin });
    } catch (error) {
      console.error('Error during admin information update:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.getAllSums = async (req, res) => {
    try {
      const adminId = req.user.adminId
  
      // Find all withdrawals and deposits of the specific user
      const withdrawals = await Withdrawal.find({  });
      const deposits = await Deposit.find({  });
  
       // Add a "transaction type" field to each record in withdrawals and deposits arrays
       const withdrawalsWithTypes = withdrawals.map((withdrawal) => ({
        ...withdrawal._doc,
        transactionType: 'withdrawal',
      }));
      const depositsWithTypes = deposits.map((deposit) => ({
        ...deposit._doc,
        transactionType: 'deposit',
      }));
  
      // Combine withdrawals and deposits into a single transaction history array
      const transactionHistory = [...withdrawalsWithTypes, ...depositsWithTypes];
  
      // Sort the transaction history by date in descending order
      transactionHistory.sort((a, b) => b.date - a.date);
  
      // Calculate total deposit and total withdrawal
      const totalDeposit = deposits.reduce((total, deposit) => total + deposit.amount, 0);
      const totalWithdrawal = withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);
  
      // Check if the user exists and retrieve their balance
      const user = await User.find();
     
  
      res.status(200).json({ transactionHistory, totalDeposit, totalWithdrawal, balance:user.balance, users:user.length });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Could not retrieve transaction history.' });
    }
  };

  // module.exports.updateBalance = async (req, res) => {
  //   try {
  //     const { balance, id } = req.body;
  //       const user = await User.findById(id);
  //     if (!user) {
  //       return res.status(404).json({ message: 'User not found' });
  //     }
  //     user.profit = parseInt(user.balance) - parseInt(user.deposited)
  //     user.balance = balance;
  //     await user.save();
  //     return res.status(200).json({ message: 'Admin information updated successfully', user });
  //   } catch (error) {
  //     console.error('Error during user information update:', error);
  //     return res.status(500).json({ message: 'Internal server error' });
  //   }
  // };
module.exports.updateBalance = async (req, res) => {
  try {
    const { balance, id } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldBalance = user.balance || 0;
    const newBalance = parseFloat(balance);

    // Calculate change and percentage
    const difference = newBalance - oldBalance;
    const percentageChange = oldBalance > 0 
      ? ((difference / oldBalance) * 100).toFixed(2)
      : 100; // If old balance was 0, set 100% change

    // Update main fields
    user.balance = newBalance;
    user.profit = parseInt(newBalance) - parseInt(user.deposited);

    // Add history record
    user.balanceHistory.push({
      oldBalance,
      newBalance,
      difference,
      percentageChange,
      date: new Date(),
    });

    await user.save();

    return res.status(200).json({
      message: 'Balance and history updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error during user information update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
  module.exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
  
    console.log('Deleting user with ID:', userId);
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      await User.findByIdAndDelete(userId);
      console.log('User deleted:', userId);
      res.status(200).send('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send(error.message);
    }
  };


module.exports.replyToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;
  const AdminId = req.user.AdminId; // Assuming req.user is set by authentication middleware
  try {
    const messageDoc = await Message.findById(messageId);
    if (!messageDoc) {
      return res.status(404).json({ message: 'Message not found' });
    }

    messageDoc.replies.push({ message, userId:AdminId, from:"Admin" });
    await messageDoc.save();

    return res.status(200).json({ message: 'Reply added successfully', messageDoc });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error replying to message', error });
  }
};