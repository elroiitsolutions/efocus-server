const FormSubmissionModel = require('../src/models/formSubmission.model');

async function testFormPipeline() {
  console.log('=== Testing eFocus Form Submission Pipeline ===\n');

  try {
    // Test 1: Create a BOM Procurement submission
    console.log('1. Testing BOM Procurement Submission...');
    const bomSub = await FormSubmissionModel.create({
      form_name: 'BOM Procurement Sourcing Enquiry',
      form_type: 'bom_procurement',
      name: 'Ramesh Patel',
      company_name: 'Apex EMS Solutions Ltd',
      email: 'ramesh.patel@apexems.in',
      phone: '+91 98765 43210',
      requirement_type: 'Complete BOM',
      delivery_timeline: 'Immediate (1-2 Weeks)',
      target_brands: 'TI, STMicroelectronics, Microchip',
      part_numbers: 'STM32F407VGT6, TPS54308DDCR, BME280',
      quantity: '5000 pcs per batch',
      estimated_value: 'INR 15,00,000',
      message: 'Need urgent landed quotation for production run starting next month.',
      attachment_url: '/uploads/bom/1793275000-Apex_Production_BOM.xlsx',
      attachment_name: 'Apex_Production_BOM.xlsx',
      attachment_size: 45020,
      attachment_mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      form_data: {
        company: 'Apex EMS Solutions Ltd',
        preferred_payment: '30 Days Net',
        facility_location: 'Bengaluru Plant 2'
      },
      priority: 'high'
    });
    console.log('   Created BOM Submission:', bomSub);

    // Test 2: Create an Aerospace & Defence submission
    console.log('\n2. Testing Aerospace & Defence Test Equipment Submission...');
    const aeroSub = await FormSubmissionModel.create({
      form_name: 'Aerospace & Defence Test Equipment Enquiry',
      form_type: 'aerospace_defence_sourcing',
      name: 'Dr. Vikram Sarabhai Labs',
      company_name: 'AeroSys Dynamics Ltd',
      email: 'v.sarabhai@aerosys.org',
      phone: '+91 80 2345 6789',
      requirement_type: 'RF & Microwave Characterisation',
      delivery_timeline: '4-6 Weeks',
      part_numbers: 'Spectrum Analyzer 40GHz, Vector Network Analyzer, MIL-1553 Coupler',
      quantity: '2 Systems',
      message: 'Frequency specification: 26.5 GHz to 67 GHz. Calibration certificates required.',
      form_data: {
        frequency_range: '26.5 GHz to 67+ GHz (Ka-Band & mmWave EW/Satcom)',
        avionics_standard: 'MIL-STD-1553 & ARINC 429 Bus Interface'
      },
      priority: 'high'
    });
    console.log('   Created Aerospace Submission:', aeroSub);

    // Test 3: Query submissions
    console.log('\n3. Querying Submissions via findAll()...');
    const allSubs = await FormSubmissionModel.findAll({ limit: 5 });
    console.log(`   Found ${allSubs.length} submissions in database:`);
    allSubs.forEach(s => {
      console.log(`   - [${s.reference_no}] (${s.form_type}) ${s.name} - ${s.company_name} | Status: ${s.status}`);
    });

    // Test 4: Update status
    console.log('\n4. Updating status of BOM submission...');
    const updated = await FormSubmissionModel.updateStatus(bomSub.id, 'under_review', 'Senior Desk Engineer');
    console.log('   Status update result:', updated);

    // Test 5: Verify by Reference Number
    console.log(`\n5. Finding by Reference Number: ${bomSub.reference_no}...`);
    const foundByRef = await FormSubmissionModel.findById(bomSub.reference_no);
    console.log(`   Found: ID ${foundByRef.id}, Status: ${foundByRef.status}, Assigned to: ${foundByRef.assigned_to}`);

    // Test 6: Aggregate Stats
    console.log('\n6. Fetching Aggregate Metrics...');
    const stats = await FormSubmissionModel.getStats();
    console.log('   Stats:', JSON.stringify(stats, null, 2));

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
    process.exit(0);
  } catch (err) {
    console.error('Test pipeline failed:', err);
    process.exit(1);
  }
}

testFormPipeline();
