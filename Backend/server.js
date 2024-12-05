// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ExcelJS = require('exceljs');
const { FR_orders, CG_orders, CR_orders, SG_orders, SR_orders, STB_orders, Master_orders} = require('./models/orderSchema');
require('dotenv').config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


const uri = process.env.MONGODB_URI;




// Mongoose connection
mongoose.connect(uri)
.then(() => console.log('DB Connected!!!!!!! (Server.js)'))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Exit the process if the database connection fails
});




/////////////////////////////////////// MASTER//////////////////////////////////////////////

//Download
app.get('/download-master-orders', async (req, res) => {
    try {
        const orders = await Master_orders.find(); // Fetch all orders from master collection
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Master Orders');

        // Define columns based on MasterSchema
        worksheet.columns = [
            { header: 'Order ID', key: 'orderID' },
            { header: 'Product Name', key: 'productName' },
            { header: 'Fabric', key: 'fabric' },
            { header: 'EMB', key: 'EMB' },
            { header: 'ORF Date', key: 'ORF_Date' },
            { header: 'Master Name', key: 'masterName' },
            { header: 'CG Date', key: 'CG_Date' },
            { header: 'CR Date', key: 'CR_Date' },
            { header: 'Karigar Name', key: 'karigarName' },
            { header: 'SG Date', key: 'SG_Date' },
            { header: 'SR Date', key: 'SR_Date' },
            { header: 'Branch', key: 'branch' },
            { header: 'Gate Pass No', key: 'gatePassNo' },
            { header: 'STB Date', key: 'STB_Date' }
        ];

        // Add rows to worksheet with formatted dates
        orders.forEach(order => {
            const formattedOrder = {
                ...order.toObject(), // Convert Mongoose document to plain object
                ORF_Date: order.ORF_Date ? formatDate(order.ORF_Date) : '',
                CG_Date: order.CG_Date ? formatDate(order.CG_Date) : '',
                CR_Date: order.CR_Date ? formatDate(order.CR_Date) : '',
                SG_Date: order.SG_Date ? formatDate(order.SG_Date) : '',
                SR_Date: order.SR_Date ? formatDate(order.SR_Date) : '',
                STB_Date: order.STB_Date ? formatDate(order.STB_Date) : ''
            };
            worksheet.addRow(formattedOrder);
        });

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=master_orders.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error downloading master orders:', error);
        res.status(500).send('Server error');
    }
});

// Function to format date to DD/MM/YYYY
const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};





