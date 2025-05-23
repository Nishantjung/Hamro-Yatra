const { Events, Users, Plans, Payments, Expenses, Rooms } = require("../models");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const createEvent = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(403).json("Users is not logged in.");
  jwt.verify(token, "secretKey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid");
    try {
      const event = await Events.findOne({
        where: { host: userInfo.id, completionStatus: "running" },
      });
      if (event) {
        return res.status(403).json("Users already has an event running.");
      } else {
        await Events.create({
          destination: req.body.destination,
          eventType: req.body.type,
          startDate: req.body.start,
          endDate: req.body.end,
          members: [userInfo.id],
          eventDescription: req.body.desc,
          host: userInfo.id,
          destinationImage: req.body.destPic,
        });
        const currentEvent = await Events.findOne({
          where: { host: userInfo.id },
        });
        await Rooms.create({
          event_id: currentEvent.id,
          members: currentEvent.members,
        });
        return res.status(200).json("Event created successfully.");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  });
};

const editEvents = async (req, res) => {
  try {
    await Events.update(
      {
        destination: req.body.destination,
        eventType: req.body.type,
        startDate: req.body.start,
        endDate: req.body.end,
        eventDescription: req.body.desc,
        destinationImage: req.body.destPic,
      },
      {
        where: { id: req.query.eventId },
      }
    );
    return res.status(200).json("Updated");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const cancelEvent = async (req, res) => {
  try {
    await Events.destroy(
      {
        where: { id: req.query.eventId },
      }
    );
    return res.status(200).json("Events has been cancelled");
  } catch (error) {
    console.log(error)
    return res.status(500).json(error);
  }
};
const setIntake = async (req, res) => {
  try {
    await Events.update(
      { status: req.body.status },
      { where: { id: req.query.eventId } }
    );
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getEvents = async (req, res) => {
  try {
    const event = await Events.findAll({
      include: {
        model: Users,
        attributes: ["username", "profilePicture"],
        where: {
          id: Sequelize.col("Events.host"),
        },
      },
    });
    return res.status(200).json(event);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const getUserEvents = async (req, res) => {
  try {
    const events = await Events.findAll({
      where: { host: req.query.userId },
      include: {
        model: Users,
        attributes: ["username", "profilePicture"],
        where: {
          id: Sequelize.col("Events.host"),
        },
      },
    });
    if (!events) return res.status(404).json("No events found");
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getParticipatedEvents = async (req, res) => {
  try {
    const events = await Events.findAll({
      where: Sequelize.literal(`JSON_CONTAINS(members,'${req.query.id}')`),
      include: {
        model: Users,
        attributes: ["id", "username", "profilePicture"],
      },
    });
    if (!events) return res.status(500).json("No Events found");
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Events.findOne({
      where: { id: req.params.eventId },
    });
    return res.status(200).json(event);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const addMember = async (req, res) => {
  try {
    const event = await Events.findOne({
      where: { id: req.query.eventId },
    });
    const members = event.members || []; // retrieve existing members or create an empty array
    members.push(req.body.userId); // append new member to the array
    await Events.update(
      { members: members },
      { where: { id: req.query.eventId } }
    ); // update the members column in the database
    await Rooms.update(
      { members: members },
      { where: { event_id: req.query.eventId } }
    );
    return res.status(200).json("Member added successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await Rooms.findOne({
      where: { id: req.query.roomId },
    });
    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const removeMember = async (req, res) => {
  try {
    const event = await Events.findOne({ where: { id: req.query.eventId } });
    const members = event.members || []; // retrieve existing members or create an empty array
    const index = members.indexOf(req.body.userId);
    if (index > -1) {
      members.splice(index, 1); // remove the member from the array
      await Events.update(
        { members: members },
        { where: { id: req.query.eventId } }
      ); // update the members column in the database
      return res.status(200).json("Member removed successfully");
    } else {
      return res.status(400).json("Member not found in event");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const addPlan = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(403).json("Users is not logged in.");
  jwt.verify(token, "secretKey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid");
    try {
      await Plans.create({
        plan_date: req.body.date,
        plan_note: req.body.note,
        eventId: req.query.eventId,
      });
      return res.status(200).json("Plan added");
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

const getPlans = async (req, res) => {
  try {
    const plan = await Plans.findAll({
      where: { eventId: req.query.eventId },
      order: [["plan_date", "ASC"]],
    });
    return res.status(200).json(plan);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const updatePlan = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(403).json("Users is not logged in.");
  jwt.verify(token, "secretKey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid");
    try {
      await Plans.update(
        {
          plan_note: req.body.note,
        },
        { where: { id: req.query.planId } }
      );
      return res.status(200).json("Updated");
    } catch (error) {
      return res.status(500).json("Could not be updated.");
    }
  });
};

const makePayment = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(403).json("Users is not logged in.");
  jwt.verify(token, "secretKey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid");  
    try {
      await Payments.create({
        event_id: req.query.eventId,
        user_id: userInfo.id,
        amount: req.body.amount,
      });
      return res.status(200).json('Payment registered.');
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payments.findAll({
      where: { event_id: req.query.eventId },
      include: {
        model: Users,
        attributes: ["id", "username", "profilePicture"],
      },
    });
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getPayments = async (req, res) => {
  try {
    const payment = await Payments.findAll({
      include: [
        {
          model: Users,
          attributes: ["id", "username", "profilePicture"],
        },
        {
          model: Events,
          attributes: ["id", "destination", "eventType", "destinationImage"],
        },
      ],
    });
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const addExpense = async (req, res) => {
  try {
    await Expenses.create({
      expense_title: req.body.title,
      amount: req.body.amount,
      remarks: req.body.remarks,
      event_id: req.query.eventId,
    });
    return res.status(200).json("Expense Added Successfully");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deleteExpense = async (req, res) => {
  try {
    await Expenses.destroy({
      where: {
        id: req.query.expenseId,
      },
    });
    return res.status(200).json("Expense has been deleted");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getExpenses = async (req, res) => {
  try {
    const expense = await Expenses.findAll({
      where: { event_id: req.query.eventId },
    });
    return res.status(200).json(expense);
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = {
  createEvent,
  getEvents,
  getEvent,
  getUserEvents,
  getParticipatedEvents,
  addMember,
  getMembers,
  removeMember,
  addPlan,
  getPlans,
  updatePlan,
  makePayment,
  getPayment,
  getPayments,
  addExpense,
  deleteExpense,
  getExpenses,
  setIntake,
  editEvents,
  cancelEvent,
};
