using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.RegularExpressions;
using CRUDApi.Auth.Dto;
using CRUDApi.Auth.Models;
using CRUDApi.Auth.Interfaces;

namespace CRUDApi.Auth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<ActionResult<TokenResponseDto>> Login([FromBody] UserDto request)
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
                return BadRequest("Invalid Username or password");

            Response.Cookies.Append("AuthToken", result.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddMinutes(30)
            });

            return Ok(result);
        }
        [HttpGet("isAdmin")]
        public async Task<ActionResult> IsAdmin()
        {
            var isAdminClaim = User.FindFirst("isAdmin")?.Value;
            if (bool.TryParse(isAdminClaim, out var isAdmin))
            {
                return Ok(isAdmin);
            }
            return BadRequest("Invalid IsAdmin Claim");
        }
        [HttpGet("getUserByID")]
        [Authorize]
        public async Task<ActionResult> GetUserByID()
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _authService.GetUserInfoAsync(id);
            if (user is null)
                return BadRequest("User not found.");

            return Ok(new
            {
                id = user.Id,
                name = user.Username,
            });
        }
        [HttpPost("Register")]
        public async Task<ActionResult> CreateUserDto([FromBody] CreateUserDto createUserDto)
        {
            createUserDto.Username = Regex.Replace(createUserDto.Username, "\\s+", "");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUsername = await _authService.GetUserByUsernameAsync(createUserDto.Username);
            if (existingUsername != null)
            {
                return BadRequest("Username already exists.");
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);

            var created = await _authService.CreateUserAsync(createUserDto.Username, hashedPassword);

            return CreatedAtAction(nameof(GetUserByID), new { id = created.Id }, new
            {
                id = created.Id,
                username = created.Username,
                createdAt = DateTime.UtcNow
            });
        }
        [HttpDelete("DeleteUserByIdAsync/{Id}")]
        [Authorize]
        public async Task<ActionResult> DeleteUserByIdAsync(string Id)
        {
            var isAdminClaim = User.FindFirst("isAdmin")?.Value;
            if (!bool.TryParse(isAdminClaim, out var isAdmin) || !isAdmin)
            {
                return Forbid();
            }

            await _authService.DeleteUserByIdAsync(Id);
            return Ok(new { Id });
        }
        [HttpPut("UpdateUserByIDAsync/{id}")]
        [Authorize]
        public async Task<ActionResult> UpdateUserByIDAsync(string id, [FromBody] User updatedUser)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdminClaim = User.FindFirst("isAdmin")?.Value;
            bool.TryParse(isAdminClaim, out var isAdmin);

            if (!isAdmin && userIdClaim != id)
            {
                return Forbid();
            }

            var user = await _authService.UpdateUserByIDAsync(id, updatedUser);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                updatedAt = DateTime.UtcNow
            });
        }
        [HttpGet("GetUsers")]
        [Authorize]
        public async Task<ActionResult> GetUsersAsync()
        {
            var isAdminClaim = User.FindFirst("isAdmin")?.Value;
            if (!bool.TryParse(isAdminClaim, out var isAdmin) || !isAdmin)
            {
                return Forbid();
            }
            var users = await _authService.GetUsersAsync();
            return Ok(users);
        }
    }
}