// Endpoint to add a new order to the master collection
app.post('/ADD_MASTER_ORDER', async (req, res) => {
    const orderData = req.body;

    try {
        // Create a new entry in the master collection
        const newMasterOrder = new Master_orders(orderData);
        await newMasterOrder.save();

        res.status(201).json({ message: 'Master order added successfully', orderID: newMasterOrder.orderID });
    } catch (error) {
        console.error('Error adding master order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




///////////////////////////////////////////////////////////initial get/////////////////////////
// GET endpoints for each column
app.get('/GET_ORF', async (req, res) => {
    try {
        const orders = await FR_orders.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/GET_CG', async (req, res) => {
    try {
        const orders = await CG_orders.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/GET_CR', async (req, res) => {
    try {
        console.log("Inside Initial fetch CR")
 
        const orders = await CR_orders.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/GET_SG', async (req, res) => {
    try {
        console.log("Inside Initial fetch SG")
        const orders = await SG_orders.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/GET_SR', async (req, res) => {
    try {
        const orders = await SR_orders.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/GET_STB', async (req, res) => {
    try {
        const orders = await STB_orders.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});




///////////////////////////////////////////////////      COL 0    ///////////////////////////////////////////////

// POST endpoint to add a new order
app.post('/', async (req, res) => {
    console.log("Server HIT! from / post")
    const { orderID, productName, fabric, EMB } = req.body;
    console.log( orderID, productName, fabric, EMB );
  
    try {
      // Create a new order with the current timestamp
      const newOrder = new FR_orders({
        orderID,
        productName,
        fabric,
        EMB,
        ORF_Date: new Date(),  // Set createdAt to current timestamp
      });
      
      await newOrder.save();
      res.status(201).json({ message: 'Order added successfully', order: newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error adding order (server)', error: error.message });
    }
  });






///////////////////////////////////////////////////      COL 1 (ORF)    ///////////////////////////////////////////////

// GET 
app.get('/GET_ORF/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await FR_orders.findOne({ orderID: orderId });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order); // Send back the found order
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});



 
  // DELETE 
app.delete('/DELETE_ORF', async (req, res) => {
    console.log('Inside deleteORF');
    const { orderID } = req.body; // Capture the orderID from the request body
    
    try {
        console.log(orderID);
        const result = await FR_orders.deleteOne({ orderID: orderID });
        console.log(result,'RESULTT');
        
        if (result.deletedCount === 1) {
            console.log('inside success!'); // Log the result from MongoDB
            return res.status(204).send(); // No content response if deleted successfully
        } else {
            return res.status(404).json({ message: 'Order not found' }); // Not found response
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});




//POST
app.post('/POST_CG', async (req, res) => {
    const { orderID, productName, fabric, EMB, ORF_Date, masterName } = req.body;
    console.log( orderID, productName, fabric, EMB, ORF_Date, masterName );
    
    try {
        console.log("Server HIT from /postCG!")
      // Create a new order with the current timestamp
      const newOrder = new CG_orders({
        orderID,
        productName,
        fabric,
        EMB,
        ORF_Date,
        masterName,
        CG_Date: new Date(),  // Set createdAt to current timestamp
      });

      
      
      await newOrder.save();
      res.status(201).json({ message: 'Order Moved to CG successfully', order: newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error Moving to CG  (server)', error: error.message });
    }
});


///////////////////////////////////////////////////      COL 2  ///////////////////////////////////////////////
// GET 
app.get('/GET_CG/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await CG_orders.findOne({ orderID: orderId });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order); // Send back the found order
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});



// DELETE 
app.delete('/DELETE_CG', async (req, res) => {
    console.log('Inside deleteCG');
    const { orderID } = req.body; // Capture the orderID from the request body
    
    try {
        console.log(orderID);
        const result = await CG_orders.deleteOne({ orderID: orderID });
        console.log(result,'RESULTT');
        
        if (result.deletedCount === 1) {
            console.log('inside success!'); // Log the result from MongoDB
            return res.status(204).send(); // No content response if deleted successfully
        } else {
            return res.status(404).json({ message: 'Order not found' }); // Not found response
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});




//POST
app.post('/POST_CR', async (req, res) => {
    const { orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date } = req.body;
    console.log("This is post CR recieving data:")
    console.log( orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date );
    
    try {
        console.log("Server HIT from /postCRRR!")
      // Create a new order with the current timestamp
      const newOrder = new CR_orders({
        orderID,
        productName,
        fabric,
        EMB,
        ORF_Date,
        masterName,
        CG_Date,
        CR_Date:new Date(),
      });

      
      
      await newOrder.save();
      res.status(201).json({ message: 'Order Moved to CR successfully', order: newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error Moving to CR  (server)', error: error.message });
    }
});





///////////////////////////////////////////////////      COL 3    ///////////////////////////////////////////////


// GET 
app.get('/GET_CR/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await CR_orders.findOne({ orderID: orderId });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order); // Send back the found order
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});



// DELETE 
app.delete('/DELETE_CR', async (req, res) => {
    console.log('Inside deleteCR');
    const { orderID } = req.body; // Capture the orderID from the request body
    
    try {
        console.log(orderID);
        const result = await CR_orders.deleteOne({ orderID: orderID });
        console.log(result,'RESULTT');
        
        if (result.deletedCount === 1) {
            console.log('inside success!'); // Log the result from MongoDB
            return res.status(204).send(); // No content response if deleted successfully
        } else {
            return res.status(404).json({ message: 'Order not found' }); // Not found response
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});




//POST
app.post('/POST_SG', async (req, res) => {
    const { orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date,CR_Date, karigarName } = req.body;
    console.log("this is what postSG is recieving at the enterance of api: ")
    console.log( orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date,CR_Date, karigarName );
    
    try {
        console.log("Server HIT from /postSG!")
      // Create a new order with the current timestamp
      const newOrder = new SG_orders({
        orderID,
        productName,
        fabric,
        EMB,
        ORF_Date,
        masterName,
        CG_Date,
        CR_Date,
        karigarName,
        SG_Date: new Date()

      });

      
      
      await newOrder.save();
      res.status(201).json({ message: 'Order Moved to CR successfully', order: newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error Moving to CR  (server)', error: error.message });
    }
});
///////////////////////////////////////////////////      COL 4     ///////////////////////////////////////////////

// GET 
app.get('/GET_SG/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await SG_orders.findOne({ orderID: orderId });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order); // Send back the found order
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});



// DELETE 
app.delete('/DELETE_SG', async (req, res) => {
    console.log('Inside deleteSG');
    const { orderID } = req.body; // Capture the orderID from the request body
    
    try {
        console.log(orderID);
        const result = await SG_orders.deleteOne({ orderID: orderID });
        console.log(result,'RESULTT');
        
        if (result.deletedCount === 1) {
            console.log('inside success!'); // Log the result from MongoDB
            return res.status(204).send(); // No content response if deleted successfully
        } else {
            return res.status(404).json({ message: 'Order not found' }); // Not found response
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});




//POST
app.post('/POST_SR', async (req, res) => {
    const { orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date,CR_Date, karigarName,SG_Date } = req.body;
    console.log( "POST DATA of SR",orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date,CR_Date, karigarName,SG_Date, );
    
    
    try {
       
        console.log("Server HIT from /postSR!")
      // Create a new order with the current timestamp
      const newOrder = new SR_orders({
        orderID,
        productName,
        fabric,
        EMB,
        ORF_Date,
        masterName,
        CG_Date,
        CR_Date,
        karigarName,
        SG_Date,
        SR_Date:new Date(),
    

      });
console.log("ORDER ADDED TO SR:", newOrder)
      
      
      await newOrder.save();
      res.status(201).json({ message: 'Order Moved to CR successfully', order: newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error Moving to CR  (server)', error: error.message });
    }
});
///////////////////////////////////////////////////      COL 5     ///////////////////////////////////////////////

// GET 
app.get('/GET_SR/:id', async (req, res) => {
    const orderId = req.params.id;
console.log("FROM GET SR!", orderId)
    try {
        const order = await SR_orders.findOne({ orderID: orderId });


        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order); // Send back the found order
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});



// DELETE 
app.delete('/DELETE_SR', async (req, res) => {
    console.log('Inside deleteSR');
    const { orderID } = req.body; // Capture the orderID from the request body
    
    try {
        console.log(orderID);
        const result = await SR_orders.deleteOne({ orderID: orderID });
        console.log(result,'RESULTT');
        
        if (result.deletedCount === 1) {
            console.log('inside success!'); // Log the result from MongoDB
            return res.status(204).send(); // No content response if deleted successfully
        } else {
            return res.status(404).json({ message: 'Order not found' }); // Not found response
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});




//POST
app.post('/POST_STB', async (req, res) => {
    const { orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date,CR_Date, karigarName,SG_Date,SR_Date,branch,gatePassNo } = req.body;
    console.log( orderID, productName, fabric, EMB, ORF_Date, masterName,CG_Date,CR_Date, karigarName,SG_Date,SR_Date,branch,gatePassNo );
    
    
    try {
        console.log("Server HIT from /postSTB!")
      // Create a new order with the current timestamp
      const newOrder = new STB_orders({
        orderID,
        productName,
        fabric,
        EMB,
        ORF_Date,
        masterName,
        CG_Date,
        CR_Date,
        karigarName,
        SG_Date,
        SR_Date,
        branch,
        gatePassNo,
        STB_Date: new Date()

      });

      
      
      await newOrder.save();
      res.status(201).json({ message: 'Order Moved to CR successfully', order: newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error Moving to CR  (server)', error: error.message });
    }
});



///////////////////////////////////////////////////      COL 6   ///////////////////////////////////////////////

// GET 
app.get('/GET_STB/:id', async (req, res) => {
    const orderId = req.params.id;
console.log("FROM GET STB!", orderId)
    try {
        const order = await STB_orders.findOne({ orderID: orderId });
console.log("FROM GET STB, result fetched: ", order)


        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order); // Send back the found order
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});


// DELETE endpoint to remove a task from the STB column
app.delete('/DELETE_STB/:orderID', async (req, res) => {
    const { orderID } = req.params;

    try {
        // Find and delete the task by orderID
        const result = await STB_orders.findOneAndDelete({ orderID });

        if (!result) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task removed successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
