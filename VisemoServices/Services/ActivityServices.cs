using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using VisemoAlgorithm.Data;
using VisemoAlgorithm.Model;
using VisemoAlgorithm.Dtos;
using VisemoAlgorithm.Service;
using VisemoAlgorithm.Services;
using VisemoServices.Data;
using VisemoServices.Model;
using VisemoServices.Dtos.Activity;

namespace VisemoServices.Services
{
    public class ActivityService : IActivityService
    {
        private readonly DatabaseContext _context;
        private readonly VisemoAlgoDbContext _dbContext;
        private readonly SelfAssessmentService _selfAssessmentService;
        private readonly CodeEditorServices _codeEditorServices;
        private readonly SentimentScoringService _sentimentScoringService;
        private readonly PingService _pingService;

        public ActivityService(DatabaseContext context, VisemoAlgoDbContext dbContext, SelfAssessmentService selfAssessmentService, CodeEditorServices codeEditorServices, SentimentScoringService sentimentScoringService, PingService pingService)
        {
            _context = context;
            _dbContext = dbContext;
            _selfAssessmentService = selfAssessmentService;
            _codeEditorServices = codeEditorServices;
            _sentimentScoringService = sentimentScoringService;
            _pingService = pingService;
        }

        public async Task<Activity> CreateActivityAsync(int classroomId, string name, TimeSpan timer, string instruction)
        {
            var activity = new Activity
            {
                Name = name,
                Timer = timer,
                ClassroomId = classroomId,
                Instruction = instruction,
                IsStarted = false
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return activity;
        }

        public async Task DeleteActivity( int activityId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity != null)
            {
                _context.Activities.Remove(activity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Activity>> GetActivitiesByClassroomAsync(int classroomId)
        {
            return await _context.Activities
                .Where(a => a.ClassroomId == classroomId)
                .ToListAsync();
        }

        public async Task<Activity> GetActivityById(int id)
        {
            return await _context.Activities.FindAsync(id);
        }

        public async Task DeleteActivityAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity != null)
            {
                _context.Activities.Remove(activity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> StartActivity(int activityId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null || activity.IsStarted || activity.IsEnded)
                return false; // Already started or ended

            activity.IsStarted = true;
            activity.StartTime = DateTime.UtcNow;
            activity.CreatedAt = DateTime.UtcNow; // reset the start time
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> EndActivity(int activityId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null || activity.IsEnded)
                return false;

            activity.IsStarted = false;
            activity.IsEnded = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> SubmitSelfAssessment(int userId, int activityId, string reasons, bool hasConcerns)
        {
            try
            {
                var result = await _selfAssessmentService.SaveSelfAssessment(reasons, hasConcerns, userId, activityId);
                return (true, "Self-assessment saved successfully.");
            }
            catch (Exception ex)
            {
                return (false, $"Failed to save self-assessment: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> SubmitBuild(bool isSuccessful, int userId, int activityId)
        {
            try
            {
                var result = await _codeEditorServices.SubmitBuild(isSuccessful, userId, activityId);
                return (true, "Build saved successfully.");
            }
            catch (Exception ex)
            {
                return (false, $"Failed to save build: {ex.Message}");
            }
        }

        public async Task<SubmittedActivities> SubmitStudentCode(string Code, int userId, int activityId)
        {
            var existingSubmission = await _context.SubmittedActivities
                .FirstOrDefaultAsync(sa => sa.UserId == userId && sa.ActivityId == activityId);

            if (existingSubmission != null)
            {
                // Update existing submission
                existingSubmission.code = Code;
            }
            else
            {
                // Create new submission
                existingSubmission = new SubmittedActivities
                {
                    code = Code,
                    UserId = userId,
                    ActivityId = activityId
                };
                _context.SubmittedActivities.Add(existingSubmission);
            }

            await _context.SaveChangesAsync();
            return existingSubmission;
        }

        public async Task<SentimentReport> GenerateSentimentReport(int userId, int activityId)
        {
            return await _sentimentScoringService.GenerateSentimentReport(userId, activityId);
        }

        public async Task<bool> GetStudentStatus(int userId, int activityId)
        {
            var submission = await _context.SubmittedActivities
                .FirstOrDefaultAsync(sa => sa.UserId == userId && sa.ActivityId == activityId);

            return submission != null && !string.IsNullOrWhiteSpace(submission.code);
        }

        public async Task<string?> GetCode(int userId, int activityId)
        {
            var submission = await _context.SubmittedActivities
                .FirstOrDefaultAsync(sa => sa.UserId == userId && sa.ActivityId == activityId);

            return submission?.code;
        }

        public async Task<PingCheckResultDto> CheckForPing(int userId, int activityId)
        {
            return await _pingService.CheckForPing(userId, activityId);
        }

        public async Task<ActivityStatusDto> GetActivityStatus(int activityId, int userId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null)
                return null;

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            // Already ended? Return status directly.
            if (activity.IsEnded)
            {
                return new ActivityStatusDto
                {
                    ActivityId = activityId,
                    IsStarted = false,
                    RemainingTime = TimeSpan.Zero,
                    HasExpired = true
                };
            }

            if (!activity.IsStarted)
            {
                return new ActivityStatusDto
                {
                    ActivityId = activityId,
                    IsStarted = false,
                    RemainingTime = activity.Timer,
                    HasExpired = false
                };
            }

            // Calculate elapsed time based on globally started timer
            var elapsedTime = DateTime.UtcNow - activity.CreatedAt;
            var timeRemaining = activity.Timer - elapsedTime;

            if (timeRemaining <= TimeSpan.Zero)
            {
                // Only auto-submit for students
                if (user.role == "Student")
                {
                    await AutoSubmitIfExpired(userId, activityId);
                }

                // End the activity globally (teacher side also gets this result)
                await EndActivity(activityId);

                return new ActivityStatusDto
                {
                    ActivityId = activityId,
                    IsStarted = false,
                    RemainingTime = TimeSpan.Zero,
                    HasExpired = true
                };
            }

            return new ActivityStatusDto
            {
                ActivityId = activityId,
                IsStarted = true,
                RemainingTime = timeRemaining,
                HasExpired = false
            };
        }


        public async Task<bool> AutoSubmitIfExpired(int activityId, int userId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null || activity.StartTime == null)
                return false;

            var now = DateTime.UtcNow;
            var hasExpired = now >= activity.StartTime.Value + activity.Timer;

            if (!hasExpired)
                return false;

            bool alreadySubmitted = await _context.SubmittedActivities
                .AnyAsync(s => s.ActivityId == activityId && s.UserId == userId);

            if (!alreadySubmitted)
            {
                var submission = new SubmittedActivities
                {
                    ActivityId = activityId,
                    UserId = userId,
                    code = "// Auto-submitted due to time expiration",
                    SubmittedAt = now,
                    IsAutoSubmitted = true
                };

                _context.SubmittedActivities.Add(submission);
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> StartStudentActivitySession(int userId, int activityId)
        {
            var existingSession = await _dbContext.ActivitySessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.ActivityId == activityId);

            if (existingSession != null)
                return false; // Already started

            var session = new ActivitySession
            {
                UserId = userId,
                ActivityId = activityId,
                StartTime = DateTime.UtcNow
            };

            _dbContext.ActivitySessions.Add(session);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task AcknowledgePing(int userId, int activityId, int pingBatchIndex)
        {
            await _pingService.AcknowledgePing(userId, activityId, pingBatchIndex);
        }

        public async Task<bool> HasAcknowledgedPing(int userId, int activityId, int pingBatchIndex)
        {
            return await _pingService.HasAcknowledgedPing(userId, activityId, pingBatchIndex);
        }
    }

}
