const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategoryById = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            courses: true
          }
        },
        courses: {
          select: {
            id: true,
            name: true,
            description: true,
            institute: {
              select: {
                id: true,
                name: true
              }
            },
            grade: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                subtopics: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin/Institute
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if category with same name exists
    const categoryExists = await prisma.category.findFirst({
      where: { name }
    });

    if (categoryExists) {
      const error = new Error('Category with this name already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin/Institute
 */
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    const { name, description } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if the new name is already taken
    if (name && name !== category.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name,
          NOT: {
            id: categoryId
          }
        }
      });

      if (nameExists) {
        const error = new Error('Category with this name already exists');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name || category.name,
        description: description !== undefined ? description : category.description
      }
    });

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin/Institute
 */
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if category has courses
    const coursesCount = await prisma.course.count({
      where: { categoryId }
    });

    if (coursesCount > 0) {
      const error = new Error('Cannot delete category that has courses. Remove all courses first.');
      error.statusCode = 400;
      return next(error);
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};