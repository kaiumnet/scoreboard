const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o87uijz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const salesCollection = client.db('saleDB').collection('sales');

    
    app.get('/sales', async (req, res) => {
      const result = await salesCollection.find().toArray();
      res.send(result);
    });

    
    app.post('/sales', async (req, res) => {
      const newSale = req.body;
      const result = await salesCollection.insertOne(newSale);
      res.send(result);
    });

    
    app.delete('/sales/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await salesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          res.json({ success: true });
        } else {
          res.status(404).json({ success: false, message: 'Sale not found' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    });

    
    app.post('/api/login', (req, res) => {
      const { password } = req.body;

      if (password === process.env.ADMIN_PASSWORD) {
        return res.json({ success: true, role: 'admin' });
      }

      if (password === process.env.USER_PASSWORD) {
        return res.json({ success: true, role: 'user' });
      }

      return res.status(401).json({ success: false, message: 'Invalid password' });
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
    
    
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Scoreboard is superb!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
