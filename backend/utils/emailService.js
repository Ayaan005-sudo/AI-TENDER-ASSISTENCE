require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure transporter using Gmail credentials from environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a confirmation email after a tender is saved.
 * @param {string} toEmail - Recipient email address.
 * @param {string} tenderName - Name of the saved tender.
 * @param {Array} reverseTimeline - Array of tasks with dates (objects with task and date).
 * @param {Date|string} deadline - Tender submission deadline.
 * @param {string} [statusMessage] - Optional custom status message to display instead of timeline.
 */
async function sendConfirmationEmail(toEmail, tenderName, reverseTimeline, deadline, statusMessage) {
  const deadlineStr = typeof deadline === 'string' ? deadline : deadline?.toISOString().split('T')[0] || '';

  // Build HTML list of timeline tasks
  const timelineHtml = Array.isArray(reverseTimeline) && reverseTimeline.length > 0
    ? '<ul>' + reverseTimeline.map(item => {
      const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : (item.date || '');
      return `<li><strong>${item.task}:</strong> ${dateStr}</li>`;
    }).join('') + '</ul>'
    : '<p>No timeline tasks available.</p>';

  // Choose message content: custom statusMessage takes precedence
  const messageContent = statusMessage ? `<p>${statusMessage}</p>` : timelineHtml;

  const htmlBody = `
    <h2>🗂️ Tender Saved: ${tenderName}</h2>
    <p><strong>Deadline:</strong> ${deadlineStr}</p>
    <h3>Details</h3>
    ${messageContent}
    <p>Best of luck with your submission!</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Tender Saved: ${tenderName}`,
    html: htmlBody,
  };

  // Send mail, let any errors propagate to caller for handling
  await transporter.sendMail(mailOptions);
}

// Send reminder email for upcoming task
async function sendReminderEmail(toEmail, tenderName, task, date) {
  const dateStr = typeof date === 'string' ? date.split('T')[0] : date?.toISOString().split('T')[0] || '';
  const htmlBody = `
    <h2>⏰ Reminder: ${task} due soon for ${tenderName}</h2>
    <p>Task: <strong>${task}</strong></p>
    <p>Due Date: <strong>${dateStr}</strong></p>
    <p>Please make sure to complete this task on time.</p>
  `;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Reminder: ${task} due soon for ${tenderName}`,
    html: htmlBody,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationEmail, sendReminderEmail };


