const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../socket');

const createTicket = async (req, res, next) => {
  try {
    const { type, category, subject, description, severity, pageUrl, deviceInfo, browserInfo } = req.body;
    
    let attachments = [];
    if (req.file) {
      attachments.push(`/uploads/${req.file.filename}`);
    }

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      type: type || 'SUPPORT',
      category,
      subject,
      description,
      severity: severity || 'LOW',
      attachments,
      pageUrl,
      deviceInfo,
      browserInfo
    });

    const notifType = ticket.type === 'BUG' ? 'BUG_SUBMITTED' : 'SUPPORT_SUBMITTED';
    const notifTitle = ticket.type === 'BUG' ? 'Bug Report Submitted' : 'Support Request Submitted';
    const notifMessage = ticket.type === 'BUG'
      ? "Your bug report has been successfully submitted. Our support team will review your request and respond as soon as possible."
      : "Support request submitted successfully. Our support team will review your request and respond as soon as possible.";

    const notification = await Notification.create({
      userId: req.user.id,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
      entityType: 'SUPPORT_TICKET',
      entityId: ticket._id
    });

    // Send real-time notification
    sendNotificationToUser(req.user.id, notification);

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketDetail = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found or unauthorized.' });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const replyToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found or unauthorized.' });
    }

    ticket.messages.push({
      senderId: req.user.id,
      isAdmin: false,
      message
    });
    
    await ticket.save();

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketDetail,
  replyToTicket
};
