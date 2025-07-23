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

            var emotions = await _context.UserEmotions
                .Where(e => e.UserId == userId && e.ActivityId == activityId)
                .OrderByDescending(e => e.Id)
                .Take(100)
                .ToListAsync();

            if (!emotions.Any())
            {
                return new PingCheckResultDto { Pinged = false, Reason = "No emotion data found" };
            }

            var emotionList = new List<string>();
            foreach (var e in emotions.OrderBy(e => e.Id))
            {
                emotionList.AddRange(Enumerable.Repeat("positive", e.PositiveEmotions));
                emotionList.AddRange(Enumerable.Repeat("negative", e.NegativeEmotions));
                emotionList.AddRange(Enumerable.Repeat("neutral", e.NeutralEmotions));
            }

            int totalEmotions = emotionList.Count;
            if (totalEmotions < 20)
            {
                return new PingCheckResultDto { Pinged = false, Reason = $"Only {totalEmotions} total emotions. Minimum required: 20." };
            }

            int currentBatchIndex = (totalEmotions - 10) / 10;

            var alreadyPinged = await _context.PingLogs.AnyAsync(p =>
                p.UserId == userId &&
                p.ActivityId == activityId &&
                p.PingBatchIndex == currentBatchIndex);

            if (alreadyPinged)
            {
                return new PingCheckResultDto { Pinged = false, Reason = $"Already pinged for batch {currentBatchIndex}" };
            }

            var recent10 = emotionList.Skip(totalEmotions - 10).Take(10).ToList();
            int negativeCount = recent10.Count(e => e == "negative");

            if (negativeCount >= 5)
            {
                _context.PingLogs.Add(new PingLog
                {
                    UserId = userId,
                    ActivityId = activityId,
                    PingBatchIndex = currentBatchIndex
                });
                await _context.SaveChangesAsync();

                return new PingCheckResultDto { Pinged = true, Reason = "Ping triggered: at least 5 negative emotions in recent 10" };
            }

            return new PingCheckResultDto
            {
                Pinged = false,
                Reason = $"Only {negativeCount} negative emotions in recent 10. Minimum required: 5."
            };
        }

    }
}
