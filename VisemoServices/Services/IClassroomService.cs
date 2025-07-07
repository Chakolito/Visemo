﻿using VisemoServices.Dtos.Classroom;
using VisemoServices.Model;

namespace VisemoServices.Services
{
    public interface IClassroomService
    {
        Task<ClassroomResponseDto> CreateClassroomAsync(string name, int teacherUserId);
        Task<IEnumerable<Classroom>> GetAllClassroomsAsync();
        Task<Classroom> GetClassroomByIdAsync(int id);
        Task<Classroom> UpdateClassroomAsync(int id, string newName);
        Task DeleteClassroomAsync(int id);
        Task<(bool Success, string Message)> AddUserToClassroomAsync(int classroomId, string idNumber);
        Task<IEnumerable<object>?> GetUsersInClassroomAsync(int classroomId);
        Task<(bool Success, string Message)> RemoveUserFromClassroomAsync(int classroomId, string idNumber);
        Task<IEnumerable<object>> SearchUsersNotInClassroom(int classroomId, string partialIdNumber);

    }
}
