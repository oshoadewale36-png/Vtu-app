require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const  axios = require("axios");
const walletRoutes = require("./routes/wallet");
const airtimeRoutes = require("./routes/airtime");

const User = require("./models/user");
const Wallet = require("./models/Wallet");
const Transaction = require("./models/Transaction");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/wallet", walletRoutes);
app.use("/airtime", airtimeRoutes);

app.get("/", (req, res) => {
    res.send("API is working");
});
const PAYSTACK_SECRET_KEY ="sk_test_acc29197b628316c44b819132e2698083cdfb884";


mongoose.connect ("mongodb://oshoadewale36_db_user:vtu12345@ac-worgcju-shard-00-00.wqte5yd.mongodb.net:27017,ac-worgcju-shard-00-01.wqte5yd.mongodb.net:27017,ac-worgcju-shard-00-02.wqte5yd.mongodb.net:27017/?ssl=true&replicaSet=atlas-et1fki-shard-0&authSource=admin&appName=Cluster0",)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

function auth(req, res, next) {
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.json({
             message: "No token provided" 
            });
        }
        try {  

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        req.userId = decoded.id;

        next();

    } catch (error) {

        res.json({
             message: "Invalid token" 
            });
    }
}

app.get("/", (req, res) => {
    res.send("Easy Access VTU Backend is Running");
});

app.post("/register", async (req, res) => {

    try {
        const { username, password } = req.body;

        const existingUser = 
        await User.findOne({ username });

        if (existingUser) {
            return res.json({
                 message: "User already exists" 
                });
        }

        const hashedPassword = 
        await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.json({
            message: " Registered successful",
        });

    } catch (error) {
        res.json({
         error: error.message
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = 
        await User.findOne({ username });

        if (!user) {
            return res.json({
             message: "User not found"
             });
        }

        const isMatch =
         await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
             message: "Wrong password" 
            });
        }

        const token = jwt.sign(
                    { 
                        id: user._id,
                        username: user.username
                    },
                     process.env.JWT_SECRET || "your_secret_key"
                    );

        res.json({
            message: "Login successful",
            token
        });
    } catch (error) {
        res.json({
         error: error.message 
        });
    }
});

app.post("/create-wallet",auth, async (req, res) => {
   
    try {
           
        const existingWallet =
         await Wallet.findOne({
             userId: req.userId
         });

        if (existingWallet) {
            return res.json({
                 message: "Wallet already exists"
           });
        }

        const wallet = new Wallet({
            userId: req.userId,
            balance: 0
        });

        await wallet.save();

        res.json({
             message: "Wallet created",
              wallet 
            });
    } catch (error) {
        res.json({ 
        error: error.message 
    });
    }
});

app.post("/fund-wallet",auth, async (req, res) => {
   try {

    const { amount } = req.body;

    const wallet = 
    await Wallet.findOne({
         userId: req.userId
     });

    if (!wallet) {
        return res.json({
             message: "Wallet not found" 
        });
    }

        wallet.balance += Number(amount);

        await wallet.save();

        await Transaction.create({
            userId: req.user.id,
            type: "fund",
            amount
        });
        res.json({
             message: "Wallet funded successfully"
              
            });
   }catch (error) {
        res.json({ 
            error: error.message 
        });
    }
});

app.post("/buy-airtime", auth, async (req, res) => {

    const { network, phone, amount } = req.body;

    try {
        const wallet =
        await Wallet.findOne({
             userId: req.userId
         });
        if (!wallet || wallet.balance < amount) {
            return res.json({
            message: "Insufficient balance" 
         });
     }

        const response = await axios.post(
            "https://api.vtpass.com/airtime/buy",
            {
                request_id: Date.now(),
                serviceID: network,
                amount: amount,
                phone: phone
            },
            {
                headers: {
                    "Authorization": "Bearer b08280a68dc7dede275d7e66ba76308ac4ce43733ee865a13e1b776af174ee1b"
                }
            }
        );
        if (response.data.code === "000") {
   
            wallet.balance -= amount;
            await wallet.save();

            await Transaction.create({
                userId: req.userId,
                type: "airtime",
                network,
                phone,
                amount
            });
            return res.json({
                message: "Airtime sent successfully"
            })
           return res.json({
                message: "Failed to send airtime"
            });
        }
    } catch (error) {
        res.json({message: "API error: " + error.message});
    }
});



app.post("/buy-data", auth, async (req, res) => {

    const { phone, network, plan, amount } = req.body;

    try {
        const wallet =
        await Wallet.findOne({
             userId: req.userId
         });

        if (!wallet || wallet.balance < amount) {
            return res.json({
            message: "Insufficient balance" 
         });
        }

        const response = await axios.post(
            "https://api.vtpass.com/data/buy",
            {
                request_id: Date.now(),
                serviceID: network,
                billerscode: phone,
                variation_code: plan,
                amount: amount
            },
            {
                headers: {
                    "Authorization": "Bearer b08280a68dc7dede275d7e66ba76308ac4ce43733ee865a13e1b776af174ee1b"
                }
            }
        );
        if (response.data.code === "000") {
   
            wallet.balance -= amount;
            await wallet.save();

            await Transaction.create({
                userId: req.userId,
                type: "data",
                phone,
                network,
                plan,
                amount
            });
            return res.json({
                 message: "Data purchased successfully" });

        } else {
            return res.json({
                message: "Data purchase failed"
            });
        }
    } catch (error) {
        res.json({
            message: "API error: " + error.message
        });
    }
});

  
app.get("/transactions", auth, async (req, res) => {
    try {
        const transactions =
         await Transaction.find({
            userId: req.userId
         }).sort({ date: -1 });

        res.json( transactions);
    } catch (error) {
        res.json({ 
            error: error.message 
        }); 
    }
});

app.get("/balance", auth, async (req, res) => {
    try {
        const wallet = 
        await Wallet.findOne({
             userId: req.user.Id
         });
        if (!wallet) {
            return res.json({
                "balance": 0
            });
        }
        res.json({
            balance: wallet.balance
        });
    } catch (error) {
        res.json({ 
            error: error.message 
        }); 
    }
});

app.get("/", (req, res) => {
    res.send("VTU Backend is Running successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { 
    console.log("Server running on " + PORT);
});