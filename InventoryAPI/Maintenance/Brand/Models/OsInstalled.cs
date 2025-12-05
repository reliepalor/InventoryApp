using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class OsInstalled
    {
        [Key]
        [BsonId]
        public int id { get; set; }
        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }
        [Required]
        [BsonElement("osName")]
        public string? osName { get; set; }
        [Required]
        [BsonElement("osVersion")]
        public string? osVersion { get; set; }
        [Required]
        [BsonElement("osType")]
        public string? osType { get; set; }

        public DateTime created_at { get; set; }

        public DateTime updated_at { get; set; }
    }
}
