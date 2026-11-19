const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Deposit = require('../models/deposit');
const Withdrawal  = require("../models/withdraw")
const Investment = require('../models/invest'); 
const Message = require('../models/message')
const bcrypt = require('bcrypt');
const Wallet = require('../models/wallet');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();


function generateSixDigitCode() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number

  // Generate a random number between min and max (inclusive)
  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the random number to a string with leading zeros (if required)
  const sixDigitCode = String(randomCode).padStart(6, '0');

  return sixDigitCode;
}

// Extract the transporter configuration
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

const emailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to PixelXMint</title>
    <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            background-color: #0F1115; 
            color: #ffffff; 
            margin: 0; 
            padding: 0; 
        }
        .wrapper {
            background-color: #0F1115;
            padding: 40px 20px;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #15171C; 
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #2D2F36;
        }
        .hero { 
            padding: 40px; 
            text-align: center; 
        }
        .brand {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
        }
        h1 { 
            font-size: 28px; 
            margin-bottom: 16px; 
            color: #ffffff;
        }
        p { 
            color: #A1A1AA; 
            line-height: 1.6; 
            font-size: 16px;
        }
        .status-box {
            background-color: #1C1E26;
            border-left: 4px solid #2081E2;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
        }
        .cta-button { 
            display: inline-block; 
            padding: 14px 32px; 
            background-color: #2081E2; 
            color: #ffffff !important; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: bold;
            margin-top: 20px;
        }
        /* New Safe Sender Styling */
        .safe-sender {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #2D2F36;
            font-size: 13px;
            color: #71717A;
            text-align: center;
        }
        .footer {
            text-align: center;
            padding: 30px;
            font-size: 12px;
            color: #71717A;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="hero">
                <div class="brand">PixelXMint</div>
                <h1>Welcome, ${name}!</h1>
                <p>Thank you for joining the PixelXMint community. We're excited to have you on board as we redefine digital ownership.</p>
                
                <div class="status-box">
                    <strong style="color: #ffffff; display: block; margin-bottom: 8px;">Account Status: Under Review</strong>
                    <p style="margin: 0;">Our team is currently reviewing your account details to ensure a secure marketplace environment. You will be contacted via this email once your profile is fully activated.</p>
                </div>

                <p>In the meantime, feel free to explore the marketplace and discover the latest drops from our creators.</p>
                
                <a href="https://PixelXMint.com" class="cta-button">Visit Marketplace</a>

                <div class="safe-sender">
                    <strong>Pro Tip:</strong> To ensure you receive your activation notice, please add <span style="color: #ffffff;">hello@pixelxmint.com</span> to your contacts or mark this message as "Not Spam."
                </div>
            </div>
        </div>
        <div class="footer">
            &copy; 2026 PixelXMint Team. All rights reserved.<br>
            Digital Assets & Collectibles Marketplace
        </div>
    </div>
</body>
</html>
`;

const sendMail = async (email, name) => {

  try {
    await transporter.sendMail({
      from: '"PixelXMint" <admin@pixelxmint.com>',
      to: email,
      subject: "Welcome to PixelXMint!",
      html: emailTemplate(name),
    })
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// // Register a new user
// module.exports.registerUser = async (req, res) => {
//   try {
//     const { name, email, password, refferalEmail, firstName, lastName } = req.body;

//     // Check if the email is already registered
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     // Generate UserId
//     const UserId = generateSixDigitCode();

//     // Create a new user object
//     const newUser = new User({
//       name: `${firstName} ${lastName}`,
//       firstName,
//       lastName,
//       email,
//       password,
//       UserId,
//       refferalEmail,
//     });

//     // Generate JWT token
//     const token = jwt.sign({ userId: newUser._id }, process.env.APP_SECRET);

//     // Save the new user to the database
//     await newUser.save();

//     // Send welcome email
//     await sendMail(email, firstName);

//     return res.status(201).json({ message: 'User registered successfully', token, newUser });
//   } catch (error) {
//     console.error('Error during user registration:', error);

//     // Handle Mongoose ValidationError separately
//     if (error instanceof mongoose.Error.ValidationError) {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ errors: validationErrors });
//     }

//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Login user
// module.exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user with the provided email exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if the provided password matches the stored hashed password
//     // const isPasswordValid = password, user.password
//     if (password!==user.password) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }

//     // If the password is valid, create a JSON Web Token (JWT) to authenticate the user
//     const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);

//     // You can set the token as an HTTP-only cookie to enhance security
//     // res.cookie('token', token, { httpOnly: true });

//     return res.status(200).json({ token, message: 'Login successful', user });
//   } catch (error) {
//     console.error('Error during user login:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

module.exports.registerUser = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      walletAddress, 
      bio, 
      refferalEmail 
    } = req.body;

    // 1. Check for existing account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Generate required UserId
    const UserId = generateSixDigitCode();

    // 3. Create the user object
    // Note: If you use the 'pre-save' hook I provided earlier, 
    // the password will be hashed automatically before hitting the DB.
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      password, // Hashing handled by Model pre-save hook
      UserId,
      walletAddress,
      kycVerification: { bio },
      refferalEmail,
    });

    // 4. Save and generate token
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.APP_SECRET, { expiresIn: '7d' });

    // 5. Proactive: Send welcome email (Non-blocking)
    try {
      await sendMail(email, firstName);
    } catch (mailError) {
      console.error('Mail delivery failed, but user was created:', mailError);
    }

    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      token, 
      user: {
        id: newUser._id,
        email: newUser.email,
        UserId: newUser.UserId
      } 
    });

  } catch (error) {
    console.error('Error during registration:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user (Explicitly select password if it's hidden in schema)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // 2. Secure Password Comparison
    // Ensure you use bcrypt.compare rather than (password !== user.password)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(isMatch, "Password mismatch");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET, { expiresIn: '7d' });

    return res.status(200).json({ 
      success: true, 
      token, 
      message: 'Login successful', 
      user: {
        id: user._id,
        email: user.email,
        name: user.firstName + " " + user.lastName,
        verified: user.verified
      } 
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const openSeaStyleTemplate = (code) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 0; margin: 0; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { padding: 32px 20px; text-align: center; border-bottom: 1px solid #f3f4f6; }
        .logo { font-size: 24px; font-weight: 800; color: #2081E2; text-decoration: none; letter-spacing: -0.5px; }
        .content { padding: 40px 32px; text-align: center; }
        .title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 16px; }
        .text { color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px; }
        .code-box { background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 32px; }
        .code-text { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #111827; letter-spacing: 8px; }
        .footer { padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6; }
        .footer-text { font-size: 12px; color: #9ca3af; line-height: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://pixelxmint.com" class="logo">PixelXMint</a>
        </div>
        <div class="content">
            <h1 class="title">Verify your email</h1>
            <p class="text">To securely reset your password for PixelXMint, please use the 6-digit verification code below. This code will expire in 10 minutes.</p>
            
            <div class="code-box">
                <span class="code-text">${code}</span>
            </div>
            
            <p class="text" style="font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p class="footer-text">© 2026 PixelXMint. All rights reserved.<br>Ensuring secure digital ownership for everyone.</p>
        </div>
    </div>
</body>
</html>
`;
module.exports.resetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // 1. Security: Always return the same message to prevent email harvesting
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a code has been sent.' });
    }

    const resetCode = generateSixDigitCode();
    
    // 2. Scalability: Set an expiration (e.g., 10 minutes)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 600000; // 10 mins in ms
    await user.save();

    await transporter.sendMail({
      from: '"PixelXMint" <admin@pixelxmint.com>',
      to: email,
      subject: "Reset your PixelXMint password",
      html: openSeaStyleTemplate(resetCode), // Use the template helper below
    });

    // 3. Actionable: Provide a success response
    return res.status(200).json({ message: 'Reset code sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const newPasswordEmailTemplate = (newPass) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
        .header { padding: 30px; text-align: center; border-bottom: 1px solid #f3f4f6; }
        .logo { font-size: 22px; font-weight: 800; color: #2081E2; text-decoration: none; }
        .body { padding: 40px; text-align: center; }
        .pass-label { color: #6b7280; font-size: 14px; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; }
        .pass-value { font-size: 28px; font-weight: 700; color: #111827; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; display: inline-block; margin-bottom: 30px; }
        .btn { background: #2081E2; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header"><a href="#" class="logo">PixelXMint</a></div>
        <div class="body">
            <h2 style="margin-top:0;">Password Reset Complete</h2>
            <p style="color: #4b5563; margin-bottom: 30px;">Your password has been successfully reset. Use the temporary password below to log in.</p>
            
            <div class="pass-label">Temporary Password</div>
            <div class="pass-value">${newPass}</div>
            
            <br />
            <a href="https://pixelxmint.com/login" class="btn">Log in to PixelXMint</a>
            
            <p style="color: #ef4444; font-size: 13px; margin-top: 30px; font-weight: 600;">
                Important: Please change this password immediately after logging in for security.
            </p>
        </div>
        <div class="footer">© 2026 PixelXMint | Secure NFT Infrastructure</div>
    </div>
</body>
</html>
`;
module.exports.verifyAndGeneratePassword = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ 
      email, 
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    // 1. Generate a secure random password
    const temporaryPassword = crypto.randomBytes(4).toString('hex'); // e.g., 'a1b2c3d4'
    
    // 2. Assign the PLAIN TEXT password directly
    // DO NOT HASH IT HERE. The userSchema.pre('save') will hash it automatically.
    user.password = temporaryPassword;
    
    // 3. Clear reset fields
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    // 4. Save the user (This triggers the pre-save hook which hashes the plain text password)
    await user.save();

    // 5. Send the plain text password via email
    await transporter.sendMail({
      from: '"PixelXMint" <admin@pixelxmint.com>',
      to: email,
      subject: "Your New Temporary Password",
      html: newPasswordEmailTemplate(temporaryPassword), 
    });

    return res.status(200).json({ message: 'New password sent to your email.' });
  } catch (error) {
    console.error("Password Generation Error:", error);
    return res.status(500).json({ message: 'Reset failed. Please try again later.' });
  }
};
// Generate a 4-digit verification code
const generateVerificationCode = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Send email with the verification code
const sendVerificationMail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: '"PixelXMint" <admin@pixelxmint.com>',
      to: email,
      subject: "Your Verification Code",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Verification Code</title>
          <style>
              body { font-family: sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
              .code { font-size: 2em; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <p>Your verification code is:</p>
              <p class="code">${code}</p>
              <p>Please use this code to complete your registration.</p>
          </div>
      </body>
      </html>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Controller to send verification code
module.exports.sendVerificationCode = async (req, res) => {
  try {
    const userId = req.user.userId
    // Check if the email is already registered
    const existingUser = await User.findOne({ _id: userId });
    // console.log(existingUser, userId)
    if (!existingUser) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Send verification code to user's email
    await sendVerificationMail(existingUser.email, verificationCode);

    // Optionally save the verification code in the database or cache
    // For simplicity, we'll assume you're using a field on the User model
    existingUser.verificationCode = verificationCode;
    await existingUser.save();
    console.log('sent')
    return res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports.verifyUser = async(req, res) => {
  try {
    const userId = req.user.userId
    let {code} = req.body
    // Check if the email is already registered
    const user = await User.findById(userId);
    if (user.verificationCode==code) {
      user.everified = "verified"
      await user.save();
      return res.status(200).json({ message: 'Verified successfully' });
    }else{
      return res.status(404).json({ message: 'code is wrong' });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


// Deposit funds into the user's account
module.exports.depositFunds = async (req, res) => {
  try {
    console.log(req.user)
    const userId = req.user.userId
    const { amount, currency} = req.body;

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new deposit object
    const newDeposit = new Deposit({
      userId,
      amount,
      date: new Date(),
      currency
    });

    // Save the deposit information to the database
    await newDeposit.save();

    return res.status(201).json({ message: 'Deposit successful' });

  } catch (error) {
    console.error('Error during deposit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getDeposits = async (req, res) => {
  try {
    const userId = req.user.userId

    // Fetch all deposits from the database
    const deposits = await Deposit.find({userId});

    return res.status(200).json(deposits);
  } catch (error) {
    console.error('Error while fetching deposits:', error);
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
    const newDeposit = await User.findById(depositId);
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

module.exports.declineDeposit = async (req, res) => {
  try {
    const { userId, depositId } = req.body;

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newDeposit = await User.findById(depositId);
    newDeposit.status = "declined"

    await newDeposit.save();

    return res.status(201).json({ message: 'Deposit declined successful' });

  } catch (error) {
    console.error('Error during deposit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Withdraw funds from the user's account
module.exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, address, method, password, network } = req.body;
    const userId = req.user.userId

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(404).json({ message: 'Incorrect password' });
    }

    // Check if the user has sufficient balance for withdrawal
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal' });
    }

    // Create a new withdrawal object
    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      address,
      network,
      date: new Date(),
      method,
      status: 'pending', // Set the status to 'pending' initially
    });

    // Save the withdrawal information to the database
    await newWithdrawal.save();

    // Deduct the withdrawal amount from the user's account balance
    user.balance -= amount;
    await user.save();

    return res.status(201).json({ message: 'Withdrawal request successful' });
  } catch (error) {
    console.error('Error during withdrawal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getWithdrawals = async (req, res) => {
  try {
    // Fetch all withdrawals from the database
    const userId = req.user.userId
 
    // Fetch all deposits from the database
    const withdrawals = await Withdrawal.find({userId});

    return res.status(200).json(withdrawals);
  } catch (error) {
    console.error('Error while fetching withdrawals:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.uploadID = async (req, res) => {
  try {

    const { userId } = req.user;

    const frontImageUrl = req.files.frontImage[0].path; // Get the front image URL from the middleware
    let backImageUrl = null;

    if (req.files && req.files['backImage']) {
      // console.log(req.files.backImage)
      backImageUrl = req.files.backImage[0].path; // Get the back image URL
    }

    const user = await User.findById(userId); // Assuming you have req.user._id from authentication
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.kycVerification = {
      frontImageUrl,
      backImageUrl,
    };

    user.verified="submitted"
    await user.save();

    res.status(200).json({
      message: 'ID images uploaded successfully',
      frontImageUrl,
      backImageUrl,
    });
  } catch (error) {
    console.error('Error uploading:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
};
module.exports.updateVerifcation = async (req, res) => {
  try {
    const { userId, action } = req.body;

    const user = await User.findById(userId); // Assuming you have req.user._id from authentication
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.verified=action
    await user.save();

    res.status(200).json({
      message: 'Udated successfully',
    });
  } catch (error) {
    console.log(error);
    console.error('Error uploading:', error);
    res.status(500).json({ error: 'Failed to veridfy' });
  }
};
module.exports.createMessage = async (req, res) => {
  try {
    const { title, reason, message } = req.body;
    const { userId } = req.user;

    const newMessage = new Message({ title, reason, message, userId });
    await newMessage.save();

    res.status(201).json({ message: 'Message created successfully', data: newMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'An error occurred while creating the message' });
  }
};
module.exports.getUserDownlines = async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch the user profile from the database
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    const downlines = await User.find({ refferalEmail: userProfile.email });


    return res.status(200).json(downlines);
  } catch (error) {
    console.error('Error while fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// module.exports.updateWallet = async  (req, res) => {
//   const { wallet, coin, index} = req.body;
//   const { userId } = req.user;
// console.log(req.body)

//   try {
//     const userProfile = await User.findById(userId);
//     if (!userProfile) {
//       return res.status(404).send('User not found');
//     }

//     const existingWalletIndex = userProfile.wallets.findIndex(w => w.coin === coin);

//     if (existingWalletIndex !== -1) {
//       // Update existing wallet
//       userProfile.wallets[existingWalletIndex].wallet = wallet;
//       const validationError = userProfile.validateSync();
//       if (validationError) {
//         console.error('Validation Error:', validationError);
//         return res.status(400).send(validationError.message);
//       }
//       await userProfile.save();
//     } else {
//       // Add new wallet
//       userProfile.wallets.push({ wallet, coin, index });
//     }

//     await userProfile.save();
//     res.status(200).json(userProfile);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
  

// }
// module.exports.updateWallet = async (req, res) => {
//   const { wallet, coin, index } = req.body;
//   const { userId } = req.user;

//   try {
//     const userProfile = await User.findById(userId);
//     if (!userProfile) {
//       return res.status(404).send('User not found');
//     }

//     const existingWalletIndex = userProfile.wallets.findIndex(w => w.coin === coin);

//     if (existingWalletIndex !== -1) {
//       console.log("here oh")
//       // Update existing wallet
//       userProfile.wallets[existingWalletIndex].wallet = wallet;
//     } else {
//       // Add new wallet
//       userProfile.wallets.push({ wallet, coin, index });
//     }

//     const validationError = userProfile.validateSync();
//     if (validationError) {
//       console.error('Validation Error:', validationError);
//       return res.status(400).send(validationError.message);
//     }

//     await userProfile.save();
//     res.status(200).json(userProfile);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send(error.message);
//   }
// };


// module.exports.updateWallet = async (req, res) => {
//   const { wallet, coin, index } = req.body;
//   const { userId } = req.user;

//   console.log('Request Body:', req.body);
//   console.log('User ID:', userId);

//   try {
//     const userProfile = await User.findById(userId);
//     if (!userProfile) {
//       return res.status(404).send('User not found');
//     }

//     console.log('User Profile Before Update:', userProfile);

//     const existingWalletIndex = userProfile.wallets.findIndex(w => w.coin === coin);

//     // if (existingWalletIndex !== -1) {
//     //   // Update existing wallet
//     //   userProfile.wallets[existingWalletIndex].wallet = wallet;
//     //   await userProfile.save().
//     //   then((result) => {console.log("done saving")})
//     // console.log('User Profile After Update:', userProfile);
//     // }
//     if (existingWalletIndex !== -1) {
//       console.log(userProfile)
//       userProfile.wallets[existingWalletIndex].wallet = wallet;
    
//       // Explicitly mark modified (if needed)
//       userProfile.markModified('wallets'); 
    
//       try {
//         const savedProfile = await userProfile.save(); // Await the save operation
//         console.log("Profile saved successfully:", savedProfile); 
//       } catch (error) {
//         console.error("Error saving profile:", error);
//         res.status(500).send("Internal server error"); // Handle the error gracefully
//       }
//     } 
//     else {
//       // Add new wallet
//       userProfile.wallets.push({ wallet, coin, index });
//     }

//     const validationError = userProfile.validateSync();
//     if (validationError) {
//       console.error('Validation Error:', validationError);
//       return res.status(400).send(validationError.message);
//     }
//     await userProfile.save();
    

//     res.status(200).json(userProfile);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send(error.message);
//   }
// };

// module.exports.updateWallet = async (req, res) => {
//   const { wallet, coin, index } = req.body;
//   const { userId } = req.user;

//   try {
//     let userProfile = await User.findById(userId);  // Fetch the user profile
//     if (!userProfile) {
//       return res.status(404).send('User not found');
//     }

//     console.log('User Profile Before Update:', userProfile);

//     const existingWalletIndex = userProfile.wallets.findIndex(w => w.coin === coin);

//     if (existingWalletIndex !== -1) {
//       userProfile.wallets[existingWalletIndex].wallet = wallet;
//       userProfile.markModified('wallets');

//       try {
//         userProfile = await User.findById(userId);  // Fetch again to ensure no version conflict
//         const savedProfile = await userProfile.save();
//         console.log("Profile saved successfully:", savedProfile);
//         res.status(200).json(savedProfile);  // Respond after successful save
//         return;  // Ensure no further code is executed
//       } catch (error) {
//         console.error("Error saving profile:", error);
//         return res.status(500).send("Internal server error");  // Ensure response is sent only once
//       }
//     } else {
//       // Add new wallet
//       userProfile.wallets.push({ wallet, coin, index });
//     }

//     const validationError = userProfile.validateSync();
//     if (validationError) {
//       console.error('Validation Error:', validationError);
//       return res.status(400).send(validationError.message);
//     }

//     await userProfile.save();
//     res.status(200).json(userProfile);  // Respond with updated user profile
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send(error.message);
//   }
// };
// module.exports.updateWallet = async (req, res) => {
//   const { wallet, coin, index } = req.body;
//   const { userId } = req.user;

//   try {
//     // Fetch the user profile
//     const userProfile = await User.findById(userId);
//     if (!userProfile) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     console.log("User Profile Before Update:", userProfile);

//     // Check if the wallet already exists for the given coin
//     const existingWalletIndex = userProfile.wallets.findIndex(
//       (w) => w.coin === coin
//     );

//     if (existingWalletIndex !== -1) {
//       // Update the existing wallet
//       userProfile.wallets[existingWalletIndex].wallet = wallet;

//       // Ensure mongoose recognizes the change
//       userProfile.markModified("wallets");
//     } else {
//       // Add a new wallet
//       userProfile.wallets.push({ wallet, coin, index });
//     }

//     // Validate the updated profile
//     const validationError = userProfile.validateSync();
//     if (validationError) {
//       console.error("Validation Error:", validationError);
//       return res.status(400).json({ error: validationError.message });
//     }

//     // Save the updated user profile
//     const updatedProfile = await userProfile.save();
//     console.log("Profile updated successfully:", updatedProfile);

//     return res.status(200).json(updatedProfile);
//   } catch (error) {
//     // Log and handle unexpected errors
//     console.error("Error updating wallet:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

module.exports.updateWallet = async (req, res) => {
  const { wallet, coin, index } = req.body;
  const { userId } = req.user;

  try {
    // Construct the wallet object to be updated or added
    const newWallet = { wallet, coin, index };

    // Find the user and update their wallets
    const updatedProfile = await User.findOneAndUpdate(
      { _id: userId, "wallets.coin": coin }, // Match user and coin
      {
        $set: { "wallets.$.wallet": wallet }, // Update existing wallet
        $setOnInsert: { "wallets.$.index": index }, // Optional: Set index only on insertion
      },
      {
        new: true, // Return the updated document
        upsert: true, // Insert a new wallet if the coin doesn't exist
      }
    );

    // Handle cases where the wallet was not found and inserted
    if (!updatedProfile) {
      // Add the wallet if not matched and upsert was performed
      const addedWalletProfile = await User.findByIdAndUpdate(
        userId,
        { $push: { wallets: newWallet } },
        { new: true }
      );
      return res.status(200).json(addedWalletProfile);
    }

    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating wallet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId; // Assuming you have authentication middleware in place

    // 1. Validation:
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // 2. Find User and Verify Old Password:
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    
    if (oldPassword !== user.password) {
      return res.status(401).json({ error: 'Incorrect old password.' });
    }

    // 3. Hash New Password and Update:
    // const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10
    user.password = newPassword;
    await user.save();

    // 4. Response:
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'An error occurred while updating the password.' });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch the user profile from the database
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Remove sensitive information before sending the response (optional)
    const { password, ...profileData } = userProfile.toObject();

    return res.status(200).json(profileData);
  } catch (error) {
    console.error('Error while fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the user profile from the database
    const userProfile = await User.findById(id);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    const message = await Message.find({userId: userProfile._id})

    return res.status(200).json({userProfile, message});
  } catch (error) {
    console.error('Error while fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId
    const { firstName, lastName, email, gender, region, country, city, zip, address2, address1, phone } = req.body;

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(req.file)
    console.log(req.files)
    if (req.file) {
      user.avatar = req.file.path; // Assuming path is stored in database
    }

    // Update the user's name and email
    user.firstName = firstName 
    user.lastName = lastName
    user.phone=phone
    user.address1 = address1
    user.address2 = address2
    user.zip=zip
    user.city=city
    user.country=country
    user.region=region
    user.gender=gender
    await user.save();

    return res.status(200).json({ message: 'User information updated successfully', user });
  } catch (error) {
    console.error('Error during user information update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





// Function to create a new investment
// exports.createInvestment = async (req, res) => {
//   try {
//     const userId = req.user.userId
//     const { amount, plan } = req.body;
    
//     // Check if the user exists and retrieve their balance
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }
//     const userBalance = user.balance;
    
//     // Check if the user's balance is sufficient for the investment
//     if (userBalance < amount) {
//       return res.status(400).json({ error: 'Insufficient balance.' });
//     }
    
//     // Deduct the investment amount from the user's balance
//     const updatedBalance = userBalance - amount;
//     user.balance = updatedBalance;
//     await user.save();
    
//     // Create the new investment
//     const newInvestment = new Investment({
//       userId,
//       amount,
//       plan,
//     });
//     const savedInvestment = await newInvestment.save();
//     res.status(201).json(savedInvestment);
//   } catch (error) {
//     res.status(500).json({ error: 'Could not create the investment.' });
//   }
// };


module.exports.createInvestment = async (req, res) => {
  try {
    const userId = req.user.userId
    const { amount, plan, asset, duration } = req.body;
    
    // Check if the user exists and retrieve their balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userBalance = user.balance;
    
    // Check if the investment amount is above the minimum required for the selected plan
    // let minimumAmount;
    // switch (plan) {
    //   case 'BASIC':
    //     minimumAmount = 500;
    //     break;
    //   case 'LITE':
    //     minimumAmount = 1000;
    //     break;
    //   case 'CLASSIC':
    //     minimumAmount = 2500;
    //     break;
    //   case 'SUITE':
    //     minimumAmount = 10000;
    //     break;
    //   case 'DELUXE':
    //     minimumAmount = 50000;
    //     break;
    //   default:
    //     return res.status(400).json({ message: 'Invalid plan selected.' });
    // }
    
    // if (amount < minimumAmount) {
    //   return res.status(400).json({ message: `Amount must be above ${minimumAmount} for plan ${plan}.` });
    // }
    
    // Check if the user's balance is sufficient for the investment
    if (userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Check if the user already has an active investment for the selected plan
    const existingInvestment = await Investment.findOne({ userId, plan });
    if (existingInvestment) {
      return res.status(400).json({ message: `You already have an active investment for ${plan}.` });
    }
    
    // Deduct the investment amount from the user's balance
    const updatedBalance = userBalance - amount;
    user.balance = updatedBalance;
    await user.save();
    
    // Create the new investment
    const newInvestment = new Investment({
      userId,
      amount,
      plan,
      asset,
      duration
    });
    
    const savedInvestment = await newInvestment.save();

    res.status(201).json({savedInvestment, message:"Investment activated successfully"});
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Could not create the investment.' });
  }
};

module.exports.getInvestmentByUserId = async (req, res) => {
  try {
    const userId = req.user.userId
    const investment = await Investment.find({userId});
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found.' });
    }
    res.status(200).json(investment);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Could not retrieve the investment.' });
  }
};

// Function to get all investments
module.exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find();
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve investments.' });
  }
};

// Function to get a specific investment by ID
// module.exports.getInvestmentById = async (req, res) => {
//   try {
//     const investmentId = req.params.id;
//     const investment = await Investment.findById(investmentId);
//     if (!investment) {
//       return res.status(404).json({ message: 'Investment not found.' });
//     }
//     res.status(200).json(investment);
//   } catch (error) {
//     res.status(500).json({ error: 'Could not retrieve the investment.' });
//   }
// };
module.exports.getInvestmentById = async (req, res) => {
  try {
    const investmentId = req.params.id;

    // Find the investment
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found.' });
    }

    // Find the user who owns this investment
    const user = await User.findById(investment.userId); // assuming your investment model stores userId
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return both investment and balance history
    return res.status(200).json({
      investment,
      balanceHistory: user.balanceHistory || [],
    });
  } catch (error) {
    console.error('Error retrieving investment:', error);
    return res.status(500).json({ error: 'Could not retrieve the investment.' });
  }
};

// Function to update the user's profit
// module.exports.updateUserProfit = async (req, res) => {
//   try {
//     const users = await User.find();
    
//     users.forEach(async (user) => {
//       // Calculate 2.5% of the user's balance
//       const profitToAdd = user.balance * 0.025;
      
//       // Update the user's profit by adding the calculated value
//       user.profit += profitToAdd;
      
//       // Save the updated user data
//       await user.save();
//     });
//     return
//     // res.status(200).json({ message: 'User profits updated successfully.' });
//   } catch (error) {
//     return
//     // res.status(500).json({ error: 'Could not update user profits.' });
//   }
// };

module.exports.getTotalInvestedAmount = async (req, res) => {
  try {
    const userId = req.user.userId
    // Find all investments of the specific user
    const investments = await Investment.find({ userId });

    // Calculate the total invested amount by summing the amounts of all investments
    let totalInvestedAmount = 0;
    investments.forEach((investment) => {
      totalInvestedAmount += investment.amount;
    });

    res.status(200).json({ totalInvestedAmount });
  } catch (error) {
    res.status(500).json({ error: 'Could not calculate total invested amount.' });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.userId

    // Find all withdrawals and deposits of the specific user
    const withdrawals = await Withdrawal.find({ userId });
    const deposits = await Deposit.find({ userId });

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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ transactionHistory, totalDeposit, totalWithdrawal, balance:user.balance });
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve transaction history.' });
  }
};


module.exports.replyToMessage = async (req, res) => {
  console.log("here")
  const { messageId } = req.params;
  const { message } = req.body;
  const userId = req.user.userId // Assuming req.user is set by authentication middleware
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const messageDoc = await Message.findById(messageId);
    if (!messageDoc) {
      return res.status(404).json({ message: 'Message not found' });
    }

    messageDoc.replies.push({ message, userId, from:"You" });
    await messageDoc.save();

    return res.status(200).json({ message: 'Reply added successfully', messageDoc });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error replying to message', error });
  }
};

module.exports.getAllMessagesForUser = async (req, res) => {
  const userId = req.user.userId // Assuming req.user is set by authentication middleware

  try {
      const messages = await Message.find({ userId: userId });
      return res.status(200).json({ messages });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching messages', error });
  }
};


module.exports.approveUserEmail = async (req, res) =>{
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.everified = "verified";
    await user.save();

    return res.status(200).json({ message: 'Email verification successful', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error verifying email', error });
  }
}

module.exports.approveUserWithdrawal = async (req, res) =>{
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.withdrawStatus = !user.withdrawStatus;
    await user.save();

    return res.status(200).json({ message: 'Withdrawal updated  successful', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error', error });
  }
  
}