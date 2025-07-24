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

            // Compute batch index based on total emotion logs (for deduping pings)
            int totalLogs = await _context.EmotionLogs
                .CountAsync(e => e.UserId == userId && e.ActivityId == activityId);
            int currentBatchIndex = (totalLogs - 10) / 10;

            var alreadyPinged = await _context.PingLogs.AnyAsync(p =>
                p.UserId == userId &&
                p.ActivityId == activityId &&
                p.PingBatchIndex == currentBatchIndex);

            if (alreadyPinged)
            {
                return new PingCheckResultDto { Pinged = false, Reason = $"Already pinged for batch {currentBatchIndex}" };
            }

            var negativeEmotions = new[] { "anger", "disgust", "sad", "fear" };
            int negativeCount = emotionLogs.Count(e => negativeEmotions.Contains(e.DetectedEmotion.ToLower()));

            if (negativeCount >= 5)
            {
                _context.PingLogs.Add(new PingLog
                {
                    UserId = userId,
                    ActivityId = activityId,
                    PingBatchIndex = currentBatchIndex
                });

                await _context.SaveChangesAsync();

                return new PingCheckResultDto
                {
                    Pinged = true,
                    Reason = "Ping triggered: at least 5 negative emotions in recent 10"
                };
            }

            return new PingCheckResultDto
            {
                Pinged = false,
                Reason = $"Only {negativeCount} negative emotions in recent 10. Minimum required: 5."
            };
        }

    }
}
