const express = require("express");
const { Op } = require("sequelize");
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const { auth, agentOrAdminAuth } = require("../middleware/auth");
const { Property, User, Client } = require("../models/index");

const router = express.Router();

// Helper: parse bracket-notation FormData fields into nested object
function parseBracketFields(body) {
  const result = {};
  for (const key of Object.keys(body)) {
    const match = key.match(/^(\w+)\[(\w+)\]$/);
    if (match) {
      const [, parent, child] = match;
      if (!result[parent]) result[parent] = {};
      result[parent][child] = body[key];
    } else {
      result[key] = body[key];
    }
  }
  return result;
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/properties/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// All routes require authentication
router.use(auth);

// Validation rules
const createPropertyValidation = [
  body("title").notEmpty().withMessage("Property title is required"),
  body("description").notEmpty().withMessage("Property description is required"),
  body("type")
    .isIn(["apartment", "house", "villa", "commercial", "land"])
    .withMessage("Invalid property type"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("city").notEmpty().withMessage("City is required"),
  body("area").isNumeric().withMessage("Area must be a number"),
];

// @desc    Get all properties
// @route   GET /api/properties
// @access  Private
router.get("/", agentOrAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;
    if (req.query.minPrice)
      where.price = { [Op.gte]: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice)
      where.price = { ...where.price, [Op.lte]: parseFloat(req.query.maxPrice) };
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
        { city: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    // If agent, only show their properties
    if (req.user.role === "agent") {
      where.listedBy = req.user.id;
    }

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "listedByUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Search property by unit number
// @route   GET /api/properties/search-unit
// @access  Private
router.get("/search-unit", agentOrAdminAuth, async (req, res) => {
  try {
    const unit = req.query.unit;
    if (!unit) {
      return res.status(400).json({ success: false, message: "Unit number is required" });
    }

    const property = await Property.findOne({
      where: {
        [Op.or]: [
          { unitNumber: { [Op.iLike]: `%${unit}%` } },
          { propertyCode: { [Op.iLike]: `%${unit}%` } },
          { apartmentNumber: { [Op.iLike]: `%${unit}%` } },
          { title: { [Op.iLike]: `%${unit}%` } }
        ]
      }
    });

    if (!property) {
      return res.status(404).json({ success: false, message: "No property found for this unit number" });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
router.get("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "listedByUser",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check permissions
    if (req.user.role === "agent" && property.listedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Increment views
    await property.update({ views: property.views + 1 });

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create property
// @route   POST /api/properties
// @access  Private
router.post(
  "/",
  agentOrAdminAuth,
  upload.array("images", 10),
  createPropertyValidation,
  async (req, res) => {
    try {
      const parsed = parseBracketFields(req.body);

      // Flat fields map karo (address.city → city etc.)
      const propertyData = {
        title: parsed.title,
        description: parsed.description,
        type: parsed.type,
        status: parsed.status,
        price: parsed.price,
        street: parsed["address"]?.street || parsed.street,
        city: parsed["address"]?.city || parsed.city,
        state: parsed["address"]?.state || parsed.state,
        zipCode: parsed["address"]?.zipCode || parsed.zipCode,
        country: parsed["address"]?.country || parsed.country,
        bedrooms: parsed["features"]?.bedrooms || parsed.bedrooms,
        bathrooms: parsed["features"]?.bathrooms || parsed.bathrooms,
        area: parsed["features"]?.area || parsed.area,
        parking: parsed["features"]?.parking || parsed.parking,
        yearBuilt: parsed["features"]?.yearBuilt || parsed.yearBuilt,
        amenities: parsed.amenities,
        isFeatured: parsed.isFeatured,
        listedBy: req.user.id,
        clientId: parsed.clientId || null,
      };

      // Process images
      if (req.files && req.files.length > 0) {
        propertyData.images = req.files.map((file, index) => ({
          url: `/uploads/properties/${file.filename}`,
          isMain: index === 0,
        }));
      }

      const property = await Property.create(propertyData);

      const createdProperty = await Property.findByPk(property.id, {
        include: [
          { model: User, as: "listedByUser", attributes: ["id", "name", "email"] },
          { model: Client, as: "client", attributes: ["id", "name", "email"] },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: createdProperty,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
router.put(
  "/:id",
  agentOrAdminAuth,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const property = await Property.findByPk(req.params.id);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      // Check permissions
      if (req.user.role === "agent" && property.listedBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const parsed = parseBracketFields(req.body);
      const updateData = { ...parsed };
      
      // Handle empty string for clientId
      if (updateData.clientId === "") {
        updateData.clientId = null;
      }

      // Flat fields handle karo
      if (parsed.address) {
        Object.assign(updateData, parsed.address);
        delete updateData.address;
      }
      if (parsed.features) {
        Object.assign(updateData, parsed.features);
        delete updateData.features;
      }

      // Convert all empty strings to null to prevent DB cast errors for integers/floats
      for (const key in updateData) {
        if (updateData[key] === "") {
          updateData[key] = null;
        }
      }

      // Process new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          url: `/uploads/properties/${file.filename}`,
          isMain: false,
        }));

        if (updateData.replaceImages === "true") {
          updateData.images = newImages;
        } else {
          updateData.images = [...(property.images || []), ...newImages];
        }
      }

      await property.update(updateData);

      const updatedProperty = await Property.findByPk(req.params.id, {
        include: [
          { model: User, as: "listedByUser", attributes: ["id", "name", "email"] },
          { model: Client, as: "client", attributes: ["id", "name", "email"] },
        ],
      });

      res.json({
        success: true,
        message: "Property updated successfully",
        data: updatedProperty,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
router.delete("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check permissions
    if (req.user.role === "agent" && property.listedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await property.destroy();

    res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
