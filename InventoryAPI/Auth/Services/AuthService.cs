using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using CRUDApi.Auth.Dto;
using CRUDApi.Auth.Models;
using CRUDApi.Auth.Interfaces;
using CRUDApi.Auth.Repository;

namespace CRUDApi.Auth.Services
{
    public class AuthService : GenericRepository<User>, IAuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IMongoDatabase database, IConfiguration configuration) : base(database, "Users")
        {
            _configuration = configuration;
        }

        public async Task<IEnumerable<User>> GetUsersAsync()
        {
            var users = await _collection.Find(user => true).ToListAsync();
            return users;
        }

        public async Task<TokenResponseDto?> LoginAsync(UserDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return null;

            var user = await _collection.Find(u => u.Username == request.Username).FirstOrDefaultAsync();
            if (user == null)
                return null;

            bool validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            if (!validPassword)
                return null;

            return await CreateTokenResponse(user);
        }
        private async Task<TokenResponseDto> CreateTokenResponse(User? user)
        {
            return new TokenResponseDto { Token = CreateToken(user) };
        }
        private string CreateToken(User user)
        {
            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim("isAdmin", user.admin.ToString()),
                };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: _configuration.GetValue<string>("AppSettings:Issuer"),
                audience: _configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
        public async Task<User> GetUserInfoById(string id)
        {
            string idString = id.Trim().Trim('"');
            var filter = Builders<User>.Filter.Eq("_id", ObjectId.Parse(idString));
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<User> GetUserInfoAsync(string id)
        {
            return await GetUserInfoById(id);
        }

        public async Task<User> CreateUserAsync(string Username, string Password)
        {
            var user = new User
            {
                Username = Username,
                Password = Password
            };

            await Create(user);
            return user;
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _collection.Find(u => u.Username == username).FirstOrDefaultAsync();
        }

        public async Task<User> DeleteUserByIdAsync(string Id)
        {
            string idString = Id.Trim().Trim('"');
            var filter = Builders<User>.Filter.Eq("_id", ObjectId.Parse(idString));
            return await _collection.FindOneAndDeleteAsync(filter);
        }

        public async Task<User> UpdateUserByIDAsync(string Id, User updatedUser)
        {
            string idString = Id.Trim().Trim('"');
            var filter = Builders<User>.Filter.Eq("_id", ObjectId.Parse(idString));

            updatedUser.Id = idString;

            if (!string.IsNullOrEmpty(updatedUser.Password) && !updatedUser.Password.StartsWith("$2"))
            {
                updatedUser.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
            }

            await _collection.ReplaceOneAsync(filter, updatedUser);
            return updatedUser;
        }

    }
}
