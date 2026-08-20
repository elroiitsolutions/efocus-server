const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const wb = xlsx.utils.book_new();

// Sheet 1: Category Summary
const catData = [
  { "Category No": "CAT-001", "Category Name": "SMT Equipment", "Priority": 1, "Description": "SMT machinery and printers." },
  { "Category No": "CAT-002", "Category Name": "Soldering & Desoldering", "Priority": 2, "Description": "Soldering stations and hot air rework tools." },
  { "Category No": "CAT-003", "Category Name": "Test & Measurement", "Priority": 3, "Description": "Lab test and measurement instruments." }
];
const wsCat = xlsx.utils.json_to_sheet(catData);
xlsx.utils.book_append_sheet(wb, wsCat, 'Category Summary');

// Sheet 2: Product Family Config
const configData = [
  { "Product Family": "Lead-free Stations", "Filter Name": "Power Rating", "Filter Type": "select", "Option Values": "80W, 90W, 120W, 150W" },
  { "Product Family": "Lead-free Stations", "Filter Name": "Heating Technology", "Filter Type": "select", "Option Values": "High Frequency Induction, Resistance Wire Heating" },
  { "Product Family": "Lead-free Stations", "Filter Name": "ESD Safety", "Filter Type": "select", "Option Values": "Yes, No" },
  { "Product Family": "Benchtop Oscilloscopes", "Filter Name": "Bandwidth", "Filter Type": "select", "Option Values": "100MHz, 200MHz, 350MHz, 500MHz" },
  { "Product Family": "Benchtop Oscilloscopes", "Filter Name": "Channels", "Filter Type": "select", "Option Values": "2 Analog Channels, 4 Analog Channels, 4 Analog + 16 Digital Channels" }
];
const wsConfig = xlsx.utils.json_to_sheet(configData);
xlsx.utils.book_append_sheet(wb, wsConfig, 'Product Family Config');

// Sheet 3: Product Master
const masterData = [
  {
    "Category": "Soldering & Desoldering",
    "Sub-Category": "Soldering Stations",
    "Product Family": "Lead-free Stations",
    "SKU": "SLD-STN-90W",
    "Cat No": "QUICK-203H",
    "Product Name": "90W High-Frequency Soldering Station",
    "Brand": "Quick",
    "Short Description": "Professional 90W high-frequency heating soldering station with rapid temperature recovery.",
    "Key Spec 1": "Power: 90W",
    "Key Spec 2": "Temp Range: 100-500°C",
    "Key Spec 3": "ESD Safe: Yes",
    "Image Status": "Available",
    "RFQ Eligible": "Yes"
  },
  {
    "Category": "Soldering & Desoldering",
    "Sub-Category": "Soldering Stations",
    "Product Family": "Lead-free Stations",
    "SKU": "SLD-STN-120W",
    "Cat No": "QUICK-TS1200A",
    "Product Name": "120W Intelligent Soldering Station",
    "Brand": "Quick",
    "Short Description": "120W lead-free intelligent soldering station with touch panel controls.",
    "Key Spec 1": "Power: 120W",
    "Key Spec 2": "Temp Range: 200-480°C",
    "Key Spec 3": "Smart Controls: Yes",
    "Image Status": "Available",
    "RFQ Eligible": "Yes"
  },
  {
    "Category": "Test & Measurement",
    "Sub-Category": "Oscilloscopes",
    "Product Family": "Benchtop Oscilloscopes",
    "SKU": "OSC-DS1102Z",
    "Cat No": "RIGOL-DS1102Z-E",
    "Product Name": "100MHz 2-Channel Oscilloscope",
    "Brand": "Rigol",
    "Short Description": "UltraVision technology digital storage oscilloscope.",
    "Key Spec 1": "Bandwidth: 100MHz",
    "Key Spec 2": "Channels: 2 Channels",
    "Key Spec 3": "Sample Rate: 1GSa/s",
    "Image Status": "Available",
    "RFQ Eligible": "Yes"
  }
];
const wsMaster = xlsx.utils.json_to_sheet(masterData);
xlsx.utils.book_append_sheet(wb, wsMaster, 'Product Master');

xlsx.writeFile(wb, path.join(dataDir, 'products.xlsx'));
console.log('Sample Excel file generated successfully in data/products.xlsx');
