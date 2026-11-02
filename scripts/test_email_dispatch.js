const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const EmailService = require('../src/services/email.service');

async function testEmailDispatch() {
  console.log('=== eFocus Email Dispatch Test ===');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Pass Configured:', Boolean(process.env.SMTP_PASS));
  console.log('Admin Email Recipient:', process.env.ADMIN_NOTIFICATION_EMAIL);
  console.log('Customer Email Recipient (Test): rameshkumar.25ravi@gmail.com');
  console.log('------------------------------------------');

  const mockSubmission = {
    id: 9999,
    reference_no: 'EF-TEST-' + Math.floor(100000 + Math.random() * 900000),
    form_name: 'BOM Procurement Sourcing Enquiry',
    form_type: 'bom_procurement',
    name: 'Ramesh Kumar',
    company_name: 'Apex Test Systems Ltd',
    email: 'rameshkumar.25ravi@gmail.com',
    phone: '+91 98765 43210',
    subject: 'Production BOM Line Items Sourcing - RFQ',
    requirement_type: 'Full Turnkey Sourcing',
    delivery_timeline: '2–4 Weeks',
    target_brands: 'Texas Instruments, STMicroelectronics, TE Connectivity',
    part_numbers: 'STM32F407VGT6 (500 pcs), TPS54302DDCR (1,000 pcs), 104031-0811 (2,000 pcs)',
    skus: '15 Active Lines',
    quantity: '3,500 units total',
    estimated_value: '₹8.5 Lakhs',
    message: 'Testing live email dispatch from eFocus Industrial web platform. Please review line items and furnish best volume pricing and manufacturer certificates.',
    status: 'new',
    priority: 'high',
    attachment_name: 'Apex_Test_BOM_Sample.xlsx',
    attachment_url: '/uploads/sample_bom.xlsx',
    attachment_size: 45200,
    created_at: new Date()
  };

  console.log('\n1. Sending Admin Alert to: ' + (process.env.ADMIN_NOTIFICATION_EMAIL || 'rameshkumar25.work@gmail.com') + '...');
  const adminResult = await EmailService.sendAdminAlert(mockSubmission);
  console.log('Admin Alert Result:', adminResult);

  console.log('\n2. Sending Customer Confirmation to: ' + mockSubmission.email + '...');
  const customerResult = await EmailService.sendCustomerConfirmation(mockSubmission);
  console.log('Customer Confirmation Result:', customerResult);

  console.log('\n=== Email Dispatch Test Finished ===');
}

testEmailDispatch().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
