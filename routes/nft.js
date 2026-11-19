const express = require("express")

const { createNFT, getAllNFTs, deleteNFT, getSingleNFT, getOwnedNFTs, resellNFT, updateNft, purchaseNFT } = require("../controllers/nft.controller")
const { parser2 } = require("../middlewares")
const routes = express.Router()

routes.post("/create", parser2,createNFT)
routes.get("/all", parser2, getAllNFTs)
routes.delete("/:id", parser2, deleteNFT)
routes.get("/:id", parser2, getSingleNFT)
routes.put("/:id", parser2, updateNft)
routes.get("/owned", parser2, getOwnedNFTs)
routes.put("/resell/:id", parser2, resellNFT)
routes.post("/purchase/:id", purchaseNFT)

module.exports=routes