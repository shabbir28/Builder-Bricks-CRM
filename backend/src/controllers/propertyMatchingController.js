const { Op } = require("sequelize");
const { Lead, Property } = require("../models/index");

// @desc    Get recommended properties for a lead
// @route   GET /api/properties/match/:leadId
// @access  Private
exports.getMatchingProperties = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    // 1. Fetch the lead
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // Prepare where query
    let where = { status: "available" };

    // 2. Parse Lead Budget
    if (lead.budget) {
      let maxBudget = 0;
      const budgetStr = lead.budget.toLowerCase().replace(/[^0-9.a-z]/g, "");

      if (budgetStr.includes("cr")) {
        const val = parseFloat(budgetStr.replace("cr", "").replace("crore", ""));
        maxBudget = val * 10000000;
      } else if (budgetStr.includes("lakh") || budgetStr.includes("lac")) {
        const val = parseFloat(budgetStr.replace("lakh", "").replace("lac", ""));
        maxBudget = val * 100000;
      } else {
        maxBudget = parseFloat(budgetStr);
      }

      if (maxBudget > 0) {
        where.price = { [Op.lte]: maxBudget };
      }
    }

    // 3. Location Matching
    if (lead.preferredLocation) {
      const locationOr = [
        { city: { [Op.iLike]: `%${lead.preferredLocation}%` } },
        { street: { [Op.iLike]: `%${lead.preferredLocation}%` } },
        { title: { [Op.iLike]: `%${lead.preferredLocation}%` } },
      ];
      where[Op.or] = locationOr;
    }

    // 4. Property Type
    if (lead.preferredPropertyType && lead.preferredPropertyType !== "other") {
      where.type = lead.preferredPropertyType;
    }

    // 5. Bedrooms
    if (lead.bedrooms && lead.bedrooms > 0) {
      where.bedrooms = { [Op.gte]: lead.bedrooms };
    }

    // 6. Execute Query
    const properties = await Property.findAll({
      where,
      order: [["price", "DESC"]],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};
