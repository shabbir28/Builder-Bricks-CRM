const express = require("express");
const { auth, isAdminLevel } = require("../middleware/auth");
const { Client, Property, InstallmentRequest, Receipt } = require("../models");
const upload = require("../middleware/upload");
const { Op } = require("sequelize");

const router = express.Router();

// @desc    Get all clients
// @route   GET /api/clients
router.get("/", auth, async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [
        {
          model: Property,
          as: "purchasedProperties",
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a client
// @route   POST /api/clients
router.post("/", auth, async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.installmentsCount) {
      const numMonthsStr = String(payload.installmentsCount).replace(/[^0-9]/g, '');
      const numMonths = parseInt(numMonthsStr, 10) || 0;
      
      const downPayment = parseFloat(String(payload.downPayment || '0').replace(/[^0-9.]/g, '')) || 0;
      const perMonthInstallment = parseFloat(String(payload.perMonthInstallment || '0').replace(/[^0-9.]/g, '')) || 0;
      
      const schedule = [];
      let startDate = new Date();
      if (payload.paymentDate) {
        startDate = new Date(payload.paymentDate);
      }

      for (let i = 0; i <= numMonths; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(startDate.getMonth() + i);
        
        let dpAmount = (i === 0) ? downPayment : 0;
        let instAmount = (i === 0) ? 0 : perMonthInstallment;
        
        schedule.push({
          id: i + 1,
          monthDate: monthDate.toISOString(),
          downPayment: dpAmount,
          installment: instAmount,
          surcharges: 0,
          adjustment: 0,
          transactionRef: "",
          paidDate: "",
          payment: 0
        });
      }
      
      // Add Possession Payment as the final row
      const possessionDate = new Date(startDate);
      possessionDate.setMonth(startDate.getMonth() + numMonths + 1);
      schedule.push({
        id: numMonths + 2, // Next available ID
        monthDate: possessionDate.toISOString(),
        downPayment: 0,
        installment: 0,
        possessionPayment: payload.possessionPayment || 0, // Track this specifically for UI if needed
        isPossession: true, // Flag to identify this row easily
        surcharges: 0,
        adjustment: 0,
        transactionRef: "",
        paidDate: "",
        payment: 0
      });

      payload.installmentSchedule = schedule;
    }

    const client = await Client.create(payload);

    // Auto-link property if unitNo was provided in the booking form
    if (req.body.unitNo) {
      const unit = String(req.body.unitNo).trim();
      const property = await Property.findOne({ 
        where: { 
          [Op.or]: [
            { unitNumber: { [Op.iLike]: `%${unit}%` } },
            { propertyCode: { [Op.iLike]: `%${unit}%` } },
            { title: { [Op.iLike]: `%${unit}%` } },
            { apartmentNumber: { [Op.iLike]: `%${unit}%` } }
          ]
        } 
      });
      if (property) {
        let paidAmount = 0;
        if (req.body.downPayment) {
          // Extract numeric value from downPayment string if necessary
          paidAmount = parseFloat(req.body.downPayment.toString().replace(/[^0-9.]/g, '')) || 0;
        }

        let newPrice = property.price;
        if (req.body.netPrice || req.body.totalPrice) {
          const priceInput = req.body.netPrice || req.body.totalPrice;
          const parsedPrice = parseFloat(priceInput.toString().replace(/[^0-9.]/g, ''));
          if (parsedPrice && parsedPrice > 0) {
            newPrice = parsedPrice;
          }
        }

        await property.update({
          status: "sold",
          clientId: client.id,
          clientPaidAmount: paidAmount,
          price: newPrice
        });
      }
    }

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Sell a property to a client
// @route   POST /api/clients/:id/sell
router.post("/:id/sell", auth, async (req, res) => {
  try {
    const { propertyId, paidAmount } = req.body;
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Mark property as sold and link to client
    await property.update({
      status: "sold",
      clientId: client.id,
      clientPaidAmount: paidAmount || 0,
    });

    res.json({ success: true, message: "Property successfully sold to client", data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a client
// @route   PUT /api/clients/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    
    await client.update(req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update an installment for a client
// @route   PUT /api/clients/:id/installments/:installmentId
// Admin/Super Admin: direct update
// Executive: creates a pending approval request
router.put("/:id/installments/:installmentId", auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const schedule = client.installmentSchedule || [];
    const installmentId = parseInt(req.params.installmentId, 10);
    const index = schedule.findIndex(item => item.id === installmentId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Installment not found" });
    }

    const originalRow = schedule[index];

    // ── Admin / Super Admin: direct update ──
    if (isAdminLevel(req.user)) {
      schedule[index] = {
        ...originalRow,
        surcharges: parseFloat(req.body.surcharges ?? originalRow.surcharges ?? 0),
        adjustment: parseFloat(req.body.adjustment ?? originalRow.adjustment ?? 0),
        transactionRef: req.body.transactionRef !== undefined ? req.body.transactionRef : originalRow.transactionRef,
        paidDate: req.body.paidDate !== undefined ? req.body.paidDate : originalRow.paidDate,
        payment: parseFloat(req.body.payment ?? originalRow.payment ?? 0),
      };

      client.set("installmentSchedule", schedule);
      client.changed("installmentSchedule", true);
      await client.save();

      return res.json({ success: true, data: client, directUpdate: true });
    }

    // ── Executive: create approval request ──
    const changes = {
      surcharges: parseFloat(req.body.surcharges ?? originalRow.surcharges ?? 0),
      adjustment: parseFloat(req.body.adjustment ?? originalRow.adjustment ?? 0),
      transactionRef: req.body.transactionRef !== undefined ? req.body.transactionRef : originalRow.transactionRef,
      paidDate: req.body.paidDate !== undefined ? req.body.paidDate : originalRow.paidDate,
      payment: parseFloat(req.body.payment ?? originalRow.payment ?? 0),
    };

    const installmentRequest = await InstallmentRequest.create({
      clientId: client.id,
      installmentId,
      requestedBy: req.user.id,
      changes,
      originalValues: {
        surcharges: originalRow.surcharges,
        adjustment: originalRow.adjustment,
        transactionRef: originalRow.transactionRef,
        paidDate: originalRow.paidDate,
        payment: originalRow.payment,
      },
      status: "pending",
    });

    return res.status(202).json({
      success: true,
      requestPending: true,
      message: "Request submitted for admin approval",
      data: installmentRequest,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Upload receipt for an installment
// @route   POST /api/clients/:id/installments/:installmentId/receipt
router.post("/:id/installments/:installmentId/receipt", auth, upload.single("receipt"), async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const schedule = client.installmentSchedule || [];
    const installmentId = parseInt(req.params.installmentId, 10);
    const index = schedule.findIndex(item => item.id === installmentId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Installment not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    // Save to Receipt model
    await Receipt.create({
      clientId: client.id,
      installmentId,
      fileUrl,
      fileName,
      uploadedBy: req.user.id,
    });

    // Update installment row
    schedule[index] = {
      ...schedule[index],
      receiptUrl: fileUrl,
    };

    client.set("installmentSchedule", schedule);
    client.changed("installmentSchedule", true);
    await client.save();

    res.json({ success: true, message: "Receipt uploaded successfully", data: schedule[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a client
// @route   DELETE /api/clients/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    // Unlink any purchased properties and set them back to 'available'
    await Property.update(
      { clientId: null, status: 'available', clientPaidAmount: 0 },
      { where: { clientId: client.id } }
    );

    await client.destroy();
    res.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
