const express = require("express")
const { registerUser, loginUser, depositFunds, approveUserEmail, verifyUser, getDeposits, withdrawFunds, getWithdrawals, getUserProfile, updateUserInfo, createInvestment, getInvestmentByUserId, getTransactionHistory, getUserProfileById, uploadID, createMessage, getUserDownlines, resetPassword, addWallet, updateWallet, sendVerificationCode, replyToMessage, getAllMessagesForUser, approveUserWithdrawal, getInvestmentById, resetPasswordCode, verifyAndGeneratePassword } = require("../controllers/userController")
const { requireSignin, parser, parser1 } = require("../middlewares")
const routes = express.Router()

routes.post("/register",registerUser)
routes.post("/login",loginUser)
routes.post("/reset-password", resetPasswordCode)
routes.post("/verify-reset-code", verifyAndGeneratePassword)
routes.post("/deposit", requireSignin, depositFunds)
routes.get("/deposits",requireSignin, getDeposits)
routes.post("/withdraw",requireSignin, withdrawFunds)
routes.get("/withdrawals",requireSignin, getWithdrawals)
routes.get("/profile",requireSignin, getUserProfile)
routes.get("/profile/:id",requireSignin, getUserProfileById)
routes.post("/update", requireSignin,updateUserInfo)
routes.post("/purchase", requireSignin, createInvestment)
routes.get("/user-investments", requireSignin, getInvestmentByUserId)

routes.post("/approve-user-email", requireSignin, approveUserEmail)


routes.post("/verify-submit", requireSignin,parser,uploadID)

routes.post("/message-submit", requireSignin,createMessage)
routes.post("/messages/:messageId/reply", requireSignin,replyToMessage)
routes.get("/messages",requireSignin,getAllMessagesForUser)

routes.get("/downlines", requireSignin, getUserDownlines)

routes.get("/transactions",requireSignin,getTransactionHistory)
routes.post("/password/new",requireSignin,resetPassword)
routes.patch("/profile/update",requireSignin,parser1,updateUserInfo)
routes.post("/update-wallet",requireSignin,updateWallet)
routes.post("/everify",requireSignin,sendVerificationCode)
routes.post("/verify",requireSignin,verifyUser)
routes.get('/investment/:id', requireSignin, getInvestmentById)
// routes.get("/refferalData2",refferalData2)
// routes.patch("/profile/update/bank",requireSignin,updateBankDetails)
// routes.patch("/profile/update/socials",requireSignin,updateSocialDetails)
// routes.get("/profile/byID/:id",getProfileById)
// routes.patch("/profile/image",requireSignin,parser,uploadProfilePicture)

module.exports=routes