const path = require('path');
const fs = require('fs');
const FormSubmissionModel = require('../models/formSubmission.model');

/**
 * Maps form_type to a canonical user-friendly form_name if not explicitly provided
 */
const FORM_NAME_MAP = {
  quick_procurement: 'Quick Procurement Desk',
  contact_sales: 'Contact Direct Sales',
  product_request: 'Product Sourcing Request',
  quote_request: 'Quote Basket Request'
};

class FormSubmissionController {
  /**
   * Submit any form (Quick Procurement, Contact, Product Request, Quote Request)
   */
  static async submitForm(req, res, next) {
    try {
      const body = req.body || {};
      const file = req.file;

      const formType = body.form_type || 'general_inquiry';
      const formName = body.form_name || FORM_NAME_MAP[formType] || 'Website Inquiry';

      // Email is the primary contact handle
      const email = (body.email || body.work_email || body.contact_email || '').trim();
      if (!email && !body.phone && !body.user_contact) {
        return res.status(400).json({
          success: false,
          message: 'A valid email or contact detail is required.'
        });
      }

      // Extract standard fields
      const name = body.name || body.sender_name || body.customer_name || null;
      const companyName = body.company_name || body.company || null;
      const phone = body.phone || body.mobile || body.contact_phone || null;
      const subject = body.subject || body.inquiry_subject || null;
      const message = body.message || body.description || body.query || body.notes || null;
      const partNumbers = body.part_numbers || body.mpns || null;
      const skus = body.skus || body.catalog_codes || null;
      const quantity = body.quantity || body.quantity_needed || null;

      // Handle file attachment if uploaded
      let attachmentUrl = null;
      let attachmentName = null;
      if (file) {
        attachmentUrl = `/uploads/bom/${file.filename}`;
        attachmentName = file.originalname;
      } else if (body.attachment_url) {
        attachmentUrl = body.attachment_url;
        attachmentName = body.attachment_name || null;
      }

      // Capture submitter IP
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

      // Raw form data snapshot for audit / full fidelity
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

      const submission = await FormSubmissionModel.create({
        form_name: formName,
        form_type: formType,
        name: name ? String(name).trim() : null,
        email: email || (body.user_contact ? String(body.user_contact).trim() : 'not_provided@website.local'),
        company_name: companyName ? String(companyName).trim() : null,
        phone: phone ? String(phone).trim() : null,
        subject: subject ? String(subject).trim() : null,
        message: message ? String(message).trim() : null,
        part_numbers: partNumbers ? String(partNumbers).trim() : null,
        skus: skus ? String(skus).trim() : null,
        quantity: quantity ? String(quantity).trim() : null,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        form_data: formData,
        ip_address: ipAddress ? String(ipAddress).substring(0, 45) : null,
        status: 'new'
      });

      return res.status(201).json({
        success: true,
        message: `Your ${formName} submission has been successfully received.`,
        data: submission
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      next(error);
    }
  }

  /**
   * List submissions (for internal checking / dashboard)
   */
  static async getSubmissions(req, res, next) {
    try {
      const { form_name, form_type, status, limit, offset } = req.query;
      const rows = await FormSubmissionModel.findAll({
        form_name,
        form_type,
        status,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      });

      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      next(error);
    }
  }
}

module.exports = FormSubmissionController;
