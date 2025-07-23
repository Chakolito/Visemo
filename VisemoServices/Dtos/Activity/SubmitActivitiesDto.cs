namespace VisemoServices.Dtos.Activity
{
    public class SubmitActivitiesDto
    {
        public string Code { get; set; }
        public int UserId { get; set; }
        public int ActivityId { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public bool IsAutoSubmitted { get; set; } = false;
    }
}
