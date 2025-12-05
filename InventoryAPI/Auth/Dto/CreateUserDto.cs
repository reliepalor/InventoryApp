using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace CRUDApi.Auth.Dto
{
    public class CreateUserDto
    {
        [Required, MaxLength(30)]
        public string? Username { get; set; }
        [Required, MaxLength(16)]
        public string? Password { get; set; }
    }
}
