// backend/models/orderSchema.js
const mongoose = require('mongoose');

const ORFSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date, default: Date.now }
});

const CGSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date },
    masterName: { type: String, required: true },
    CG_Date: { type: Date, default: Date.now }
});

const CRSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date },
    masterName: { type: String, required: true },
    CG_Date: { type: Date },
    CR_Date: { type: Date, default: Date.now }
});

const SGSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date },
    masterName: { type: String, required: true },
    CG_Date: { type: Date },
    CR_Date: { type: Date },
    karigarName: { type: String, required: true },
    SG_Date: { type: Date, default: Date.now }
});

const SRSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date },
    masterName: { type: String, required: true },
    CG_Date: { type: Date },
    CR_Date: { type: Date },
    karigarName: { type: String, required: true },
    SG_Date: { type: Date },
    SR_Date: { type: Date, default: Date.now }
});

const STBSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date },
    masterName: { type: String, required: true },
    CG_Date: { type: Date },
    CR_Date: { type: Date },
    karigarName: { type: String, required: true },
    SG_Date: { type: Date },
    SR_Date: { type: Date },
    branch: { type: String, required: true },
    gatePassNo: { type: String, required: true },
    STB_Date: { type: Date, default: Date.now }
});

const MasterSchema = new mongoose.Schema({
    orderID: { type: String, required: true },
    productName: { type: String, required: true },
    fabric: { type: Boolean, required: true },
    EMB: { type: Boolean },
    ORF_Date: { type: Date },
    masterName: { type: String, required: true },
    CG_Date: { type: Date },
    CR_Date: { type: Date },
    karigarName: { type: String, required: true },
    SG_Date: { type: Date },
    SR_Date: { type: Date },
    branch: { type: String, required: true },
    gatePassNo: { type: String, required: true },
    STB_Date: { type: Date, default: Date.now }
});







const FR_orders = mongoose.model('FR_orders', ORFSchema);
const CG_orders = mongoose.model('CG_orders', CGSchema);
const CR_orders = mongoose.model('CR_orders', CRSchema);
const SG_orders = mongoose.model('SG_orders', SGSchema);
const SR_orders = mongoose.model('SR_orders', SRSchema);
const STB_orders = mongoose.model('STB_orders', STBSchema);
const Master_orders = mongoose.model('Master_orders', MasterSchema);

module.exports = { FR_orders, CG_orders, CR_orders, SG_orders, SR_orders, STB_orders, Master_orders };
