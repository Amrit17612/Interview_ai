const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../socket');

const getAllTickets = async (req, res, next) => {
  try {
    const { status, type, severity, category, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketDetail = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('userId', 'firstName lastName email');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    
    if (status === 'RESOLVED') {
      ticket.resolvedAt = new Date();
    }
    
    await ticket.save();

    // Notify user if resolved
    if (status === 'RESOLVED' && oldStatus !== 'RESOLVED') {
      const isBug = ticket.type === 'BUG';
      const notification = await Notification.create({
        userId: ticket.userId,
        type: isBug ? 'BUG_RESOLVED' : 'BUG_RESOLVED', // Actually, instructions say BUG_RESOLVED for resolved issues. We'll use BUG_RESOLVED or generic RESOLVED.
        title: isBug ? 'Bug Resolved' : 'Support Ticket Resolved',
        message: 'Your reported issue has been successfully resolved. Thank you for helping us improve the platform.',
        entityType: 'SUPPORT_TICKET',
        entityId: ticket._id
      });
      sendNotificationToUser(ticket.userId, notification);
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

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.messages.push({
      senderId: req.user.id,
      isAdmin: true,
      message
    });
    
    await ticket.save();

    // Notify the user about admin reply
    const notification = await Notification.create({
      userId: ticket.userId,
      type: 'SUPPORT_REPLY',
      title: 'Support Reply',
      message: `Admin replied to your support request #${ticket.ticketId}.`,
      entityType: 'SUPPORT_TICKET',
      entityId: ticket._id
    });
    sendNotificationToUser(ticket.userId, notification);

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTickets,
  getTicketDetail,
  updateTicketStatus,
  replyToTicket
};
