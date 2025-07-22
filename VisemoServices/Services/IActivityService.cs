using VisemoAlgorithm.Model;
using VisemoServices.Model;
namespace VisemoServices.Services


{
    public interface IActivityService
    {
        Task<Activity> CreateActivityAsync(int classroomId, string name, TimeSpan timer, string instruction);
        Task<IEnumerable<Activity>> GetActivitiesByClassroomAsync(int classroomId);
        Task<Activity> GetActivityById(int id);
        Task DeleteActivityAsync(int id);
        Task<(bool Success, string Message)> StartActivity(int activityId, int userId);
        Task<(bool Success, string Message)> StopActivity(int activityId);
        Task<(bool Success, string Message)> SubmitSelfAssessment(int userId, int activityId, string reasons, bool hasConcerns);
        Task<(bool Success, string Message)> SubmitBuild(bool isSuccessful, int userId, int activityId);
        Task<SubmittedActivities> SubmitStudentCode(string Code, int userId, int activityId);
        Task<SentimentReport> GenerateSentimentReport(int userId, int activityId);
        Task<bool> GetStudentStatus(int userId, int activityId);
        Task<string?> GetCode(int userId, int activityId);
        Task<bool> CheckForPing(int userId, int activityId);
        Task<(bool IsOngoing, int TimeRemainingSeconds)> GetActivityStatusAsync(int userId, int activityId);
    }

}
