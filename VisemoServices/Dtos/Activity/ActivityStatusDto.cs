namespace VisemoServices.Dtos.Activity
{
    public class ActivityStatusDto
    {
        public int ActivityId { get; set; }
        public bool IsStarted { get; set; }
        public TimeSpan RemainingTime { get; set; }
        public bool HasExpired { get; set; }
    }
}
