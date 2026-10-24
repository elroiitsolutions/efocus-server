const { pool } = require('../config/database');

class FormSubmissionModel {
  /**
   * Insert a new form submission into form_submissions
   */
  static async create({
    form_name,
    form_type,
    name = null,
    email,
    company_name = null,
    phone = null,
    subject = null,
    message = null,
    part_numbers = null,
    skus = null,
    quantity = null,
    attachment_url = null,
    attachment_name = null,
    form_data = null,
    ip_address = null,
    status = 'new'
  }) {
    const sql = `
      INSERT INTO form_submissions (
        form_name,
        form_type,
        name,
        email,
        company_name,
        phone,
        subject,
        message,
        part_numbers,
        skus,
        quantity,
        attachment_url,
        attachment_name,
        form_data,
        status,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      form_name,
      form_type,
      name,
      email,
      company_name,
      phone,
      subject,
      message,
      part_numbers,
      skus,
      quantity,
      attachment_url,
      attachment_name,
      form_data ? JSON.stringify(form_data) : null,
      status,
      ip_address
    ];

    const [result] = await pool.execute(sql, values);
    return {
      id: result.insertId,
      form_name,
      form_type,
      email,
      status
    };
  }

  /**
   * Find submissions with optional filters
   */
  static async findAll({ form_name, form_type, status, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM form_submissions';
    const where = [];
    const params = [];

    if (form_name) {
      where.push('form_name = ?');
      params.push(form_name);
    }
    if (form_type) {
      where.push('form_type = ?');
      params.push(form_type);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    if (where.length > 0) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Find single submission by ID
   */
  static async findById(id) {
    const sql = 'SELECT * FROM form_submissions WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = FormSubmissionModel;
