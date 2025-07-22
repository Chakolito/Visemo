using Microsoft.EntityFrameworkCore;
using VisemoServices.Data;
using VisemoServices.Model;
using VisemoServices.Dtos.Classroom;

namespace VisemoServices.Services
{
    public class ClassroomService : IClassroomService
    {
        private readonly DatabaseContext _context;

        public ClassroomService(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<ClassroomResponseDto> CreateClassroomAsync(string name, int teacherUserId)
        {
            var teacher = await _context.Users.FindAsync(teacherUserId);
            if (teacher == null || teacher.role?.ToLower() != "teacher")
                throw new Exception("Invalid teacher ID");

            var classroom = new Classroom
            {
                className = name,
                TeacherUserId = teacherUserId,
                Teacher = teacher
            };

            _context.Classrooms.Add(classroom);
            await _context.SaveChangesAsync();

            return new ClassroomResponseDto
            {
                Id = classroom.Id,
                className = classroom.className,
                TeacherUserId = teacherUserId,
                TeacherFullName = $"{teacher.firstName} {teacher.middleInitial}. {teacher.lastName}"
            };
        }

        public async Task<IEnumerable<Classroom>> GetAllClassroomsByUserIdAsync(int userId)
        {
            return await _context.Classrooms
                .Where(c =>
                    c.TeacherUserId == userId ||
                    c.EnrolledStudents.Any(s => s.Id == userId))
                .Include(c => c.Activities)
                .Include(c => c.Teacher)
                .ToListAsync();
        }

        public async Task<Classroom> GetClassroomByIdAsync(int classroomId, int userId)
        {
            return await _context.Classrooms
                .Where(c =>
                    c.Id == classroomId &&
                    (c.TeacherUserId == userId ||
                     c.EnrolledStudents.Any(s => s.Id == userId)))
                .Include(c => c.Activities)
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync();
        }

        public async Task<Classroom> UpdateClassroomAsync(int id, string newName)
        {
            var classroom = await _context.Classrooms.FindAsync(id);
            if (classroom == null) return null;

            classroom.className = newName;
            await _context.SaveChangesAsync();

            return classroom;
        }

        public async Task DeleteClassroomAsync(int id)
        {
            var classroom = await _context.Classrooms.FindAsync(id);
            if (classroom != null)
            {
                _context.Classrooms.Remove(classroom);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<(bool Success, string Message)> AddUserToClassroomAsync(int classroomId, string idNumber)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.EnrolledStudents)
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null)
                return (false, "Classroom not found");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.idNumber == idNumber);
            if (user == null)
                return (false, "User with this ID number was not found");

            if (classroom.EnrolledStudents.Any(u => u.Id == user.Id))
                return (false, "User is already in this classroom");

            classroom.EnrolledStudents.Add(user);
            await _context.SaveChangesAsync();

            return (true, "User added to classroom successfully");
        }

        public async Task<IEnumerable<object>?> GetUsersInClassroomAsync(int classroomId)
        {
            var classroom = await _context.Classrooms
                                          .Include(c => c.EnrolledStudents)
                                          .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null) return null;

            return classroom.EnrolledStudents.Select(u => new
            {
                u.Id,
                u.Email,
                u.firstName,
                u.lastName,
                u.idNumber,
                u.role
            });
        }

        public async Task<(bool Success, string Message)> RemoveUserFromClassroomAsync(int classroomId, string idNumber)
        {
            var classroom = await _context.Classrooms
                                          .Include(c => c.EnrolledStudents)
                                          .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null)
                return (false, "Classroom not found");

            var user = classroom.EnrolledStudents.FirstOrDefault(u => u.idNumber == idNumber);
            if (user == null)
                return (false, "User with this ID number was not found in this classroom");

            classroom.EnrolledStudents.Remove(user);
            await _context.SaveChangesAsync();

            return (true, "User removed from classroom successfully");
        }

        public async Task<IEnumerable<object>> SearchUsersNotInClassroom(int classroomId, string partialIdNumber)
        {
            var classroom = await _context.Classrooms
                                          .Include(c => c.EnrolledStudents)
                                          .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null)
                return Enumerable.Empty<object>();

            var userIdsInClassroom = classroom.EnrolledStudents.Select(u => u.Id).ToHashSet();

            var users = await _context.Users
                .Where(u => !userIdsInClassroom.Contains(u.Id) &&
                            u.idNumber.Contains(partialIdNumber) &&
                            u.role == "Student")
                .Select(u => new
                {
                    u.Id,
                    u.firstName,
                    u.lastName,
                    u.Email,
                    u.idNumber
                })
                .ToListAsync();

            return users;
        }
    }
}
