const NFT = require("../models/NFT");

exports.getAllNFTs = async (req, res) => {
  const nfts = await NFT.find({
    isListed: true,
    isPaused: false,
  });

  res.json(nfts);
};

exports.getSingleNFT = async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id).populate("owner", "name");
    res.json(nft);
  } catch (error) {
    res.status(404).json({ message: "NFT not found" });
    console.log("Error fetching NFT:", error);
  }
};

exports.getOwnedNFTs = async (req, res) => {
  const nfts = await NFT.find({
    owner: req.user.id,
  });

  res.json(nfts);
};

exports.resellNFT = async (req, res) => {
  const nft = req.nft;

  nft.price = req.body.price;
  nft.status = "available";
  nft.isListed = true;

  await nft.save();

  res.json(nft);
};

exports.createNFT = async (req, res) => {
  console.log("Received request body:", req.body);
  const upload = req.file

  const nft = await NFT.create({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    imageUrl: upload.path,
    cloudinaryId: upload.filename,
    owner: req.body.owner,
    // createdByAdmin: req.user.id,
  });

  res.json(nft);
};

exports.deleteNFT = async (req, res) => {
  const nft = await NFT.findByIdAndDelete(req.params.id);
  res.json({ message: "NFT deleted successfully" });
};

exports.updateNft = async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }

    // Update fields
    nft.title = req.body.title || nft.title;
    nft.description = req.body.description || nft.description;
    nft.price = req.body.price || nft.price;

    await nft.save();

    res.json(nft);
  } catch (error) {
    res.status(500).json({ message: "Error updating NFT", error });
    console.log("Error updating NFT:", error);
  }
};

exports.purchaseNFT = async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }

    if (!nft.isListed || nft.isPaused) {
      return res.status(400).json({ message: "NFT is not available for purchase" });
    }

    // Update ownership and status
    nft.owner = req.body.walletAddress; // Assuming walletAddress is sent in the request body
    nft.isListed = false;
    nft.isPaused = true;

    await nft.save();

    res.json({ message: "NFT purchased successfully", nft });
  } catch (error) {
    res.status(500).json({ message: "Error purchasing NFT", error });
    console.log("Error purchasing NFT:", error);
  }
};