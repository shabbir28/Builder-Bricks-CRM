const express = require("express");
const { Op } = require("sequelize");
const { auth } = require("../middleware/auth");
const { Property, Lead, Deal, Activity, User, LeadProgressLog, Client } = require("../models/index");

const router = express.Router();

router.get("/stats", auth, async (req, res) => {
  try {
    const isAgent = req.user.role === "agent";
    const agentId = req.user.id;

    // Filter leads, deals based on role
    const leadWhere = isAgent ? { assignedAgent: agentId } : {};
    const dealWhere = isAgent ? { agentId } : {};

    const totalProperties = await Property.count();
    const totalLeads = await Lead.count({ where: leadWhere });
    const newLeads = await Lead.count({ where: { ...leadWhere, status: "new" } });
    const contactedLeads = await Lead.count({ where: { ...leadWhere, status: "contacted" } });

    const pendingAssignments = isAgent
      ? await Lead.count({
          where: { assignedAgent: agentId, assignmentStatus: "pending" },
        })
      : 0;

    const activeDeals = await Deal.findAll({
      where: {
        ...dealWhere,
        pipelineStage: { [Op.notIn]: ["won", "lost"] },
      },
    });

    const closedDeals = await Deal.findAll({
      where: { ...dealWhere, pipelineStage: "won" },
    });

    const totalValue = activeDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
    const totalRevenue = closedDeals.reduce((sum, deal) => sum + (deal.commissionAmount || 0), 0);

    const conversionRate = totalLeads > 0 ? (closedDeals.length / totalLeads) * 100 : 0;

    // Leads assigned per agent (Only for Admin)
    let leadsPerAgent = [];
    if (!isAgent) {
      const agents = await User.findAll({ where: { role: "agent" } });
      leadsPerAgent = await Promise.all(
        agents.map(async (agent) => {
          const count = await Lead.count({ where: { assignedAgent: agent.id } });
          return { agentName: agent.name, count };
        })
      );
    }

    // Monthly revenue for chart (Real Data from Installment Schedules)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ 
        name: d.toLocaleString("default", { month: "short" }),
        yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0,
        deals: 0 // placeholder if needed
      });
    }

    const allClients = await Client.findAll();
    const totalClientsCount = allClients.length;
    let totalExpectedRevenue = 0;
    let totalCollectedPayments = 0;

    allClients.forEach(client => {
      totalExpectedRevenue += parseFloat(client.netPrice || client.totalPrice || 0) || 0;
      
      const downPayment = parseFloat((client.downPayment || '').toString().replace(/[^0-9.]/g, '')) || 0;
      let clientCollected = downPayment;

      const schedule = client.installmentSchedule || [];
      schedule.forEach(inst => {
        const payment = parseFloat(inst.payment) || 0;
        if (payment > 0) {
          clientCollected += payment;
          
          if (inst.paidDate) {
            const pd = new Date(inst.paidDate);
            const ym = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}`;
            const monthObj = months.find(m => m.yearMonth === ym);
            if (monthObj) {
              monthObj.revenue += payment;
            }
          }
        }
      });
      totalCollectedPayments += clientCollected;

      // Add down payment to the month the client was created
      if (downPayment > 0) {
        const cDate = client.createdAt ? new Date(client.createdAt) : new Date();
        const cYm = `${cDate.getFullYear()}-${String(cDate.getMonth() + 1).padStart(2, '0')}`;
        const cMonthObj = months.find(m => m.yearMonth === cYm);
        if (cMonthObj) {
          cMonthObj.revenue += downPayment;
        }
      }
    });

    const totalRemainingBalance = totalExpectedRevenue - totalCollectedPayments;
    const revenueStats = months.map(m => ({ name: m.name, revenue: m.revenue, deals: m.deals }));

    // Lead Status Pipeline
    const pipelineStatuses = ["new", "contacted", "visit", "negotiation", "closed", "lost"];
    const leadPipeline = await Promise.all(
      pipelineStatuses.map(async (status) => {
        const count = await Lead.count({ where: { ...leadWhere, status } });
        return {
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
        };
      })
    );

    // Lead Priority Breakdown
    const highPriorityLeads = await Lead.count({ where: { ...leadWhere, priority: "high" } });
    const mediumPriorityLeads = await Lead.count({ where: { ...leadWhere, priority: "medium" } });

    // Lead Source Breakdown
    const sources = ["website", "facebook", "instagram", "referral", "other"];
    const sourceBreakdown = await Promise.all(
      sources.map(async (source) => {
        const count = await Lead.count({ where: { ...leadWhere, source } });
        return { name: source, value: count };
      })
    );

    // Recent Activities (For Agent)
    const recentActivities = await Activity.findAll({
      where: { assignedTo: agentId },
      include: [{ model: Lead, as: "lead", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Upcoming Tasks
    const upcomingTasks = await Activity.findAll({
      where: {
        assignedTo: agentId,
        status: "pending",
        dueDate: { [Op.gte]: new Date() },
      },
      include: [{ model: Lead, as: "lead", attributes: ["id", "name"] }],
      order: [["dueDate", "ASC"]],
      limit: 5,
    });

    // Recent Lead Progress
    const recentLeadProgress = await LeadProgressLog.findAll({
      include: [
        {
          model: Lead,
          as: "Lead", // default association name
          where: isAgent ? { assignedAgent: agentId } : {},
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id", "name"],
        },
      ],
      order: [["timestamp", "DESC"]],
      limit: 15,
    });

    const formattedProgress = recentLeadProgress.map((log) => ({
      id: log.id,
      leadName: log.Lead?.name,
      status: log.status,
      notes: log.notes,
      timestamp: log.timestamp,
      agentName: log.updatedByUser?.name,
    }));

    // --- Property Real-Time Stats ---
    const allProperties = await Property.findAll({ attributes: ['price', 'status'] });
    const totalPropertyPortfolioValue = allProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const availableProperties = allProperties.filter(p => p.status === 'available').length;
    const soldProperties = allProperties.filter(p => p.status === 'sold').length;
    const rentedProperties = allProperties.filter(p => p.status === 'rented').length;

    res.json({
      success: true,
      data: {
        totalValue, // Active deals value
        totalPropertyPortfolioValue,
        totalProperties,
        availableProperties,
        soldProperties,
        rentedProperties,
        totalClients: totalClientsCount,
        totalExpectedRevenue,
        totalCollectedPayments,
        totalRemainingBalance,
        activeDeals: activeDeals.length,
        closedDeals: closedDeals.length,
        totalLeads,
        newLeads,
        contactedLeads,
        highPriorityLeads,
        mediumPriorityLeads,
        conversionRate: conversionRate.toFixed(1),
        leadsPerAgent,
        totalRevenue,
        revenueStats,
        sourceBreakdown,
        leadPipeline,
        recentActivities,
        upcomingTasks,
        pendingAssignments,
        recentLeadProgress: formattedProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
