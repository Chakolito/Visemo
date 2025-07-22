using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using VisemoAlgorithm.Data;
using VisemoAlgorithm.Model;
using VisemoAlgorithm.Service;
using VisemoAlgorithm.Services;
using VisemoServices.Data;
using VisemoServices.Model;

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

        public async Task<(bool Success, string Message)> StartActivity(int activityId, int userId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null) return (false, "Activity not found");

            if (activity.IsStarted) return (false, "Activity already started");

            activity.IsStarted = true;
            await _context.SaveChangesAsync();

            // Save session to Algorithm DB
            var session = new ActivitySession
            {
                ActivityId = activityId,
                UserId = userId,
                StartTime = DateTime.UtcNow
            };

            await _dbContext.ActivitySessions.AddAsync(session);
            await _dbContext.SaveChangesAsync();

            return (true, "Activity started successfully");
        }

        public async Task<(bool Success, string Message)> StopActivity(int activityId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null) return (false, "Activity not found");

            if (!activity.IsStarted)
                return (false, "Activity is not currently running");

            activity.IsStarted = false;
            await _context.SaveChangesAsync();

            return (true, "Activity stopped successfully");
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
            var submittedActivity = new SubmittedActivities
            {
                code = Code,
                UserId = userId,
                ActivityId = activityId
            };

            _context.SubmittedActivities.Add(submittedActivity);
            await _context.SaveChangesAsync();

            return submittedActivity;
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

        public async Task<bool> CheckForPing(int userId, int activityId)
        {
            return await _pingService.CheckForPing(userId, activityId);
        }

        public async Task<(bool IsOngoing, int TimeRemainingSeconds)> GetActivityStatusAsync(int userId, int activityId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null || !activity.IsStarted) return (false, 0);

            var session = await _dbContext.ActivitySessions
                .FirstOrDefaultAsync(s => s.ActivityId == activityId && s.UserId == userId);

            if (session == null) return (false, 0);

            var timePassed = DateTime.UtcNow - session.StartTime;
            var remaining = activity.Timer - timePassed;

            if (remaining <= TimeSpan.Zero)
            {
                // Stop activity and auto-submit code
                await StopActivity(activityId);

                var code = await GetCode(userId, activityId);
                if (string.IsNullOrWhiteSpace(code))
                {
                    // Assume empty code submission if none was typed
                    code = "";
                }

                await SubmitStudentCode(code, userId, activityId);

                return (false, 0); // Timer expired
            }

            return (true, (int)remaining.TotalSeconds);
        }
    }

}
