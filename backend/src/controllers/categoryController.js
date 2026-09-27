const prisma = require('../prisma');

// GET /api/waste-categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.wasteCategory.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/waste-categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.wasteCategory.findUnique({
      where: { id },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Waste category not found',
      });
    }
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
};
