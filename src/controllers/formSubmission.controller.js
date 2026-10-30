const FormSubmissionModel = require('../models/formSubmission.model');
const EmailService = require('../services/email.service');

/**
 * Maps form_type to a canonical user-friendly form_name if not explicitly provided
 */
const FORM_NAME_MAP = {
  bom_procurement: 'BOM Procurement Sourcing Enquiry',
  vendor_consolidation_enquiry: 'Vendor Consolidation Sourcing Enquiry',
  annual_rate_contract_enquiry: 'Annual Rate Contract (ARC) Enquiry',
  project_procurement_enquiry: 'Project Procurement Sourcing Enquiry',
  workstation_sourcing_enquiry: 'Turnkey Workstation Setup Enquiry',
  electronics_ems_sourcing: 'Electronics & EMS Production Sourcing Enquiry',
  automotive_ev_sourcing: 'Automotive & EV Testing Sourcing Enquiry',
  aerospace_defence_sourcing: 'Aerospace & Defence Test Equipment Enquiry',
  semiconductor_test_sourcing: 'Semiconductor Test & Measurement Enquiry',
  semiconductor_sourcing: 'Semiconductor Test & Measurement Enquiry',
  telecom_rf_sourcing: 'Telecom & RF Test Equipment Sourcing Enquiry',
  power_energy_sourcing: 'Power & Energy Equipment Sourcing Enquiry',
  industrial_automation_sourcing: 'Industrial Automation Equipment Sourcing Enquiry',
  pharma_medical_sourcing: 'Pharma & Medical Equipment Sourcing Enquiry',
  services_enquiry: 'Engineering Support Service Enquiry',
  quick_procurement: 'Quick Procurement Desk',
  contact_sales: 'Contact Direct Sales',
  contact_us: 'Contact Direct Sales',
  product_request: 'Product Sourcing Request',
  quote_request: 'Quote Basket Request'
};

