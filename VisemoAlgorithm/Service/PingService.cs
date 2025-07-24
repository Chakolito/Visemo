using Microsoft.EntityFrameworkCore;
using VisemoAlgorithm.Data;
using VisemoAlgorithm.Model;
using VisemoAlgorithm.Dtos;

namespace VisemoAlgorithm.Services
{
    public class PingService
    {
        private readonly VisemoAlgoDbContext _context;

        public PingService(VisemoAlgoDbContext context)
        {
            _context = context;
        }

        public async Task<PingCheckResultDto> CheckForPing(int userId, int activityId)
        {
            var session = await _context.ActivitySessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.ActivityId == activityId);

            if (session == null)
            {
                return new PingCheckResultDto { Pinged = false, Reason = "No activity session found" };
            }

            var elapsed = DateTime.UtcNow - session.StartTime;
            if (elapsed.TotalMinutes < 10)
            {
                return new PingCheckResultDto { Pinged = false, Reason = "Activity has not yet passed 10-minute threshold" };
            }

            var emotionLogs = await _context.EmotionLogs
                .Where(e => e.UserId == userId && e.ActivityId == activityId)
                .OrderByDescending(e => e.Timestamp)
                .Take(10)
                .ToListAsync();

            if (emotionLogs.Count < 10)
            {
                return new PingCheckResultDto { Pinged = false, Reason = $"Only {emotionLogs.Count} recent emotion logs. Minimum required: 10." };
            }

            int totalLogs = await _context.EmotionLogs
                .CountAsync(e => e.UserId == userId && e.ActivityId == activityId);
            int currentBatchIndex = (totalLogs - 10) / 10;

            var existingPing = await _context.PingLogs
                .FirstOrDefaultAsync(p =>
                    p.UserId == userId &&
                    p.ActivityId == activityId &&
                    p.PingBatchIndex == currentBatchIndex);

            if (existingPing != null)
            {
                return new PingCheckResultDto
                {
                    Pinged = false,
                    Reason = $"Ping already triggered for batch {currentBatchIndex}",
                    Acknowledged = existingPing.Acknowledged,
                    PingBatchIndex = currentBatchIndex
                };
            }

            var negativeEmotions = new[] { "anger", "disgust", "sad", "fear" };
            int negativeCount = emotionLogs.Count(e => negativeEmotions.Contains(e.DetectedEmotion.ToLower()));

            if (negativeCount >= 5)
            {
                _context.PingLogs.Add(new PingLog
                {
                    UserId = userId,
                    ActivityId = activityId,
                    PingBatchIndex = currentBatchIndex,
                    Acknowledged = false  // default value when ping is first created
                });

                await _context.SaveChangesAsync();

                return new PingCheckResultDto
                {
                    Pinged = true,
                    Reason = "Ping triggered: at least 5 negative emotions in recent 10",
                    Acknowledged = false,
                    PingBatchIndex = currentBatchIndex
                };
            }

            return new PingCheckResultDto   
            {
                Pinged = false,
                Reason = $"Only {negativeCount} negative emotions in recent 10. Minimum required: 5.",
                Acknowledged = false
            };
        }

        // Acknowledge a specific ping batch
        public async Task AcknowledgePing(int userId, int activityId, int pingBatchIndex)
        {
            var ping = await _context.PingLogs.FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.ActivityId == activityId &&
                p.PingBatchIndex == pingBatchIndex);

            if (ping != null && !ping.Acknowledged)
            {
                ping.Acknowledged = true;
                await _context.SaveChangesAsync();
            }
        }

        // Check if a ping batch has been acknowledged
        public async Task<bool> HasAcknowledgedPing(int userId, int activityId, int pingBatchIndex)
        {
            var ping = await _context.PingLogs.FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.ActivityId == activityId &&
                p.PingBatchIndex == pingBatchIndex);

            return ping?.Acknowledged ?? false;
        }

    }
}
