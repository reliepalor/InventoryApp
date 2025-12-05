using CRUDApi.Auth.Dto;
using CRUDApi.Auth.Models;

namespace CRUDApi.Auth.Interfaces
{
    public interface IAuthService
    {
        Task<IEnumerable<User>> GetUsersAsync();
        Task<TokenResponseDto?> LoginAsync(UserDto request);
        Task<User> GetUserInfoAsync(string id);
        Task<User> CreateUserAsync(string Username, string Password);
        Task<User> GetUserByUsernameAsync(string username);
        Task<User> DeleteUserByIdAsync(string id);

        Task<User> UpdateUserByIDAsync(string id, User updatedUser);
    }
}