class FormSubmissionController {
  /**
   * Submit any form inquiry / RFQ / BOM
   * POST /api/forms/submit
   */
  static async submitForm(req, res, next) {
    try {
      const body = req.body || {};
      const file = req.file;

      const formType = (body.form_type || 'general_inquiry').toLowerCase().trim();
      const formName = body.form_name || FORM_NAME_MAP[formType] || 'Industrial Sourcing Enquiry';

      // Email is primary identifier, with fallbacks for phone or contact
      const email = (body.email || body.work_email || body.contact_email || '').trim();
      const phone = (body.phone || body.mobile || body.contact_phone || '').trim();

      if (!email && !phone && !body.user_contact) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address or phone number is required.'
        });
      }

      // 1. Extract contact details
      const name = body.name || body.contact_person || body.sender_name || body.customer_name || null;
      const companyName = body.company_name || body.company || body.lab_name || null;
      const subject = body.subject || body.inquiry_subject || `${formName} from ${companyName || name || 'Website Visitor'}`;

      // 2. Extract requirement & domain parameters across all forms
      const requirementType = 
        body.requirement_type || 
        body.sourcing_type || 
        body.production_focus || 
        body.workstation_application || 
        body.application_focus || 
        body.service_required || 
        null;

      const deliveryTimeline = 
        body.delivery_timeline || 
        body.timeline || 
        body.expected_delivery_timeline || 
        null;

      const targetBrands = 
        body.target_brands || 
        body.preferred_brands || 
        body.make_model || 
        null;

      const partNumbers = 
        body.part_numbers || 
        body.mpns || 
        body.equipment_requirements || 
        body.project_requirements || 
        body.testing_requirements || 
        body.instrument_details || 
        null;

      const skus = body.skus || body.catalog_codes || null;
      const quantity = body.quantity || body.estimated_annual_requirement || body.quantity_needed || null;
      const estimatedValue = body.estimated_value || body.budget || null;

      // Extract general or combined message
      const message = 
        body.message || 
        body.additional_details || 
        body.additional_requirements || 
        body.additional_specifications || 
        body.consolidation_objectives || 
        body.description || 
        body.query || 
        body.notes || 
        null;

      // 3. Handle file attachment if uploaded
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentSize = null;
      let attachmentMime = null;

      if (file) {
        attachmentUrl = `/uploads/bom/${file.filename}`;
        attachmentName = file.originalname;
        attachmentSize = file.size;
        attachmentMime = file.mimetype;
      } else if (body.attachment_url) {
        attachmentUrl = body.attachment_url;
        attachmentName = body.attachment_name || 'Uploaded File';
      }

      // 4. Capture Client Metadata
      const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const userAgent = req.headers['user-agent'] ? String(req.headers['user-agent']).substring(0, 255) : null;

      // Default Priority Determination
      let priority = 'normal';
      if (
        formType.includes('aerospace') || 
        formType.includes('annual_rate') || 
        (deliveryTimeline && deliveryTimeline.toLowerCase().includes('immediate'))
      ) {
        priority = 'high';
      }

      // 5. Raw form data snapshot for complete fidelity (stores all custom fields)
      const formData = {
        ...body
      };
      if (file) {
        formData.uploaded_file = {
          original_name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: attachmentUrl
        };
      }

      // 6. Persist to Database
      const submission = await FormSubmissionModel.create({
        form_name: formName,
        form_type: formType,
        name: name ? String(name).trim() : null,
        company_name: companyName ? String(companyName).trim() : null,
        email: email || 'not_provided@website.local',
        phone: phone || null,
        subject: String(subject).trim(),
        requirement_type: requirementType ? String(requirementType).trim() : null,
        delivery_timeline: deliveryTimeline ? String(deliveryTimeline).trim() : null,
        target_brands: targetBrands ? String(targetBrands).trim() : null,
        part_numbers: partNumbers ? String(partNumbers).trim() : null,
        skus: skus ? String(skus).trim() : null,
        quantity: quantity ? String(quantity).trim() : null,
        estimated_value: estimatedValue ? String(estimatedValue).trim() : null,
        message: message ? String(message).trim() : null,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_size: attachmentSize,
        attachment_mime: attachmentMime,
        form_data: formData,
        status: 'new',
        priority: priority,
        ip_address: ipAddress ? ipAddress.substring(0, 45) : null,
        user_agent: userAgent
      });

      // 7. Dispatch Email Notifications asynchronously (Non-blocking)
      EmailService.sendAdminAlert(submission, file).catch(err => {
        console.warn('[EmailService] Async admin alert error:', err.message);
      });
      EmailService.sendCustomerConfirmation(submission).catch(err => {
        console.warn('[EmailService] Async customer confirmation error:', err.message);
      });

      return res.status(201).json({
        success: true,
        message: `Your ${formName} submission has been successfully received.`,
        reference_no: submission.reference_no,
        data: submission
      });
    } catch (error) {
      console.error('Error in FormSubmissionController.submitForm:', error);
      next(error);
    }
  }

  /**
   * Get all submissions with filters & pagination
   * GET /api/forms/submissions
   */
  static async getSubmissions(req, res, next) {
    try {
      const { form_name, form_type, category_group, status, priority, search, limit, offset } = req.query;

      const submissions = await FormSubmissionModel.findAll({
        form_name,
        form_type,
        category_group,
        status,
        priority,
        search,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });

      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      next(error);
    }
  }

  /**
   * Get single submission by ID or Reference Number
   * GET /api/forms/submissions/:id
   */
  static async getSubmissionById(req, res, next) {
    try {
      const { id } = req.params;
      const submission = await FormSubmissionModel.findById(id);

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: `Submission not found for: ${id}`
        });
      }

      return res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      console.error('Error fetching submission by ID:', error);
      next(error);
    }
  }

  /**
   * Update submission status and assignment
   * PATCH /api/forms/submissions/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, assigned_to } = req.body;

      const validStatuses = ['new', 'under_review', 'quote_sent', 'won', 'lost', 'closed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const updated = await FormSubmissionModel.updateStatus(id, status, assigned_to || null);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Submission not found for ID: ${id}`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Submission #${id} status updated to '${status}'.`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      next(error);
    }
  }

  /**
   * Update internal engineering notes
   * POST /api/forms/submissions/:id/notes
   */
  static async updateNotes(req, res, next) {
    try {
      const { id } = req.params;
      const { internal_notes } = req.body;

      const updated = await FormSubmissionModel.updateNotes(id, internal_notes);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Submission not found for ID: ${id}`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Notes updated for submission #${id}.`
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      next(error);
    }
  }

  /**
   * Get submission aggregate stats for admin dashboards
   * GET /api/forms/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await FormSubmissionModel.getStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      next(error);
    }
  }
}

module.exports = FormSubmissionController;
