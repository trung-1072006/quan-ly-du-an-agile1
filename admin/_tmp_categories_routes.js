const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

const buildResponse = (success, message, data = null) => ({
  success,
  message,
  data
});

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ deleted_at: null }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json(buildResponse(false, error.message));
  }
});

router.get('/trash', async (req, res) => {
  try {
    const categories = await Category.find({ deleted_at: { $ne: null } }).sort({ deleted_at: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json(buildResponse(false, error.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json(buildResponse(false, 'Không tìm thấy danh mục'));
    }
    res.json(buildResponse(true, 'Chi tiết danh mục', category));
  } catch (error) {
    res.status(500).json(buildResponse(false, error.message));
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.slug && payload.name) {
      payload.slug = String(payload.name).toLowerCase().trim().replace(/\s+/g, '-');
    }
    const category = await Category.create(payload);
    res.status(201).json(buildResponse(true, 'Thêm danh mục thành công', category));
  } catch (error) {
    res.status(400).json(buildResponse(false, error.message));
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = { ...req.body, updatedAt: new Date() };
    if (!payload.slug && payload.name) {
      payload.slug = String(payload.name).toLowerCase().trim().replace(/\s+/g, '-');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json(buildResponse(false, 'Không tìm thấy danh mục'));
    }
    res.json(buildResponse(true, 'Cập nhật danh mục thành công', category));
  } catch (error) {
    res.status(400).json(buildResponse(false, error.message));
  }
});

router.delete('/soft-delete/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { deleted_at: new Date(), status: 0, updatedAt: new Date() },
      { new: true }
    );
    if (!category) {
      return res.status(404).json(buildResponse(false, 'Không tìm thấy danh mục'));
    }
    res.json(buildResponse(true, 'Đã chuyển danh mục vào thùng rác', category));
  } catch (error) {
    res.status(400).json(buildResponse(false, error.message));
  }
});

router.put('/restore/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { deleted_at: null, status: 1, updatedAt: new Date() },
      { new: true }
    );
    if (!category) {
      return res.status(404).json(buildResponse(false, 'Không tìm thấy danh mục'));
    }
    res.json(buildResponse(true, 'Khôi phục danh mục thành công', category));
  } catch (error) {
    res.status(400).json(buildResponse(false, error.message));
  }
});

router.delete('/force-delete/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json(buildResponse(false, 'Không tìm thấy danh mục'));
    }
    res.json(buildResponse(true, 'Xóa vĩnh viễn danh mục thành công', category));
  } catch (error) {
    res.status(500).json(buildResponse(false, error.message));
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json(buildResponse(false, 'Không tìm thấy danh mục'));
    }
    res.json(buildResponse(true, 'Xóa danh mục thành công', category));
  } catch (error) {
    res.status(500).json(buildResponse(false, error.message));
  }
});

module.exports = router;
