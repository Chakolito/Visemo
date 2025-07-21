using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisemoServices.Model
{
    public class Classroom
    {
        public int Id { get; set; }

        [MaxLength(255)]
        public string className { get; set; }

        // ✅ The teacher who created this classroom (1-to-many)
        public int TeacherUserId { get; set; }

        [ForeignKey(nameof(TeacherUserId))]
        public User Teacher { get; set; }

        // ✅ Students enrolled in this classroom (many-to-many)
        public List<User> EnrolledStudents { get; set; } = new();

        public List<Activity> Activities { get; set; } = new();
    }
}
