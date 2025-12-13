require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001

app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'https://life-planner-rpg.netlify.app'
        ],
        credentials: true
    })
);

// Parsing Middleware 
app.use(express.json())

// MongoDB setup
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error:", error));


// Import Models
const User = require("./models/User");
const Quest = require("./models/Quest")

// Premade Quests
const {PREMADE_QUESTS} = require('./premadeQuests')

// Middleware and Other Functions
const generateToken = (id) => { // generates JWT
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Middleware protecting routes 
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // attaches userID to request object, excludes password field
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Root Route
app.get("/", (req, res) => {
    res.json({
        message: "RPG Life Planner API",
        status: "Running",
        endpoints: {
            register: "/api/auth/register",
            login: "/api/auth/login",
            quests: "/api/quests",
        },
    });
});

// Authentication Routes

// Temporary Debugging Route - Put this where your current login route is
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "API routes are reachable!" });
});

// POST /api/auth/register -- creates new user
app.post('/api/auth/register', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username, 
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user.id, 
            usernmae: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({message: 'Invalid user data'});
    }
});

// POST /api/auth/login -- authetnitcates the user and gives out jwt token
app.post('/api/auth/login', async(req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username});

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            xp: user.xp,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// GET /api/quests -- gets all active quests for user and generates premade ones
app.get('/api/quests', protect, async (req, res) => {
    const day = req.query.day ? parseInt(req.query.day) : 1;
    const userId = req.user.id;

    try {
        // checks if premade quests were already generated, looks for any that are not 'CUSTOM'
        const existingPremade = await Quest.findOne({ 
            userID: userId, 
            day: day, 
            questType: { $ne: 'CUSTOM' } 
        });

        // if there were none, generates quests for the day
        if (!existingPremade && PREMADE_QUESTS[day]) {
            const questsToInsert = PREMADE_QUESTS[day].map(q => ({
                userID: userId,
                name: q.name,
                day: day,
                questType: q.questType,
                isCompleted: false
            }));
            
            const result = await Quest.insertMany(questsToInsert);
        }

        // Gets all quests for the specific day and any not completed quests
        const quests = await Quest.find({ 
            userID: userId, 
            isCompleted: false, 
            day: { $lte: day } 
        }).sort({ questType: -1, createdAt: 1 });
        res.status(200).json(quests);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching quests' });
    }
});

// POST /api/quests/custom -- creates new quests
app.post('/api/quests/custom', protect, async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({message: 'Add a quest name!'});
    }

    try {
        const newQuest = await Quest.create({
            name: req.body.name,
            userID: req.user.id, 
        });
        res.status(201).json(newQuest);
    } catch (error) {
        res.status(500).json({message: 'Server error creating new quest'});
    }
});

// PATCH /api/quests/:id/complete -- updates quest's complete status
app.patch('/api/quests/:id/complete', protect, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // makes sure it's right user's quest
    if (quest.userID.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to complete this quest' });
    }

    // marks quest completed and gives xp
    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      { isCompleted: true, completionDate: Date.now() },
      { new: true }
    );
    await User.findByIdAndUpdate(req.user.id, {$inc: {xp: 10}});

    res.status(200).json(updatedQuest);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating quest' });
  }
});

// POST /api/quests/reset-day -- resets status of MAIN and DAILY quests only and sets xp to 0
app.post('/api/quests/reset-day', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { xp: 0 });
        await Quest.updateMany(
            {
                userID: req.user.id,
                questType: { $in: ['MAIN', 'DAILY'] } // targets only these two types
            },
            {
                isCompleted: false, 
                completionDate: null 
            }
        );

        // 3. Return a success message
        res.status(200).json({ message: 'Day reset successful. Quests are reactivated.' });
    } catch (error) {
        console.error("Error during quest reset:", error);
        res.status(500).json({ message: 'Server error during day reset.' });
    }
});

// GET /api/auth/me -- get's current user info
app.get('/api/auth/me', protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

// GET /api/progress -- gets number of total quests and number of completed quests
app.get('/api/progress', protect, async (req, res) => {
    const totalQuests = await Quest.countDocuments({userID: req.user.id});
    const completedQuests = await Quest.countDocuments({userID: req.user.id, isCompleted: true});
    res.status(200).json({totalQuests, completedQuests});
});



// Starting the server!
app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});