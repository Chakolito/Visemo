namespace VisemoServices.Dtos.Classroom
{
    public class ClassroomResponseDto
    {
        public int Id { get; set; }
        public string className { get; set; }
        public int TeacherUserId { get; set; }
        public string TeacherFullName { get; set; }
    }
}
