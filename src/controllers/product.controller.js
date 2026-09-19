const ProductService = require('../services/product.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { sendSuccess } = require('../utils/response');

class ProductController {
  static async getProducts(req, res, next) {
    try {
      const { search, category, subcategory, family, brand, stock_status, filter_options } = req.query;
      const { page, limit, offset } = getPaginationParams(req.query);

      const { rows, total } = await ProductService.getProducts({
        search,
        category,
        subcategory,
        family,
        brand,
        stock_status,
        filter_options,
        limit,
        offset
      });

      const response = formatPaginatedResponse(rows, total, page, limit);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      return sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      await ProductService.deleteProduct(req.params.id);
      return sendSuccess(res, { message: 'Product deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async getBrands(req, res, next) {
    try {
      const brands = await ProductService.getBrands(req.query);
      return sendSuccess(res, brands);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
