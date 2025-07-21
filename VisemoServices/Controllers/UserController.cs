using Microsoft.AspNetCore.Mvc;
using VisemoServices.Model;
using VisemoServices.Services;
using VisemoServices.Dtos.User;

namespace VisemoServices.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userServices;
        private readonly IWebHostEnvironment _env;
        private readonly IAuthTokenService _authTokenService;

        public UserController(IUserServices userServices, IAuthTokenService authTokenService, IWebHostEnvironment env)
        {
            _userServices = userServices;
            _authTokenService = authTokenService;
            _env = env;
        }

        [HttpPost("signup")]
        [Consumes("application/json")]
        public async Task<IActionResult> SignUp([FromBody] UserSignupDto userDto)
        {
            try
            {
                var newUser = await _userServices.SignUp(userDto, _env);
                return Ok(newUser);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login/student")]
        public async Task<IActionResult> StudentLogin([FromBody] LoginDto login)
        {
            var user = await _userServices.Login(login.Email, login.Password);
            if (user == null || user.role != "Student")
            {
                return Unauthorized("Invalid student credentials");
            }

            var token = _authTokenService.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.firstName,
                    user.lastName,
                    user.middleInitial,
                    user.idNumber,
                    //user.idImage,
                    user.role
                }
            });
        }

        [HttpPost("login/teacher")]
        public async Task<IActionResult> TeacherLogin([FromBody] LoginDto login)
        {
            var user = await _userServices.Login(login.Email, login.Password);
            if (user == null || user.role != "Teacher")
            {
                return Unauthorized("Invalid teacher credentials");
            }

            var token = _authTokenService.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.firstName,
                    user.lastName,
                    user.middleInitial,
                    user.idNumber,
                    //user.idImage,
                    user.role
                }
            });
        }




        [HttpGet("CheckUser")]
        public async Task<IActionResult> CheckUser([FromQuery] int userId)
        {
            var user = await _userServices.CheckUser(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { message = "User exists", user });
        }
    }
}
