﻿using Microsoft.AspNetCore.Mvc;
using VisemoServices.Services;
using VisemoServices.Dtos.Activity;
using VisemoAlgorithm.Services;

namespace VisemoServices.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpPost("CreateActivity")]
        public async Task<IActionResult> Create([FromBody] CreateActivityDto dto)
        {
            var activity = await _activityService.CreateActivityAsync(dto.ClassroomId, dto.Name, dto.Timer, dto.Instruction);
            return Ok(activity);
        }

        [HttpDelete("DeleteActivity")]
        public async Task<IActionResult> Delete(int id)
        {
            await _activityService.DeleteActivityAsync(id);
            return NoContent();
        }

        [HttpGet("GetActivities")]
        public async Task<IActionResult> GetByClassroom(int classroomId)
        {
            var activities = await _activityService.GetActivitiesByClassroomAsync(classroomId);
            return Ok(activities);
        }

        [HttpGet("GetActivityById")]
        public async Task<IActionResult> GetActivtyById(int activityId)
        {
            var activity = await _activityService.GetActivityById(activityId);
            return Ok(activity);
        }

        [HttpPost("StartActivity")]
        public async Task<IActionResult> StartActivity([FromQuery] int activityId, [FromQuery] int userId)
        {
            var result = await _activityService.StartActivity(activityId, userId);
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        [HttpPost("StopActivity")]
        public async Task<IActionResult> StopActivity(int activityId)
        {
            var result = await _activityService.StopActivity(activityId);
            if (!result.Success) return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [HttpPost("SubmitSelfAssessment")]
        public async Task<IActionResult> SubmitSelfAssessment([FromBody] SubmitSelfAssessmentDto dto)
        {
            var result = await _activityService.SubmitSelfAssessment(dto.UserId, dto.ActivityId, dto.Reasons, dto.HasConcerns);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [HttpPost("SubmitBuild")]
        public async Task<IActionResult> SubmitBuild([FromBody] SaveBuildDto dto)
        {
            var result = await _activityService.SubmitBuild(dto.IsSuccessful, dto.UserId, dto.ActivityId);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message});
        }

        [HttpPost("SubmitStudentCode")]
        public async Task<IActionResult> SubmitStudentCode([FromBody] SubmitActivitiesDto dto)
        {
            var result = await _activityService.SubmitStudentCode(dto.Code, dto.UserId, dto.ActivityId);
            return Ok(result);
        }

        [HttpPost("GenerateReport")]
        public async Task<IActionResult> GenerateSentimentReport([FromQuery] int userId, [FromQuery] int activityId)
        {
            try
            {
                var report = await _activityService.GenerateSentimentReport(userId, activityId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while generating the report: {ex.Message}");
            }
        }

        [HttpGet("GetStudentStatus")]
        public async Task<IActionResult> GetStudentStatus([FromQuery] int userId, [FromQuery] int activityId)
        {
            bool hasSubmitted = await _activityService.GetStudentStatus(userId, activityId);
            return Ok(new { userId, activityId, hasSubmitted });
        }

        [HttpGet("GetStudentCode")]
        public async Task<IActionResult> GetCode(int userId, int activityId)
        {
            var code = await _activityService.GetCode(userId, activityId);
            if (code == null)
                return NotFound("No submitted code found for this student and activity.");

            return Ok(new { Code = code });
        }

        [HttpGet("CheckPing")]
        public async Task<IActionResult> CheckForPing([FromQuery] int userId, [FromQuery] int activityId)
        {
            var result = await _activityService.CheckForPing(userId, activityId);
            return Ok(new { pinged = result });
        }
    }
}

