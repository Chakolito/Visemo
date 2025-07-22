namespace VisemoServices.Dtos.Classroom
{

    public class ActivityDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Timer { get; set; }
    }
    public class ClassroomResponseDto
    {
        public int Id { get; set; }
        public string className { get; set; }
        public int TeacherUserId { get; set; }
        public string TeacherFullName { get; set; }

        public IEnumerable<ActivityDto> Activities { get; set; }
    }
}
