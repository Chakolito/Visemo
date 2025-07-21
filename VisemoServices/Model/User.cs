using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisemoServices.Model
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(255)]
        public string? Email { get; set; }

        [Required]
        public string? Password { get; set; }

        [Required, MaxLength(100)]
        public string? firstName { get; set; }

        [Required, MaxLength(1)]
        public string? middleInitial { get; set; }

        [Required, MaxLength(100)]
        public string? lastName { get; set; }

        [Required, MaxLength(50)]
        public string? idNumber { get; set; }

        [Required, MaxLength(10)]
        public string? role { get; set; }

        // For classrooms a student is enrolled in
        public List<Classroom> EnrolledClassrooms { get; set; } = new();

        // For classrooms a teacher created
        public List<Classroom> ClassroomsAsTeacher { get; set; } = new();
    }
}
