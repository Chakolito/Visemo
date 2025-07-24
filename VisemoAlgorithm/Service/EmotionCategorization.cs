using VisemoAlgorithm.Model;
using VisemoAlgorithm.Data;
using Microsoft.EntityFrameworkCore;

namespace VisemoAlgorithm.Service
{
    public class EmotionCategorizationService
    {
        private readonly VisemoAlgoDbContext _context;

        public EmotionCategorizationService(VisemoAlgoDbContext context)
        {
            _context = context;
        }

        public async Task CategorizeAndStore(string emotion, int userId, int activityId)
        {
            var userEmotion = await _context.UserEmotions
                .FirstOrDefaultAsync(e => e.UserId == userId && e.ActivityId == activityId);

            if (userEmotion == null)
            {
                userEmotion = new UserEmotion
                {
                    UserId = userId,
                    ActivityId = activityId
                };

                _context.UserEmotions.Add(userEmotion);
            }

            // Categorize and increment
            switch (emotion.ToLower())
            {
                case "happy":
                case "content":
                    userEmotion.PositiveEmotions++;
                    break;
                case "anger":
                case "disgust":
                case "sad":
                case "fear":
                    userEmotion.NegativeEmotions++;
                    break;
                case "surprise":
                case "neutral":
                    userEmotion.NeutralEmotions++;
                    break;
                default:
                    break; // unknown emotion
            }

            var log = new EmotionLog
            {
                UserId = userId,
                ActivityId = activityId,
                DetectedEmotion = emotion,
                Timestamp = DateTime.UtcNow
            };

            _context.EmotionLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
