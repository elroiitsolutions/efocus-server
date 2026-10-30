const { pool } = require('../config/database');

class FormSubmissionModel {
  /**
   * Generates a clean human-readable reference number based on form_type
   */
  static generateReferenceNo(formType) {
    let prefix = 'EF-REQ';
    if (formType.includes('bom')) prefix = 'EF-BOM';
    else if (formType.includes('annual_rate') || formType.includes('arc')) prefix = 'EF-ARC';
    else if (formType.includes('vendor')) prefix = 'EF-VND';
    else if (formType.includes('project')) prefix = 'EF-PRJ';
    else if (formType.includes('workstation')) prefix = 'EF-WKS';
    else if (formType.includes('aerospace')) prefix = 'EF-AERO';
    else if (formType.includes('automotive') || formType.includes('ev')) prefix = 'EF-AUTO';
    else if (formType.includes('electronics') || formType.includes('ems')) prefix = 'EF-EMS';
    else if (formType.includes('semi')) prefix = 'EF-SEMI';
    else if (formType.includes('telecom') || formType.includes('rf')) prefix = 'EF-RF';
    else if (formType.includes('power') || formType.includes('energy')) prefix = 'EF-PWR';
    else if (formType.includes('automation') || formType.includes('plc') || formType.includes('ia')) prefix = 'EF-IA';
    else if (formType.includes('pharma') || formType.includes('medical') || formType.includes('med')) prefix = 'EF-MED';
    else if (formType.includes('service')) prefix = 'EF-SRV';
    else if (formType.includes('quote')) prefix = 'EF-QUO';

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomSuffix}`;
  }

  /**
   * Categorizes the form into a primary category_group
   */
  static categorizeGroup(formType) {
    if (formType.includes('bom') || formType.includes('rate') || formType.includes('vendor') || formType.includes('project') || formType.includes('workstation') || formType.includes('procurement')) {
      return 'procurement';
    }
    if (
      formType.includes('electronics') || 
      formType.includes('automotive') || 
      formType.includes('aerospace') || 
      formType.includes('semi') || 
      formType.includes('telecom') || 
      formType.includes('rf') || 
      formType.includes('power') || 
      formType.includes('energy') || 
      formType.includes('automation') || 
      formType.includes('pharma') || 
      formType.includes('medical') || 
      formType.includes('industry')
    ) {
      return 'industry';
    }
    if (formType.includes('service')) {
      return 'service';
    }
    if (formType.includes('quote')) {
      return 'quote';
    }
    return 'general';
  }

  /**
   * Insert a new form submission into form_submissions
   */
  static async create({
    reference_no = null,
    form_name,
    form_type,
    category_group = null,
    name = null,
    email,
    company_name = null,
    phone = null,
    subject = null,
    requirement_type = null,
    delivery_timeline = null,
    target_brands = null,
    part_numbers = null,
    skus = null,
    quantity = null,
    estimated_value = null,
    message = null,
    attachment_url = null,
    attachment_name = null,
    attachment_size = null,
    attachment_mime = null,
    form_data = null,
    status = 'new',
    priority = 'normal',
    assigned_to = null,
    internal_notes = null,
    ip_address = null,
    user_agent = null
  }) {
    const finalReferenceNo = reference_no || this.generateReferenceNo(form_type);
    const finalCategoryGroup = category_group || this.categorizeGroup(form_type);

    const sql = `
      INSERT INTO form_submissions (
        reference_no,
        form_name,
        form_type,
        category_group,
        name,
        company_name,
        email,
        phone,
        subject,
        requirement_type,
        delivery_timeline,
        target_brands,
        part_numbers,
        skus,
        quantity,
        estimated_value,
        message,
        attachment_url,
        attachment_name,
        attachment_size,
        attachment_mime,
        form_data,
        status,
        priority,
        assigned_to,
        internal_notes,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      finalReferenceNo,
      form_name,
      form_type,
      finalCategoryGroup,
      name,
      company_name,
      email,
      phone,
      subject,
      requirement_type,
      delivery_timeline,
      target_brands,
      part_numbers,
      skus,
      quantity,
      estimated_value,
      message,
      attachment_url,
      attachment_name,
      attachment_size,
      attachment_mime,
      form_data ? JSON.stringify(form_data) : null,
      status,
      priority,
      assigned_to,
      internal_notes,
      ip_address,
      user_agent
    ];

    const [result] = await pool.execute(sql, values);
    return {
      id: result.insertId,
      reference_no: finalReferenceNo,
      form_name,
      form_type,
      category_group: finalCategoryGroup,
      email,
      status
    };
  }

  /**
   * Find submissions with optional filters and pagination
   */
  static async findAll({ form_name, form_type, category_group, status, priority, search, limit = 50, offset = 0 } = {}) {
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
    if (category_group) {
      where.push('category_group = ?');
      params.push(category_group);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (priority) {
      where.push('priority = ?');
      params.push(priority);
    }
    if (search) {
      where.push('(name LIKE ? OR company_name LIKE ? OR email LIKE ? OR reference_no LIKE ? OR part_numbers LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
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
   * Find single submission by ID or Reference Number
   */
  static async findById(id) {
    const isReference = typeof id === 'string' && id.startsWith('EF-');
    const sql = isReference 
      ? 'SELECT * FROM form_submissions WHERE reference_no = ?'
      : 'SELECT * FROM form_submissions WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update submission status
   */
  static async updateStatus(id, status, assigned_to = null) {
    let sql = 'UPDATE form_submissions SET status = ?';
    const params = [status];
    if (assigned_to !== null) {
      sql += ', assigned_to = ?';
      params.push(assigned_to);
    }
    sql += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(sql, params);
    return result.affectedRows > 0;
  }

  /**
   * Append or update internal notes
   */
  static async updateNotes(id, internal_notes) {
    const sql = 'UPDATE form_submissions SET internal_notes = ? WHERE id = ?';
    const [result] = await pool.execute(sql, [internal_notes, id]);
    return result.affectedRows > 0;
  }

  /**
   * Get submission count metrics grouped by status and category
   */
  static async getStats() {
    const [statusCounts] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM form_submissions 
      GROUP BY status
    `);

    const [categoryCounts] = await pool.query(`
      SELECT category_group, COUNT(*) as count 
      FROM form_submissions 
      GROUP BY category_group
    `);

    const [totalRow] = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN created_at >= NOW() - INTERVAL 24 HOUR THEN 1 END) as last_24h,
             COUNT(CASE WHEN attachment_url IS NOT NULL THEN 1 END) as with_files
      FROM form_submissions
    `);

    return {
      totals: totalRow[0] || { total: 0, last_24h: 0, with_files: 0 },
      by_status: statusCounts,
      by_category: categoryCounts
    };
  }
}

module.exports = FormSubmissionModel;
