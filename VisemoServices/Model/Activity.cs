using System.ComponentModel.DataAnnotations;

namespace VisemoServices.Model
{
    public class Activity
    {
        public int Id { get; set; }
        [MaxLength(255)]
        public string Name { get; set; }
        public TimeSpan Timer { get; set; }  // Duration of the activity
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Instruction { get; set; }
        public bool IsStarted { get; set; } = false;
        public DateTime? StartTime { get; set; }
        public bool IsEnded { get; set; } = false;

        // Foreign key to Classroom
        public int ClassroomId { get; set; }
    }

}
