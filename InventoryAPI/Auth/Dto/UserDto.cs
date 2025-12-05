using MongoDB.Bson.Serialization.Attributes;

namespace CRUDApi.Auth.Dto
{
    public class UserDto
    {
        [BsonElement("Username")]
        public string? Username { get; set; }
        [BsonElement("Password")]
        public string? Password { get; set; }
    }
}
