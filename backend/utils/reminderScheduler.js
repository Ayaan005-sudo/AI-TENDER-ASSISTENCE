// backend/utils/reminderScheduler.js
// Simple reminder scheduler using node-cron
// Scans active tenders and sends reminder emails for upcoming tasks.

const cron = require('node-cron');
const Tender = require('../models/Tender');
const { sendReminderEmail } = require('./emailService');

/**
 * Calculate the difference in whole days between two dates.
 * Returns a positive number if the target date is after today.
 */
function daysDiff(targetDate, today) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((utcTarget - utcToday) / msPerDay);
}

/**
 * Check all active (non‑expired) tenders and send reminder emails for tasks that are
 * exactly 7, 3, or 1 day(s) away.
 */
async function checkAndSendReminders() {
  try {
    const today = new Date(); // only date part is used
    const tenders = await Tender.find({ isExpired: false });
    let reminderCount = 0;

    for (const tender of tenders) {
      // Safety check: skip if the actual deadline has already passed,
      // regardless of the stored isExpired flag (handles stale data)
      if (tender.deadline && new Date(tender.deadline) < today) {
        continue;
      }

      if (!Array.isArray(tender.reverseTimeline)) continue;
      for (const item of tender.reverseTimeline) {
        if (!item.date) continue;
        const diff = daysDiff(new Date(item.date), today);
        if ([7, 3, 1].includes(diff)) {
          await sendReminderEmail(tender.userEmail, tender.tenderName, item.task, item.date);
          console.log(`Reminder sent → Tender: ${tender.tenderName}, Task: ${item.task}, Due: ${new Date(item.date).toISOString().split('T')[0]}, In ${diff} day(s)`);
          reminderCount++;
        }
      }
    }

    if (reminderCount === 0) {
      console.log('No reminders due today');
    }
  } catch (err) {
    console.error('Error in reminder scheduler:', err);
  }
}

/**
 * Start a cron job that runs daily at 09:00 server time.
 */
function startReminderScheduler() {
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily reminder check at', new Date().toISOString());
    checkAndSendReminders();
  });
  console.log('Reminder scheduler started');
}

module.exports = { checkAndSendReminders, startReminderScheduler };
