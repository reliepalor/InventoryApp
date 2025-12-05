using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace CRUDApi.Auth.Models
{
    [BsonIgnoreExtraElements]
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("Username")]
        public string? Username { get; set; } = string.Empty;
        [BsonElement("Password")]
        public string? Password { get; set; } = string.Empty;
        [BsonElement("token")]
        public string? token { get; set; } = string.Empty;
        [BsonElement("verifiedToken")]
        public string? verifiedToken { get; set; } = null;
        [BsonElement("admin")]
        public bool admin { get; set; } = false;



    }
}
