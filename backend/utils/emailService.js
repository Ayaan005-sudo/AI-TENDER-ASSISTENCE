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
 */
async function sendConfirmationEmail(toEmail, tenderName, reverseTimeline, deadline) {
  const deadlineStr = typeof deadline === 'string' ? deadline : deadline?.toISOString().split('T')[0] || '';

  // Build HTML list of timeline tasks
  const timelineHtml = Array.isArray(reverseTimeline) && reverseTimeline.length > 0
    ? '<ul>' + reverseTimeline.map(item => {
      const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : (item.date || '');
      return `<li><strong>${item.task}:</strong> ${dateStr}</li>`;
    }).join('') + '</ul>'
    : '<p>No timeline tasks available.</p>';

  const htmlBody = `
    <h2>🗂️ Tender Saved: ${tenderName}</h2>
    <p><strong>Deadline:</strong> ${deadlineStr}</p>
    <h3>Reverse Timeline</h3>
    ${timelineHtml}
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

module.exports = { sendConfirmationEmail };

